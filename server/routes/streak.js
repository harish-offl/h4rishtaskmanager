const router = require('express').Router()
const auth = require('../middleware/auth')
const Streak = require('../models/Streak')

router.get('/', auth, async (req, res) => {
  try {
    let streak = await Streak.findOne({ userId: req.userId })
    if (!streak) streak = await Streak.create({ userId: req.userId })
    res.json(streak)
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
