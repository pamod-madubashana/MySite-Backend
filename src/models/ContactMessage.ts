import mongoose, { Document, Schema } from 'mongoose';

export type ContactMessageStatus = 'new' | 'read' | 'replied';

export interface IContactReply {
  subject: string;
  body: string;
  includeOriginal: boolean;
  sentAt: Date;
  sentBy: 'admin';
  toEmail: string;
}

export interface IContactMessage extends Document {
  name: string;
  email: string;
  message: string;
  ip: string;
  userAgent: string;
  status: ContactMessageStatus;
  replies: IContactReply[];
  lastRepliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const contactReplySchema = new Schema<IContactReply>(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    includeOriginal: {
      type: Boolean,
      default: true,
    },
    sentAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    sentBy: {
      type: String,
      enum: ['admin'],
      required: true,
      default: 'admin',
    },
    toEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
  },
  {
    _id: false,
  }
);

const contactMessageSchema = new Schema<IContactMessage>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: 2000,
    },
    ip: {
      type: String,
      default: '',
      maxlength: 128,
    },
    userAgent: {
      type: String,
      default: '',
      maxlength: 512,
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied'],
      default: 'new',
    },
    replies: {
      type: [contactReplySchema],
      default: [],
    },
    lastRepliedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IContactMessage>('ContactMessage', contactMessageSchema);
