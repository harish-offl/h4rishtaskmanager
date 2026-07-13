const mongoose = require('mongoose')

const habitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  order: { type: Number, default: 0 },
}, { timestamps: true })

const habitLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  dayOfWeek: { type: String, required: true }, // Mon/Tue/...
  weekKey: { type: String, required: true }, // YYYY-MM-DD of week start
  completed: { type: Boolean, default: true },
}, { timestamps: true })

habitLogSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true })

const Habit = mongoose.model('Habit', habitSchema)
const HabitLog = mongoose.model('HabitLog', habitLogSchema)

module.exports = { Habit, HabitLog }
