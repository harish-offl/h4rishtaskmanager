const router = require('express').Router()
const auth = require('../middleware/auth')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

// PATCH /api/settings
router.patch('/', auth, async (req, res) => {
  try {
    const { name, username, password, themePreference, dailyGoal } = req.body
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (name) user.name = name
    if (username) {
      const exists = await User.findOne({ username: username.toLowerCase(), _id: { $ne: req.userId } })
      if (exists) return res.status(409).json({ message: 'Username already taken' })
      user.username = username.toLowerCase()
    }
    if (password) {
      if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })
      user.passwordHash = await bcrypt.hash(password, 12)
    }
    if (themePreference) user.themePreference = themePreference
    if (dailyGoal !== undefined) user.dailyGoal = dailyGoal

    await user.save()
    res.json({ id: user._id, name: user.name, username: user.username, themePreference: user.themePreference, dailyGoal: user.dailyGoal })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
