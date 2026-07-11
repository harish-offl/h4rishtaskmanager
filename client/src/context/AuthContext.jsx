import { createContext, useContext, useState, useEffect } from 'react'
import { hashPassword, verifyPassword } from '../utils/crypto'

const AuthContext = createContext(null)

// Per-user localStorage helpers
function getUsers() {
  try { return JSON.parse(localStorage.getItem('arrise_users') || '{}') } catch { return {} }
}
function saveUsers(users) {
  localStorage.setItem('arrise_users', JSON.stringify(users))
}
function getSession() {
  try { return JSON.parse(localStorage.getItem('arrise_session') || 'null') } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = getSession()
    if (session) {
      const users = getUsers()
      const u = users[session.username]
      if (u) setUser({ id: session.username, name: u.name, username: session.username, themePreference: u.themePreference || 'dark', dailyGoal: u.dailyGoal || 3 })
    }
    setLoading(false)
  }, [])

  const register = async (name, username, password) => {
    const users = getUsers()
    const key = username.toLowerCase()
    if (users[key]) throw new Error('Username already taken')
    if (password.length < 6) throw new Error('Password must be at least 6 characters')
    const hash = await hashPassword(password)
    users[key] = { name, username: key, passwordHash: hash, themePreference: 'dark', dailyGoal: 3, createdAt: Date.now() }
    saveUsers(users)
    // Seed default habits
    const habitsKey = `arrise_habits_${key}`
    if (!localStorage.getItem(habitsKey)) {
      const defaults = ['Wake up early','Drink water','Study','Agency work','Client follow-up','Exercise','Reading','Sleep on time']
      localStorage.setItem(habitsKey, JSON.stringify(defaults.map((name, i) => ({ id: `h${i}`, name, order: i }))))
    }
    const u = { id: key, name, username: key, themePreference: 'dark', dailyGoal: 3 }
    localStorage.setItem('arrise_session', JSON.stringify({ username: key }))
    setUser(u)
    return u
  }

  const login = async (username, password) => {
    const users = getUsers()
    const key = username.toLowerCase()
    const u = users[key]
    if (!u) throw new Error('Invalid username or password')
    const valid = await verifyPassword(password, u.passwordHash)
    if (!valid) throw new Error('Invalid username or password')
    const userData = { id: key, name: u.name, username: key, themePreference: u.themePreference || 'dark', dailyGoal: u.dailyGoal || 3 }
    localStorage.setItem('arrise_session', JSON.stringify({ username: key }))
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('arrise_session')
    setUser(null)
  }

  const updateUser = (updates) => {
    const users = getUsers()
    const key = user.username
    if (updates.username && updates.username !== key) {
      const newKey = updates.username.toLowerCase()
      if (users[newKey]) throw new Error('Username already taken')
      users[newKey] = { ...users[key], ...updates, username: newKey }
      delete users[key]
      // Migrate data keys
      const dataKeys = ['tasks','habits','notes','streak']
      dataKeys.forEach(k => {
        const val = localStorage.getItem(`arrise_${k}_${key}`)
        if (val) { localStorage.setItem(`arrise_${k}_${newKey}`, val); localStorage.removeItem(`arrise_${k}_${key}`) }
      })
      localStorage.setItem('arrise_session', JSON.stringify({ username: newKey }))
    } else {
      users[key] = { ...users[key], ...updates }
    }
    saveUsers(users)
    setUser(u => ({ ...u, ...updates }))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
