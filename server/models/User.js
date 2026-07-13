const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  passwordHash: { type: String },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  googleId: { type: String, unique: true, sparse: true },
  profilePicture: { type: String, default: '' },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  emailVerified: { type: Boolean, default: false },
  role: {
    type: String,
    enum: ['admin', 'manager', 'designer', 'video-editor', 'content-creator', 'developer', 'social-media-manager', 'team-member'],
    default: 'team-member'
  },
  department: {
    type: String,
    enum: ['management', 'design', 'video', 'content', 'development', 'social-media', 'marketing', 'general'],
    default: 'general'
  },
  isApproved: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  themePreference: { type: String, enum: ['dark', 'light'], default: 'dark' },
  dailyGoal: { type: Number, default: 3 }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)
