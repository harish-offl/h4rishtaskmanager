const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')
const Streak = require('../models/Streak')
const { Habit } = require('../models/Habit')
const generateToken = require('../utils/generateToken')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const DEFAULT_HABITS = [
  'Wake up early', 'Drink water', 'Study', 'Agency work',
  'Client follow-up', 'Exercise', 'Reading', 'Sleep on time'
]

async function seedNewUser(userId) {
  await Streak.create({ userId })
  await Promise.all(DEFAULT_HABITS.map((name, i) => Habit.create({ userId, name, order: i })))
}

// ── POST /api/auth/google ──────────────────────────────────────────────────
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body
    if (!credential) {
      return res.status(400).json({ success: false, message: 'Google credential is required.' })
    }

    // Verify token with Google
    let payload
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      })
      payload = ticket.getPayload()
    } catch {
      return res.status(401).json({ success: false, message: 'Google authentication failed. Please try again.' })
    }

    const { sub: googleId, email, name, picture, email_verified } = payload

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account does not have a verified email.' })
    }

    if (!email_verified) {
      return res.status(403).json({ success: false, message: 'Your Google email is not verified. Please verify your Google account first.' })
    }

    // Check approved email list
    const allowedRaw = process.env.ARRISE_ALLOWED_EMAILS || ''
    const allowedEmails = allowedRaw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)

    if (allowedEmails.length > 0 && !allowedEmails.includes(email.toLowerCase())) {
      return res.status(403).json({
        success: false,
        message: 'This Google account is not approved for the Arrise Digital workspace. Please contact the administrator.'
      })
    }

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      // Create new user
      user = await User.create({
        name,
        email: email.toLowerCase(),
        googleId,
        profilePicture: picture || '',
        authProvider: 'google',
        emailVerified: true,
        role: 'team-member',
        department: 'general',
        isApproved: true,
        isActive: true,
        lastLogin: new Date()
      })
      await seedNewUser(user._id)
    } else {
      // Validate existing user
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your Arrise Digital account is currently inactive. Please contact the administrator.'
        })
      }
      if (!user.isApproved) {
        return res.status(403).json({
          success: false,
          message: 'Your account is pending approval. Please contact the administrator.'
        })
      }

      // Update fields without overwriting role/department
      if (!user.googleId) user.googleId = googleId
      if (picture && !user.profilePicture) user.profilePicture = picture
      user.emailVerified = true
      user.lastLogin = new Date()
      await user.save()
    }

    const token = generateToken(user)

    return res.json({
      success: true,
      message: 'Welcome to Arrise Digital Task Tracker',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        role: user.role,
        department: user.department,
        themePreference: user.themePreference,
        dailyGoal: user.dailyGoal
      }
    })
  } catch (err) {
    console.error('Google auth error:', err.message)
    res.status(500).json({ success: false, message: 'Authentication failed. Please try again.' })
  }
})

// ── POST /api/auth/register (local) ───────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, username, password } = req.body
    if (!name || !username || !password) return res.status(400).json({ message: 'All fields required' })
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const exists = await User.findOne({ username: username.toLowerCase() })
    if (exists) return res.status(409).json({ message: 'Username already taken' })

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ name, username: username.toLowerCase(), passwordHash, authProvider: 'local' })

    await seedNewUser(user._id)

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, username: user.username, themePreference: user.themePreference, dailyGoal: user.dailyGoal }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /api/auth/login (local) ──────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ message: 'All fields required' })

    const user = await User.findOne({ username: username.toLowerCase() })
    if (!user || !user.passwordHash) return res.status(401).json({ message: 'Invalid username or password' })

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ message: 'Invalid username or password' })

    if (!user.isActive) return res.status(403).json({ message: 'Your account is currently inactive.' })

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({
      token,
      user: { id: user._id, name: user.name, username: user.username, themePreference: user.themePreference, dailyGoal: user.dailyGoal }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/auth/me ──────────────────────────────────────────────────────
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash')
    if (!user) return res.status(404).json({ message: 'User not found' })

    res.json({
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      role: user.role,
      department: user.department,
      themePreference: user.themePreference,
      dailyGoal: user.dailyGoal,
      isActive: user.isActive,
      isApproved: user.isApproved
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
