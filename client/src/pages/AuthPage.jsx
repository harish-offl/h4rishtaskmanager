import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null)

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  const showMsg = (text, type = 'error') => setMsg({ text, type })
  const clearMsg = () => setMsg(null)

  const submit = async (e) => {
    e.preventDefault()
    clearMsg()
    setLoading(true)
    try {
      if (mode === 'login') await login(form.username, form.password)
      else await register(form.name, form.username, form.password)
    } catch (err) {
      showMsg(err.message)
    } finally {
      setLoading(false)
    }
  }


  const handleForgot = (e) => {
    e.preventDefault()
    if (!form.username) {
      showMsg('Enter your username above first, then click "Forgot?"')
      return
    }
    showMsg('Password recovery is not available for local accounts. Create a new account instead.', 'info')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F3F3F1',
      backgroundImage: 'linear-gradient(#E3E3E3 1px, transparent 1px), linear-gradient(90deg, #E3E3E3 1px, transparent 1px)',
      backgroundSize: '28px 28px',
      backgroundPosition: '-1px -1px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: '#1F1F1F',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20
        }}>
          <svg viewBox="0 0 24 24" fill="none" width={16} height={16}>
            <path d="M12 2L3 7v6c0 5 4 8.5 9 9 5-.5 9-4 9-9V7l-9-5z" fill="#fff" />
          </svg>
        </div>

        <h1 style={{ fontFamily: '"Iowan Old Style", Georgia, serif', fontSize: 26, fontWeight: 600, letterSpacing: '-0.01em', margin: '0 0 6px', color: '#1c1b1a' }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={{ fontSize: 14, color: '#726c63', margin: '0 0 28px' }}>
          {mode === 'login'
            ? <>Sign in to continue to Arrise Business Tracker.</>
            : <>Join the Arrise Digital team workspace.</>}
        </p>

        <div style={{
          background: '#fff',
          border: '1px solid #E3E3E3',
          borderRadius: 4,
          padding: '36px 32px 28px',
          boxShadow: '0 1px 2px rgba(28,27,26,0.04), 0 12px 32px -16px rgba(28,27,26,0.12)'
        }}>

          {msg && (
            <div style={{
              fontSize: 13, padding: '10px 12px', borderRadius: 3, marginBottom: 16,
              background: msg.type === 'info' ? '#e7efec' : '#fbeae5',
              color: msg.type === 'info' ? '#2f5d50' : '#b3432b',
              border: `1px solid ${msg.type === 'info' ? '#cfe1da' : '#f0cdc2'}`
            }}>
              {msg.text}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {mode === 'register' && (
              <div>
                <label style={labelStyle}>Full Name</label>
                <input style={inputStyle} placeholder="Your full name" value={form.name} onChange={f('name')} required />
              </div>
            )}

            <div>
              <label style={labelStyle}>Username</label>
              <input style={inputStyle} placeholder="your_username" value={form.username} onChange={f('username')} required autoComplete="username" />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                {mode === 'login' && (
                  <a href="#" onClick={handleForgot} style={{ fontSize: 13, color: '#2f5d50', textDecoration: 'none' }}
                    onMouseOver={e => e.target.style.textDecoration = 'underline'}
                    onMouseOut={e => e.target.style.textDecoration = 'none'}>
                    Forgot?
                  </a>
                )}
              </div>
              <input style={inputStyle} type="password" placeholder="Enter password" value={form.password} onChange={f('password')} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </div>

            <button type="submit" disabled={loading} style={primaryBtnStyle(loading)}>
              {loading ? (mode === 'login' ? 'Signing in...' : 'Creating...') : (mode === 'login' ? 'Sign in' : 'Create Account')}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0', color: '#726c63', fontSize: 12 }}>
            <div style={{ flex: 1, height: 1, background: '#E3E3E3' }} />
            OR
            <div style={{ flex: 1, height: 1, background: '#E3E3E3' }} />
          </div>

          <div style={{ width: '100%' }}>
            <p style={{ fontSize: 13, color: '#726c63', textAlign: 'center', margin: '0' }}>
              Local accounts are used for this standalone experience.
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#726c63' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <a href="#"
            onClick={e => { e.preventDefault(); clearMsg(); setMode(mode === 'login' ? 'register' : 'login') }}
            style={{ color: '#2f5d50', fontWeight: 600, textDecoration: 'none' }}
            onMouseOver={e => e.target.style.textDecoration = 'underline'}
            onMouseOut={e => e.target.style.textDecoration = 'none'}>
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </a>
        </p>
      </div>
    </div>
  )
}

const labelStyle = {
  fontSize: 12, fontWeight: 600, letterSpacing: '0.02em',
  textTransform: 'uppercase', color: '#726c63',
  display: 'block', marginBottom: 6
}

const inputStyle = {
  width: '100%', padding: '11px 12px',
  border: '1px solid #E3E3E3', borderRadius: 3,
  fontSize: 15, fontFamily: 'inherit', color: '#1c1b1a',
  background: '#fff', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color .15s ease, box-shadow .15s ease'
}

const primaryBtnStyle = (disabled) => ({
  width: '100%', padding: 12, marginTop: 6,
  background: disabled ? '#555' : '#1F1F1F',
  color: '#fff', border: 'none', borderRadius: 3,
  fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.6 : 1,
  transition: 'background .15s ease'
})

