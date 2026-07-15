import { useState, useRef, useEffect } from 'react'
import { Search, Plus, Bell, Sun, Moon, ChevronDown, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { format } from 'date-fns'

const CREATE_ITEMS = [
  { label: 'Add Lead', page: 'leads', action: 'new' },
  { label: 'Add Client', page: 'clients', action: 'new' },
  { label: 'Add Project', page: 'projects', action: 'new' },
  { label: 'Add Task', page: 'tasks', action: 'new' },
  { label: 'Add Invoice', page: 'invoices', action: 'new' },
  { label: 'Record Payment', page: 'payments', action: 'new' },
  { label: 'Add Revenue', page: 'revenue', action: 'new' },
  { label: 'Add Expense', page: 'expenses', action: 'new' },
  { label: 'Add Common To-Do', page: 'todos', action: 'new' },
]

export default function TopBar({ onNav, dark, onToggleDark, onQuickCreate }) {
  const { user } = useAuth()
  const { notifications, setNotifications } = useApp()
  const [plusOpen, setPlusOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [q, setQ] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const plusRef = useRef()
  const notifRef = useRef()

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    const close = e => {
      if (plusRef.current && !plusRef.current.contains(e.target)) setPlusOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })))

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const name = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="flex items-center justify-between px-6 py-3 gap-4"
      style={{ background: dark ? '#1A1A1A' : '#FFFFFF', borderBottom: `1px solid ${dark ? '#2A2A2A' : '#E3E3E3'}`, minHeight: 60 }}>

      {/* Left: greeting */}
      <div className="hidden md:block min-w-0">
        <p style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap' }}>{greeting}, {name}!</p>
        <p style={{ fontSize: 12, color: '#777' }}>{format(new Date(), 'EEEE, d MMMM yyyy')}</p>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        {searchOpen ? (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#AAA' }} />
              <input className="inp" style={{ paddingLeft: 34, fontSize: 13 }}
                placeholder="Search leads, clients, tasks..." autoFocus
                value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <button onClick={() => { setSearchOpen(false); setQ('') }} className="btn btn-ghost btn-xs"><X size={13} /></button>
          </div>
        ) : (
          <button onClick={() => setSearchOpen(true)} className="btn btn-ghost btn-sm w-full justify-start gap-2" style={{ color: '#AAA' }}>
            <Search size={14} /><span style={{ fontSize: 13 }}>Search...</span>
          </button>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Create */}
        <div className="relative" ref={plusRef}>
          <button onClick={() => setPlusOpen(o => !o)} className="btn btn-primary btn-sm gap-1">
            <Plus size={14} /><span className="hidden sm:inline">Create</span><ChevronDown size={12} />
          </button>
          {plusOpen && (
            <div className="card" style={{ position: 'absolute', right: 0, top: '110%', minWidth: 190, zIndex: 100, padding: '6px 0', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
              {CREATE_ITEMS.map(item => (
                <button key={item.label} onClick={() => { onQuickCreate(item); setPlusOpen(false) }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: 13, color: '#333', background: 'none', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => e.target.style.background = '#F3F3F1'}
                  onMouseLeave={e => e.target.style.background = 'none'}>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen(o => !o)} className="btn btn-ghost btn-sm" style={{ position: 'relative', padding: '7px' }}>
            <Bell size={16} />
            {unread > 0 && (
              <span style={{ position: 'absolute', top: 3, right: 3, width: 7, height: 7, borderRadius: '50%', background: '#D9534F' }} />
            )}
          </button>
          {notifOpen && (
            <div className="card" style={{ position: 'absolute', right: 0, top: '110%', width: 300, zIndex: 100, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
              <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: '#E3E3E3' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Notifications</span>
                {unread > 0 && <button onClick={markAllRead} style={{ fontSize: 11, color: '#4D7CFE', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>}
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#777', padding: 16, textAlign: 'center' }}>No notifications</p>
                ) : notifications.slice(0, 10).map(n => (
                  <div key={n.id} style={{ padding: '10px 14px', borderBottom: '1px solid #F0F0F0', background: n.read ? 'transparent' : '#FAFFF5' }}>
                    <p style={{ fontSize: 13, fontWeight: n.read ? 400 : 600 }}>{n.title}</p>
                    <p style={{ fontSize: 11, color: '#777', marginTop: 2 }}>{n.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark mode */}
        <button onClick={onToggleDark} className="btn btn-ghost btn-sm" style={{ padding: '7px' }}>
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Avatar */}
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1F1F1F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          {user?.name?.[0]?.toUpperCase() || 'A'}
        </div>
      </div>
    </div>
  )
}
