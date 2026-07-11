const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Streak = require('../models/Streak')
const { Habit } = require('../models/Habit')

const DEFAULT_HABITS = ['Wake up early', 'Drink water', 'Study', 'Agency work', 'Client follow-up', 'Exercise', 'Reading', 'Sleep on time']

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, username, password } = req.body
    if (!name || !username || !password) return res.status(400).json({ message: 'All fields required' })
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const exists = await User.findOne({ username: username.toLowerCase() })
    if (exists) return res.status(409).json({ message: 'Username already taken' })

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ name, username: username.toLowerCase(), passwordHash })

    // Seed default habits and streak
    await Streak.create({ userId: user._id })
    await Promise.all(DEFAULT_HABITS.map((name, i) => Habit.create({ userId: user._id, name, order: i })))

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user: { id: user._id, name: user.name, username: user.username, themePreference: user.themePreference, dailyGoal: user.dailyGoal } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ message: 'All fields required' })

    const user = await User.findOne({ username: username.toLowerCase() })
    if (!user) return res.status(401).json({ message: 'Invalid username or password' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ message: 'Invalid username or password' })

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, name: user.name, username: user.username, themePreference: user.themePreference, dailyGoal: user.dailyGoal } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ id: user._id, name: user.name, username: user.username, themePreference: user.themePreference, dailyGoal: user.dailyGoal })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
