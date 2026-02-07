"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyToContactMessage = exports.updateContactMessageStatus = exports.getContactMessages = exports.submitContactMessage = void 0;
const express_validator_1 = require("express-validator");
const nodemailer_1 = __importDefault(require("nodemailer"));
const ContactMessage_1 = __importDefault(require("../models/ContactMessage"));
const CONTACT_MAX_NAME_LENGTH = 80;
const CONTACT_MAX_EMAIL_LENGTH = 254;
const CONTACT_MAX_MESSAGE_LENGTH = 2000;
const REPLY_MIN_SUBJECT_LENGTH = 3;
const REPLY_MAX_SUBJECT_LENGTH = 140;
const REPLY_MIN_BODY_LENGTH = 5;
const REPLY_MAX_BODY_LENGTH = 5000;
let cachedTransporter = null;
let cachedTransportUser = '';
let cachedTransportPass = '';
const getValidationError = (req) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (errors.isEmpty()) {
        return null;
    }
    const [firstError] = errors.array();
    return firstError.msg;
};
const sanitizeSingleLine = (input, maxLength) => {
    const noControlChars = input.replace(/[\u0000-\u001F\u007F]/g, ' ');
    const collapsed = noControlChars.replace(/\s+/g, ' ').trim();
    return collapsed.slice(0, maxLength);
};
const sanitizeMessage = (input) => {
    const normalized = input.replace(/\r\n/g, '\n').replace(/\u0000/g, '');
    return normalized.trim().slice(0, CONTACT_MAX_MESSAGE_LENGTH);
};
const sanitizeReplyBody = (input) => {
    const normalized = input.replace(/\r\n/g, '\n').replace(/\u0000/g, '');
    return normalized.trim().slice(0, REPLY_MAX_BODY_LENGTH);
};
const escapeHtml = (value) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
const textToHtml = (value) => escapeHtml(value).replace(/\n/g, '<br />');
const getRequestIp = (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
        return forwarded.split(',')[0].trim().slice(0, 128);
    }
    if (Array.isArray(forwarded) && forwarded.length > 0) {
        return String(forwarded[0]).trim().slice(0, 128);
    }
    return sanitizeSingleLine(req.ip || '', 128);
};
const getTransporter = (user, pass) => {
    if (cachedTransporter && cachedTransportUser === user && cachedTransportPass === pass) {
        return cachedTransporter;
    }
    cachedTransportUser = user;
    cachedTransportPass = pass;
    cachedTransporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user,
            pass,
        },
    });
    return cachedTransporter;
};
const serializeMessage = (message) => ({
    id: message._id.toString(),
    name: message.name,
    email: message.email,
    message: message.message,
    status: message.status,
    ip: message.ip,
    userAgent: message.userAgent,
    lastRepliedAt: message.lastRepliedAt || null,
    replies: (message.replies || []).map((reply) => ({
        subject: reply.subject,
        body: reply.body,
        includeOriginal: reply.includeOriginal,
        sentAt: reply.sentAt,
        sentBy: reply.sentBy,
        toEmail: reply.toEmail,
    })),
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
});
const sendContactEmails = async (params) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const sendAsEmail = process.env.SEND_AS_EMAIL;
    const sendAsName = process.env.SEND_AS_NAME;
    const appPassword = process.env.GOOGLE_APP_PASSWORD;
    if (!adminEmail || !sendAsEmail || !sendAsName || !appPassword) {
        throw new Error('Contact email environment variables are not fully configured');
    }
    const transporter = getTransporter(adminEmail, appPassword);
    const fromAddress = `"${sendAsName}" <${sendAsEmail}>`;
    const messageExcerpt = params.message.length > 200 ? `${params.message.slice(0, 197)}...` : params.message;
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
const sendAdminReplyEmail = async (params) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const sendAsEmail = process.env.SEND_AS_EMAIL;
    const sendAsName = process.env.SEND_AS_NAME;
    const appPassword = process.env.GOOGLE_APP_PASSWORD;
    if (!adminEmail || !sendAsEmail || !sendAsName || !appPassword) {
        throw new Error('Reply email environment variables are not fully configured');
    }
    const transporter = getTransporter(adminEmail, appPassword);
    const fromAddress = `"${sendAsName}" <${sendAsEmail}>`;
    const safeName = sanitizeSingleLine(params.toName, CONTACT_MAX_NAME_LENGTH) || 'there';
    const safeReplyBody = sanitizeReplyBody(params.body);
    const safeOriginalMessage = sanitizeMessage(params.originalMessage);
    const originalSentAt = params.originalSentAt.toISOString();
    const textParts = [`Hi ${safeName},`, '', safeReplyBody];
    if (params.includeOriginal) {
        textParts.push('', '--- Original message ---', `Sent: ${originalSentAt}`, safeOriginalMessage);
    }
    textParts.push('', 'Best regards,', sendAsName);
    const originalBlockHtml = params.includeOriginal
        ? `
      <hr style="border:none;border-top:1px solid #d1d5db;margin:24px 0;" />
      <p style="margin:0 0 8px 0;font-size:13px;color:#6b7280;">Original message (${escapeHtml(originalSentAt)})</p>
      <blockquote style="margin:0;padding:12px 14px;background:#f3f4f6;border-left:4px solid #9ca3af;color:#111827;white-space:pre-wrap;">${textToHtml(safeOriginalMessage)}</blockquote>
    `
        : '';
    const html = `
    <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#111827;">
      <p style="margin:0 0 12px 0;">Hi ${escapeHtml(safeName)},</p>
      <div style="margin:0 0 12px 0;white-space:pre-wrap;">${textToHtml(safeReplyBody)}</div>
      ${originalBlockHtml}
      <p style="margin:20px 0 0 0;">Best regards,<br />${escapeHtml(sendAsName)}</p>
    </div>
  `;
    await transporter.sendMail({
        from: fromAddress,
        to: sanitizeSingleLine(params.toEmail, CONTACT_MAX_EMAIL_LENGTH).toLowerCase(),
        subject: sanitizeSingleLine(params.subject, REPLY_MAX_SUBJECT_LENGTH),
        text: textParts.join('\n'),
        html,
        replyTo: adminEmail,
    });
};
exports.submitContactMessage = [
    (0, express_validator_1.body)('name')
        .isString()
        .withMessage('Name is required')
        .trim()
        .isLength({ min: 2, max: CONTACT_MAX_NAME_LENGTH })
        .withMessage('Name must be between 2 and 80 characters'),
    (0, express_validator_1.body)('email')
        .isString()
        .withMessage('Email is required')
        .trim()
        .isLength({ max: CONTACT_MAX_EMAIL_LENGTH })
        .withMessage('Email is too long')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail({ gmail_remove_dots: false }),
    (0, express_validator_1.body)('message')
        .isString()
        .withMessage('Message is required')
        .trim()
        .isLength({ min: 10, max: CONTACT_MAX_MESSAGE_LENGTH })
        .withMessage('Message must be between 10 and 2000 characters'),
    (0, express_validator_1.body)('company')
        .optional({ values: 'falsy' })
        .isString()
        .withMessage('Invalid form submission')
        .isLength({ max: 120 })
        .withMessage('Invalid form submission'),
    async (req, res) => {
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
            const savedMessage = await ContactMessage_1.default.create({
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
            }
            catch (emailError) {
                console.error('Contact email sending failed:', emailError);
            }
            return res.status(200).json({ ok: true });
        }
        catch (error) {
            console.error('Contact message save failed:', error);
            return res.status(500).json({ ok: false, error: 'Unable to send message right now' });
        }
    },
];
const getContactMessages = async (req, res) => {
    try {
        const messages = await ContactMessage_1.default.find().sort({ createdAt: -1 }).exec();
        return res.status(200).json({
            ok: true,
            messages: messages.map(serializeMessage),
        });
    }
    catch (error) {
        console.error('Failed to fetch contact messages:', error);
        return res.status(500).json({ ok: false, error: 'Failed to load messages' });
    }
};
exports.getContactMessages = getContactMessages;
exports.updateContactMessageStatus = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid message id'),
    (0, express_validator_1.body)('status')
        .isString()
        .withMessage('Status is required')
        .isIn(['new', 'read', 'replied'])
        .withMessage('Status must be new, read, or replied'),
    async (req, res) => {
        const validationError = getValidationError(req);
        if (validationError) {
            return res.status(400).json({ ok: false, error: validationError });
        }
        try {
            const updated = await ContactMessage_1.default.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
            if (!updated) {
                return res.status(404).json({ ok: false, error: 'Message not found' });
            }
            return res.status(200).json({ ok: true, message: serializeMessage(updated) });
        }
        catch (error) {
            console.error('Failed to update contact message status:', error);
            return res.status(500).json({ ok: false, error: 'Failed to update message status' });
        }
    },
];
exports.replyToContactMessage = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid message id'),
    (0, express_validator_1.body)('subject')
        .isString()
        .withMessage('Subject is required')
        .trim()
        .isLength({ min: REPLY_MIN_SUBJECT_LENGTH, max: REPLY_MAX_SUBJECT_LENGTH })
        .withMessage('Subject must be between 3 and 140 characters'),
    (0, express_validator_1.body)('body')
        .isString()
        .withMessage('Message body is required')
        .trim()
        .isLength({ min: REPLY_MIN_BODY_LENGTH, max: REPLY_MAX_BODY_LENGTH })
        .withMessage('Message body must be between 5 and 5000 characters'),
    (0, express_validator_1.body)('includeOriginal')
        .optional()
        .isBoolean()
        .withMessage('includeOriginal must be a boolean'),
    async (req, res) => {
        const validationError = getValidationError(req);
        if (validationError) {
            return res.status(400).json({ ok: false, error: validationError });
        }
        const subject = sanitizeSingleLine(String(req.body.subject || ''), REPLY_MAX_SUBJECT_LENGTH);
        const replyBody = sanitizeReplyBody(String(req.body.body || ''));
        const includeOriginal = req.body.includeOriginal === undefined ? true : Boolean(req.body.includeOriginal);
        if (subject.length < REPLY_MIN_SUBJECT_LENGTH || replyBody.length < REPLY_MIN_BODY_LENGTH) {
            return res.status(400).json({ ok: false, error: 'Please provide a valid subject and message' });
        }
        try {
            const message = await ContactMessage_1.default.findById(req.params.id).exec();
            if (!message) {
                return res.status(404).json({ ok: false, error: 'Message not found' });
            }
            try {
                await sendAdminReplyEmail({
                    toEmail: message.email,
                    toName: message.name,
                    subject,
                    body: replyBody,
                    includeOriginal,
                    originalMessage: message.message,
                    originalSentAt: message.createdAt,
                });
            }
            catch (emailError) {
                console.error('Reply email sending failed:', emailError);
                return res.status(502).json({ ok: false, error: 'Failed to send email' });
            }
            const sentAt = new Date();
            message.replies.push({
                subject,
                body: replyBody,
                includeOriginal,
                sentAt,
                sentBy: 'admin',
                toEmail: message.email,
            });
            message.status = 'replied';
            message.lastRepliedAt = sentAt;
            await message.save();
            return res.status(200).json({ ok: true, message: serializeMessage(message) });
        }
        catch (error) {
            console.error('Failed to send message reply:', error);
            return res.status(500).json({ ok: false, error: 'Failed to send reply' });
        }
    },
];
//# sourceMappingURL=contactController.js.map