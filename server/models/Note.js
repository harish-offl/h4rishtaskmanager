const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: '' },
  content: { type: String, default: '' },
  color: { type: String, default: 'cyan' },
  isStarred: { type: Boolean, default: false },
}, { timestamps: true })

noteSchema.index({ userId: 1 })

module.exports = mongoose.model('Note', noteSchema)
