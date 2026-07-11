const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  date: { type: String, required: true }, // YYYY-MM-DD
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  category: { type: String, default: 'Personal' },
  dueTime: { type: String, default: '' },
  completedAt: { type: Date, default: null },
}, { timestamps: true })

taskSchema.index({ userId: 1, date: 1 })

module.exports = mongoose.model('Task', taskSchema)
