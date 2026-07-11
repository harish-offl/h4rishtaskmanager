import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard, Users, UserCheck, FolderOpen, CheckSquare,
  ListTodo, FileText, CreditCard, TrendingUp, Receipt, BarChart2,
  Calendar, FileArchive, UsersRound, Settings, LogOut,
  ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { id: 'dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'leads',      icon: Users,           label: 'Leads' },
  { id: 'clients',    icon: UserCheck,       label: 'Clients' },
  { id: 'projects',   icon: FolderOpen,      label: 'Projects' },
  { id: 'tasks',      icon: CheckSquare,     label: 'Tasks' },
  { id: 'todos',      icon: ListTodo,        label: 'Common To-Do' },
  { id: 'invoices',   icon: FileText,        label: 'Invoices' },
  { id: 'payments',   icon: CreditCard,      label: 'Payments' },
  { id: 'revenue',    icon: TrendingUp,      label: 'Revenue' },
  { id: 'expenses',   icon: Receipt,         label: 'Expenses' },
  { id: 'reports',    icon: BarChart2,       label: 'Reports' },
  { id: 'calendar',   icon: Calendar,        label: 'Calendar' },
  { id: 'documents',  icon: FileArchive,     label: 'Documents' },
  { id: 'team',       icon: UsersRound,      label: 'Team' },
  { id: 'settings',   icon: Settings,        label: 'Settings' },
]

export default function Sidebar({ active, onNav, collapsed, setCollapsed }) {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const W = collapsed ? 60 : 220

  const initial = user?.name?.[0]?.toUpperCase() || 'A'

  const Content = ({ mobile = false }) => (
    <div className="sidebar-wrap flex flex-col"
      style={{
        width: mobile ? 220 : W,
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        height: '100vh',
      }}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid #E3E3E3', minHeight: 60 }}>
        {(!collapsed || mobile) && (
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, letterSpacing: -0.3 }}>Arrise</p>
            <p style={{ fontSize: 10, color: '#777', letterSpacing: 0.2 }}>Business Tracker</p>
          </div>
        )}
        {!mobile && (
          <button onClick={() => setCollapsed(c => !c)} className="btn-ghost btn" style={{ padding: '5px', marginLeft: collapsed ? 'auto' : 0, borderRadius: 7 }}>
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-2 py-3" style={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
        {NAV.map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => { onNav(id); setMobileOpen(false) }}
            className={`nav-item ${active === id ? 'active' : ''}`}
            title={collapsed && !mobile ? label : ''}>
            <Icon size={15} style={{ flexShrink: 0 }} />
            {(!collapsed || mobile) && <span style={{ fontSize: 13 }}>{label}</span>}
          </button>
        ))}
      </div>

      <hr className="divider" />

      {/* Profile */}
      <div className="px-3 py-3">
        {(!collapsed || mobile) ? (
          <div className="flex items-center gap-2 mb-3">
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1F1F1F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{initial}</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</p>
              <p style={{ fontSize: 11, color: '#777' }}>Admin</p>
            </div>
          </div>
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1F1F1F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, margin: '0 auto 8px' }}>{initial}</div>
        )}
        <button onClick={logout} className="nav-item w-full" title={collapsed && !mobile ? 'Logout' : ''}>
          <LogOut size={14} style={{ flexShrink: 0 }} />
          {(!collapsed || mobile) && <span style={{ fontSize: 13 }}>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop: fixed sidebar + inline spacer to push content */}
      <div className="hidden md:block" style={{ width: W, flexShrink: 0, transition: 'width 0.2s ease' }}>
        <Content />
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ background: '#fff', borderBottom: '1px solid #E3E3E3', height: 52 }}>
        <div className="flex items-center gap-2">
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1F1F1F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{initial}</div>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Arrise</span>
        </div>
        <button onClick={() => setMobileOpen(o => !o)} style={{ color: '#333' }}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.4)' }}
              onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: -230 }} animate={{ x: 0 }} exit={{ x: -230 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="md:hidden fixed left-0 top-0 bottom-0 z-50">
              <Content mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
