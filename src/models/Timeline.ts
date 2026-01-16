import mongoose, { Document, Schema } from 'mongoose';

export interface ITimeline extends Document {
  year: string;
  role: string;
  company: string;
  description: string;
  icon: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const timelineSchema = new Schema<ITimeline>({
  year: {
    type: String,
    required: [true, 'Year is required'],
    trim: true,
    maxlength: 50
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true,
    maxlength: 100
  },
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: 1000
  },
  icon: {
    type: String,
    required: [true, 'Icon is required'],
    trim: true,
    maxlength: 50
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for ordering
timelineSchema.index({ order: 1 });

export default mongoose.model<ITimeline>('Timeline', timelineSchema);