import mongoose, { Document, Schema } from 'mongoose';

export interface ITechStackCategory extends Document {
  title: string;
  icon: string;
  skills: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const techStackCategorySchema = new Schema<ITechStackCategory>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100
  },
  icon: {
    type: String,
    required: [true, 'Icon is required'],
    trim: true,
    maxlength: 50
  },
  skills: [{
    type: String,
    required: [true, 'Skills are required'],
    trim: true,
    maxlength: 100
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for ordering
techStackCategorySchema.index({ order: 1 });

export default mongoose.model<ITechStackCategory>('TechStackCategory', techStackCategorySchema);