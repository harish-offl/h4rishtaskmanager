import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name:'', username:'', password:'' })
  const [loading, setLoading] = useState(false)

  const f = (k) => (e) => setForm(p=>({...p,[k]:e.target.value}))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') await login(form.username, form.password)
      else await register(form.name, form.username, form.password)
    } catch(err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#F3F3F1', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:52, height:52, background:'#1F1F1F', borderRadius:14, margin:'0 auto 14px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ color:'#fff', fontSize:22, fontWeight:800 }}>A</span>
          </div>
          <h1 style={{ fontSize:22, fontWeight:800, letterSpacing:-0.5 }}>Arrise Business Tracker</h1>
          <p style={{ fontSize:13, color:'#777', marginTop:4 }}>Leads, Tasks, Revenue and Client Management</p>
        </div>

        <div style={{ background:'#fff', borderRadius:14, border:'1px solid #E3E3E3', padding:28, boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ display:'flex', marginBottom:22, background:'#F3F3F1', borderRadius:8, padding:3 }}>
            {['login','register'].map(m=>(
              <button key={m} onClick={()=>setMode(m)}
                style={{ flex:1, padding:'7px 0', fontSize:13, fontWeight:600, borderRadius:6, border:'none', cursor:'pointer', background:mode===m?'#1F1F1F':'transparent', color:mode===m?'#fff':'#777', transition:'all 0.15s' }}>
                {m==='login'?'Sign In':'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {mode==='register' && (
              <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:4 }}>Full Name</label>
                <input className="inp" placeholder="Your name" value={form.name} onChange={f('name')} required />
              </div>
            )}
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:4 }}>Username</label>
              <input className="inp" placeholder="Enter username" value={form.username} onChange={f('username')} required autoComplete="username" />
            </div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:4 }}>Password</label>
              <input className="inp" type="password" placeholder="Enter password" value={form.password} onChange={f('password')} required autoComplete="current-password" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'11px 20px', marginTop:4 }} disabled={loading}>
              {loading ? '...' : mode==='login'?'Sign In':'Create Account'}
            </button>
          </form>

          <p style={{ fontSize:12, color:'#AAA', textAlign:'center', marginTop:16 }}>
            Demo: use any username + password (6+ chars)
          </p>
        </div>
      </div>
    </div>
  )
}
