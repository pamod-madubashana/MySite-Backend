import { Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import nodemailer, { Transporter } from 'nodemailer';
import ContactMessage, { IContactMessage } from '../models/ContactMessage';

const CONTACT_MAX_NAME_LENGTH = 80;
const CONTACT_MAX_EMAIL_LENGTH = 254;
const CONTACT_MAX_MESSAGE_LENGTH = 2000;

let cachedTransporter: Transporter | null = null;
let cachedTransportUser = '';
let cachedTransportPass = '';

const getValidationError = (req: Request): string | null => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return null;
  }

  const [firstError] = errors.array();
  return firstError.msg;
};

const sanitizeSingleLine = (input: string, maxLength: number): string => {
  const noControlChars = input.replace(/[\u0000-\u001F\u007F]/g, ' ');
  const collapsed = noControlChars.replace(/\s+/g, ' ').trim();
  return collapsed.slice(0, maxLength);
};

const sanitizeMessage = (input: string): string => {
  const normalized = input.replace(/\r\n/g, '\n').replace(/\u0000/g, '');
  return normalized.trim().slice(0, CONTACT_MAX_MESSAGE_LENGTH);
};

const getRequestIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];

  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim().slice(0, 128);
  }

  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return String(forwarded[0]).trim().slice(0, 128);
  }

  return sanitizeSingleLine(req.ip || '', 128);
};

const getTransporter = (user: string, pass: string): Transporter => {
  if (cachedTransporter && cachedTransportUser === user && cachedTransportPass === pass) {
    return cachedTransporter;
  }

  cachedTransportUser = user;
  cachedTransportPass = pass;
  cachedTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });

  return cachedTransporter;
};

const serializeMessage = (message: IContactMessage) => ({
  id: message._id.toString(),
  name: message.name,
  email: message.email,
  message: message.message,
  status: message.status,
  ip: message.ip,
  userAgent: message.userAgent,
  createdAt: message.createdAt,
  updatedAt: message.updatedAt,
});

const sendContactEmails = async (params: {
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const sendAsEmail = process.env.SEND_AS_EMAIL;
  const sendAsName = process.env.SEND_AS_NAME;
  const appPassword = process.env.GOOGLE_APP_PASSWORD;

  if (!adminEmail || !sendAsEmail || !sendAsName || !appPassword) {
    throw new Error('Contact email environment variables are not fully configured');
  }

  const transporter = getTransporter(adminEmail, appPassword);
  const fromAddress = `"${sendAsName}" <${sendAsEmail}>`;
  const messageExcerpt =
    params.message.length > 200 ? `${params.message.slice(0, 197)}...` : params.message;

  const adminMailText = [
    `New contact message from ${params.name}`,
    '',
    `Name: ${params.name}`,
    `Email: ${params.email}`,
    `Received: ${params.createdAt.toISOString()}`,
    '',
    'Message:',
    params.message,
  ].join('\n');

  const userMailText = [
    `Hi ${params.name},`,
    '',
    'Your message was sent successfully.',
    'Thanks for reaching out. A response will be sent as soon as possible.',
    '',
    'Message excerpt:',
    messageExcerpt,
    '',
    'Best regards,',
    'Pamod Support',
  ].join('\n');

  await Promise.all([
    transporter.sendMail({
      from: fromAddress,
      to: adminEmail,
      subject: `New contact message from ${params.name}`,
      text: adminMailText,
      replyTo: params.email,
    }),
    transporter.sendMail({
      from: fromAddress,
      to: params.email,
      subject: 'Message received',
      text: userMailText,
    }),
  ]);
};

export const submitContactMessage = [
  body('name')
    .isString()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: CONTACT_MAX_NAME_LENGTH })
    .withMessage('Name must be between 2 and 80 characters'),

  body('email')
    .isString()
    .withMessage('Email is required')
    .trim()
    .isLength({ max: CONTACT_MAX_EMAIL_LENGTH })
    .withMessage('Email is too long')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail({ gmail_remove_dots: false }),

  body('message')
    .isString()
    .withMessage('Message is required')
    .trim()
    .isLength({ min: 10, max: CONTACT_MAX_MESSAGE_LENGTH })
    .withMessage('Message must be between 10 and 2000 characters'),

  body('company')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Invalid form submission')
    .isLength({ max: 120 })
    .withMessage('Invalid form submission'),

  async (req: Request, res: Response) => {
    const validationError = getValidationError(req);
    if (validationError) {
      return res.status(400).json({ ok: false, error: validationError });
    }

    const rawName = String(req.body.name || '');
    const rawEmail = String(req.body.email || '');
    const rawMessage = String(req.body.message || '');
    const rawCompany = String(req.body.company || '');

    const company = sanitizeSingleLine(rawCompany, 120);
    if (company) {
      return res.status(400).json({ ok: false, error: 'Invalid form submission' });
    }

    const name = sanitizeSingleLine(rawName, CONTACT_MAX_NAME_LENGTH);
    const email = sanitizeSingleLine(rawEmail, CONTACT_MAX_EMAIL_LENGTH).toLowerCase();
    const message = sanitizeMessage(rawMessage);

    if (name.length < 2 || message.length < 10) {
      return res.status(400).json({ ok: false, error: 'Please provide valid contact details' });
    }

    try {
      const savedMessage = await ContactMessage.create({
        name,
        email,
        message,
        ip: getRequestIp(req),
        userAgent: sanitizeSingleLine(req.get('user-agent') || '', 512),
        status: 'new',
      });

      try {
        await sendContactEmails({
          name,
          email,
          message,
          createdAt: savedMessage.createdAt,
        });
      } catch (emailError) {
        console.error('Contact email sending failed:', emailError);
      }

      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Contact message save failed:', error);
      return res.status(500).json({ ok: false, error: 'Unable to send message right now' });
    }
  },
];

export const getContactMessages = async (req: Request, res: Response) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).exec();

    return res.status(200).json({
      ok: true,
      messages: messages.map(serializeMessage),
    });
  } catch (error) {
    console.error('Failed to fetch contact messages:', error);
    return res.status(500).json({ ok: false, error: 'Failed to load messages' });
  }
};

export const updateContactMessageStatus = [
  param('id').isMongoId().withMessage('Invalid message id'),
  body('status')
    .isString()
    .withMessage('Status is required')
    .isIn(['new', 'read'])
    .withMessage('Status must be new or read'),

  async (req: Request, res: Response) => {
    const validationError = getValidationError(req);
    if (validationError) {
      return res.status(400).json({ ok: false, error: validationError });
    }

    try {
      const updated = await ContactMessage.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ ok: false, error: 'Message not found' });
      }

      return res.status(200).json({ ok: true, message: serializeMessage(updated) });
    } catch (error) {
      console.error('Failed to update contact message status:', error);
      return res.status(500).json({ ok: false, error: 'Failed to update message status' });
    }
  },
];
