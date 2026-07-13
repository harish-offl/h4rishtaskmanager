import { createContext, useContext, useState, useEffect } from 'react'
import { hashPassword, verifyPassword } from '../utils/crypto'
import api from '../api/axios'

const AuthContext = createContext(null)
const SESSION_KEY = 'arrise_auth'
const TOKEN_KEY = 'arrise_token'

function getUsers() {
  try { return JSON.parse(localStorage.getItem('arrise_users') || '{}') } catch { return {} }
}
function saveUsers(users) {
  localStorage.setItem('arrise_users', JSON.stringify(users))
}
function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}
function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(TOKEN_KEY)
}
function saveToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = getSession()
    if (session) {
      if (session.token) {
        saveToken(session.token)
        setUser(session.user)
      } else if (session.username) {
        const users = getUsers()
        const u = users[session.username]
        if (u) setUser({ id: session.username, name: u.name, username: session.username, themePreference: u.themePreference || 'dark', dailyGoal: u.dailyGoal || 3 })
        saveToken(null)
      }
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

    const habitsKey = `arrise_habits_${key}`
    if (!localStorage.getItem(habitsKey)) {
      const defaults = ['Wake up early','Drink water','Study','Agency work','Client follow-up','Exercise','Reading','Sleep on time']
      localStorage.setItem(habitsKey, JSON.stringify(defaults.map((name, i) => ({ id: `h${i}`, name, order: i }))))
    }

    const u = { id: key, name, username: key, themePreference: 'dark', dailyGoal: 3 }
    saveSession({ method: 'local', username: key, user: u })
    saveToken(null)
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
    saveSession({ method: 'local', username: key, user: userData })
    saveToken(null)
    setUser(userData)
    return userData
  }

  const loginWithGoogle = async (credential) => {
    const res = await api.post('/auth/google', { credential })
    const { token, user } = res.data
    const userData = {
      ...user,
      username: user.username || user.email || user.id,
      themePreference: user.themePreference || 'dark',
      dailyGoal: user.dailyGoal || 3
    }
    saveToken(token)
    saveSession({ method: 'google', token, user: userData })
    setUser(userData)
    return userData
  }

  const logout = () => {
    clearSession()
    setUser(null)
  }

  const updateUser = (updates) => {
    const users = getUsers()
    const key = user?.username
    if (!key) throw new Error('No user logged in')

    if (updates.username && updates.username !== key) {
      const newKey = updates.username.toLowerCase()
      if (users[newKey]) throw new Error('Username already taken')
      users[newKey] = { ...users[key], ...updates, username: newKey }
      delete users[key]
      const dataKeys = ['tasks','habits','notes','streak']
      dataKeys.forEach(k => {
        const val = localStorage.getItem(`arrise_${k}_${key}`)
        if (val) { localStorage.setItem(`arrise_${k}_${newKey}`, val); localStorage.removeItem(`arrise_${k}_${key}`) }
      })
      saveSession({ method: 'local', username: newKey, user: { ...user, ...updates, username: newKey } })
    } else {
      if (users[key]) users[key] = { ...users[key], ...updates }
      const session = getSession()
      if (session) saveSession({ ...session, user: { ...user, ...updates } })
    }

    saveUsers(users)
    setUser(u => ({ ...u, ...updates }))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
