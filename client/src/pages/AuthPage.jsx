import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '318268727835-ujr87r6m9gdm605as9pii1a2qe48rlvq.apps.googleusercontent.com'

export default function AuthPage() {
  const { login, register, loginWithGoogle } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState(null) // { text, type: 'error'|'info' }
  const [googleReady, setGoogleReady] = useState(false)
  const googleButtonRef = useRef(null)

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

  const handleGoogleResponse = async (response) => {
    if (!response?.credential) {
      showMsg('Google sign-in failed. Please try again.', 'error')
      return
    }

    clearMsg()
    setLoading(true)
    try {
      await loginWithGoogle(response.credential)
    } catch (err) {
      showMsg(err.response?.data?.message || err.message || 'Google login failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mode !== 'login') return

    const initializeGoogleButton = () => {
      if (window.google?.accounts?.id && googleButtonRef.current) {
        googleButtonRef.current.innerHTML = ''
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          cancel_on_tap_outside: true
        })
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with'
        })
        setGoogleReady(true)
        return true
      }
      return false
    }

    if (!initializeGoogleButton()) {
      const interval = setInterval(() => {
        if (initializeGoogleButton()) clearInterval(interval)
      }, 250)
      return () => clearInterval(interval)
    }
  }, [mode])

  // Forgot password — localStorage-based hint
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

        {/* Mark */}
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

        {/* Heading */}
        <h1 style={{ fontFamily: '"Iowan Old Style", Georgia, serif', fontSize: 26, fontWeight: 600, letterSpacing: '-0.01em', margin: '0 0 6px', color: '#1c1b1a' }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={{ fontSize: 14, color: '#726c63', margin: '0 0 28px' }}>
          {mode === 'login'
            ? <>Sign in to continue to Arrise Business Tracker.</>
            : <>Join the Arrise Digital team workspace.</>}
        </p>

        {/* Card */}
        <div style={{
          background: '#fff',
          border: '1px solid #E3E3E3',
          borderRadius: 4,
          padding: '36px 32px 28px',
          boxShadow: '0 1px 2px rgba(28,27,26,0.04), 0 12px 32px -16px rgba(28,27,26,0.12)'
        }}>

          {/* Message box */}
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
              <input style={inputStyle} type="password" placeholder="••••••••" value={form.password} onChange={f('password')} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            </div>

            <button type="submit" disabled={loading} style={primaryBtnStyle(loading)}>
              {loading ? (mode === 'login' ? 'Signing in…' : 'Creating…') : (mode === 'login' ? 'Sign in' : 'Create Account')}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0', color: '#726c63', fontSize: 12 }}>
            <div style={{ flex: 1, height: 1, background: '#E3E3E3' }} />
            OR
            <div style={{ flex: 1, height: 1, background: '#E3E3E3' }} />
          </div>

          {/* Google button */}
          <div style={{ width: '100%' }}>
            <div ref={googleButtonRef} />
            {!googleReady && (
              <button
                type="button"
                onClick={() => showMsg('Google login is loading. Please wait a moment.', 'info')}
                style={googleBtnStyle}
                onMouseOver={e => { e.currentTarget.style.background = '#f7f6f4'; e.currentTarget.style.borderColor = '#d3cfc7' }}
                onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E3E3E3' }}
              >
                <GoogleIcon />
                Continue with Google
              </button>
            )}
          </div>
        </div>

        {/* Footer toggle */}
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

// ── Styles ────────────────────────────────────────────────────────────────

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

const googleBtnStyle = {
  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: 10, background: '#fff', border: '1px solid #E3E3E3',
  borderRadius: 3, padding: 11, fontSize: 14, fontWeight: 600,
  color: '#1c1b1a', cursor: 'pointer', fontFamily: 'inherit',
  transition: 'background .15s ease, border-color .15s ease'
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width={18} height={18}>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l6-6C33.9 6.4 29.2 4.5 24 4.5 12.9 4.5 4 13.4 4 24.5S12.9 44.5 24 44.5 44 35.6 44 24.5c0-1.4-.1-2.7-.4-4z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c2.8 0 5.3 1 7.3 2.7l6-6C33.9 6.4 29.2 4.5 24 4.5c-7.6 0-14.1 4.3-17.4 10.6-.1.1-.2.4-.3.6z"/>
      <path fill="#4CAF50" d="M24 44.5c5.1 0 9.7-1.9 13.3-5.1l-6.1-5.2C29.3 35.8 26.8 36.7 24 36.7c-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.7 40 16.2 44.5 24 44.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.1 5.2C40.4 36 44 30.9 44 24.5c0-1.4-.1-2.7-.4-4z"/>
    </svg>
  )
}
