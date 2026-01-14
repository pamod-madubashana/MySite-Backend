import mongoose, { Document, Schema } from 'mongoose'

export interface IProject extends Document {
  title: string
  description: string
  techStack: string[]
  githubUrl?: string
  liveUrl?: string
  featured: boolean
  status: 'draft' | 'published'
  thumbnail?: string
  screenshots?: string[]
  createdAt: Date
  updatedAt: Date
}

const projectSchema = new Schema<IProject>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 1000
  },
  techStack: [{
    type: String,
    required: true,
    trim: true
  }],
  githubUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https:\/\/github\.com\/[a-zA-Z0-9\-_.]+\/[a-zA-Z0-9\-_.]+$/.test(v);
      },
      message: 'Please enter a valid GitHub URL'
    }
  },
  liveUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+$/.test(v);
      },
      message: 'Please enter a valid URL'
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  thumbnail: {
    type: String,
    default: ''
  },
  screenshots: [{
    type: String
  }]
}, {
  timestamps: true
})

// Index for search optimization
projectSchema.index({ title: 'text', description: 'text', techStack: 'text' })
projectSchema.index({ featured: 1, createdAt: -1 })
projectSchema.index({ status: 1, createdAt: -1 })

export default mongoose.model<IProject>('Project', projectSchema)