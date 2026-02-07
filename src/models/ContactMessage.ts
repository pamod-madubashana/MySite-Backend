import mongoose, { Document, Schema } from 'mongoose';

export type ContactMessageStatus = 'new' | 'read';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  message: string;
  ip: string;
  userAgent: string;
  status: ContactMessageStatus;
  createdAt: Date;
  updatedAt: Date;
}

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
      enum: ['new', 'read'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
);

contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IContactMessage>('ContactMessage', contactMessageSchema);
