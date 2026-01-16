import mongoose, { Document, Schema } from 'mongoose';

export interface IInterests extends Document {
  icon: string;
  label: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const interestsSchema = new Schema<IInterests>({
  icon: {
    type: String,
    required: [true, 'Icon is required'],
    trim: true,
    maxlength: 50
  },
  label: {
    type: String,
    required: [true, 'Label is required'],
    trim: true,
    maxlength: 100
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for ordering
interestsSchema.index({ order: 1 });

export default mongoose.model<IInterests>('Interests', interestsSchema);