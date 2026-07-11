const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  themePreference: { type: String, enum: ['dark', 'light'], default: 'dark' },
  dailyGoal: { type: Number, default: 3 },
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)
