const router = require('express').Router()
const auth = require('../middleware/auth')
const { Habit, HabitLog } = require('../models/Habit')

// GET /api/habits  — list user's habits
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.userId }).sort({ order: 1 })
    res.json(habits)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// POST /api/habits
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ message: 'Name required' })
    const count = await Habit.countDocuments({ userId: req.userId })
    const habit = await Habit.create({ userId: req.userId, name, order: count })
    res.status(201).json(habit)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// PATCH /api/habits/:id
router.patch('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true }
    )
    if (!habit) return res.status(404).json({ message: 'Not found' })
    res.json(habit)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// DELETE /api/habits/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Habit.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    await HabitLog.deleteMany({ habitId: req.params.id, userId: req.userId })
    res.json({ message: 'Deleted' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/habits/logs?weekKey=YYYY-MM-DD
router.get('/logs', auth, async (req, res) => {
  try {
    const { weekKey } = req.query
    const filter = { userId: req.userId }
    if (weekKey) filter.weekKey = weekKey
    const logs = await HabitLog.find(filter)
    res.json(logs)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// POST /api/habits/logs/toggle
router.post('/logs/toggle', auth, async (req, res) => {
  try {
    const { habitId, date, dayOfWeek, weekKey } = req.body
    const existing = await HabitLog.findOne({ userId: req.userId, habitId, date })
    if (existing) {
      await HabitLog.deleteOne({ _id: existing._id })
      return res.json({ toggled: false })
    }
    const log = await HabitLog.create({ userId: req.userId, habitId, date, dayOfWeek, weekKey, completed: true })
    res.status(201).json({ toggled: true, log })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
