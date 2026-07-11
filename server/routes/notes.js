const router = require('express').Router()
const auth = require('../middleware/auth')
const Note = require('../models/Note')

router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId }).sort({ isStarred: -1, updatedAt: -1 })
    res.json(notes)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.post('/', auth, async (req, res) => {
  try {
    const { title, content, color } = req.body
    const note = await Note.create({ userId: req.userId, title: title || '', content: content || '', color: color || 'cyan' })
    res.status(201).json(note)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.patch('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true }
    )
    if (!note) return res.status(404).json({ message: 'Not found' })
    res.json(note)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.delete('/:id', auth, async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    res.json({ message: 'Deleted' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
