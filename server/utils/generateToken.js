const jwt = require('jsonwebtoken')

function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      department: user.department
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

module.exports = generateToken
