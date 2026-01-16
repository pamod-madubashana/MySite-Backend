import mongoose, { Document, Schema } from 'mongoose';

export interface ITechSkill extends Document {
  name: string;
  level: number; // 0-100 percentage
  category?: string; // e.g., 'frontend', 'backend', 'database', 'devops'
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const techSkillsSchema = new Schema<ITechSkill>({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
    maxlength: 100
  },
  level: {
    type: Number,
    required: [true, 'Skill level is required'],
    min: 0,
    max: 100
  },
  category: {
    type: String,
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
techSkillsSchema.index({ order: 1 });

export default mongoose.model<ITechSkill>('TechSkill', techSkillsSchema);