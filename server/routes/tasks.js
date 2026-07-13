const router = require('express').Router()
const auth = require('../middleware/auth')
const Task = require('../models/Task')
const Streak = require('../models/Streak')
const User = require('../models/User')

// Helper: update streak after task change
async function updateStreak(userId) {
  const today = new Date().toISOString().split('T')[0]
  const user = await User.findById(userId)
  const dailyGoal = user?.dailyGoal || 1

  const todayTasks = await Task.find({ userId, date: today })
  const completedCount = todayTasks.filter(t => t.status === 'completed').length
  const goalMet = completedCount >= dailyGoal

  let streak = await Streak.findOne({ userId })
  if (!streak) streak = await Streak.create({ userId })

  if (goalMet) {
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    const yKey = yesterday.toISOString().split('T')[0]
    if (streak.lastCompletedDate === today) return streak // already counted today
    const newCurrent = streak.lastCompletedDate === yKey ? streak.currentStreak + 1 : 1
    const newBest = Math.max(newCurrent, streak.bestStreak)
    // Update history
    const histIdx = streak.history.findIndex(h => h.date === today)
    if (histIdx === -1) streak.history.push({ date: today, completed: true })
    else streak.history[histIdx].completed = true
    streak.currentStreak = newCurrent
    streak.bestStreak = newBest
    streak.lastCompletedDate = today
    await streak.save()
  }
  return streak
}

// GET /api/tasks?date=YYYY-MM-DD
router.get('/', auth, async (req, res) => {
  try {
    const { date } = req.query
    const filter = { userId: req.userId }
    if (date) filter.date = date
    const tasks = await Task.find(filter).sort({ createdAt: -1 })
    res.json(tasks)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// POST /api/tasks
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, date, priority, category, dueTime } = req.body
    if (!title || !date) return res.status(400).json({ message: 'Title and date required' })
    const task = await Task.create({ userId: req.userId, title, description, date, priority, category, dueTime })
    res.status(201).json(task)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// PATCH /api/tasks/:id
router.patch('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId })
    if (!task) return res.status(404).json({ message: 'Task not found' })
    const { title, description, status, priority, category, dueTime } = req.body
    if (title !== undefined) task.title = title
    if (description !== undefined) task.description = description
    if (priority !== undefined) task.priority = priority
    if (category !== undefined) task.category = category
    if (dueTime !== undefined) task.dueTime = dueTime
    if (status !== undefined) {
      task.status = status
      task.completedAt = status === 'completed' ? new Date() : null
    }
    await task.save()
    await updateStreak(req.userId)
    res.json(task)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// DELETE /api/tasks/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    res.json({ message: 'Deleted' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// GET /api/tasks/history?month=YYYY-MM  (returns all tasks for a month)
router.get('/history', auth, async (req, res) => {
  try {
    const { month } = req.query // e.g. 2024-05
    const tasks = await Task.find({ userId: req.userId, date: { $regex: `^${month}` } })
    res.json(tasks)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
