const mongoose = require('mongoose')

const streakSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  currentStreak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  lastCompletedDate: { type: String, default: null }, // YYYY-MM-DD
  history: [{ date: String, completed: Boolean }],
}, { timestamps: true })

module.exports = mongoose.model('Streak', streakSchema)
