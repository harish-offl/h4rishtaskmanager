import { useState, useEffect, useCallback } from 'react'

// One-time migration: clear old sample data so user starts fresh
// Runs once per browser. Set 'arrise_v2_clean' to skip on subsequent loads.
if (!localStorage.getItem('arrise_v2_clean')) {
  const keys = ['leads','clients','projects','tasks','invoices','payments','revenue','expenses','todos','team','notifications']
  keys.forEach(k => localStorage.removeItem('arrise_biz_' + k))
  localStorage.setItem('arrise_v2_clean', '1')
}
import { AnimatePresence, motion } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import AuthPage from './pages/AuthPage'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Clients from './pages/Clients'
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import Todos from './pages/Todos'
import Invoices from './pages/Invoices'
import Payments from './pages/Payments'
import Revenue from './pages/Revenue'
import Expenses from './pages/Expenses'
import Reports from './pages/Reports'
import CalendarView from './pages/CalendarView'
import Documents from './pages/Documents'
import Team from './pages/Team'
import Settings from './pages/Settings'

const PAGES = {
  dashboard: Dashboard, leads: Leads, clients: Clients, projects: Projects,
  tasks: Tasks, todos: Todos, invoices: Invoices, payments: Payments,
  revenue: Revenue, expenses: Expenses, reports: Reports,
  calendar: CalendarView, documents: Documents, team: Team, settings: Settings
}

function AppInner() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('arrise_theme') === 'dark')

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
    localStorage.setItem('arrise_theme', dark ? 'dark' : 'light')
  }, [dark])

  const handleQuickCreate = useCallback(({ page: p }) => {
    setPage(p)
  }, [])

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#F3F3F1' }}>
      <div style={{ width:28, height:28, border:'2px solid #E3E3E3', borderTopColor:'#1F1F1F', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (!user) return <AuthPage />

  const Page = PAGES[page] || Dashboard
  const sideW = collapsed ? 60 : 220

  return (
    <div style={{ background: dark ? '#141414' : '#F3F3F1', minHeight:'100vh', display:'flex' }}>
      <Sidebar active={page} onNav={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />

      <div style={{ flex:1, minWidth:0 }} className="hidden md:flex md:flex-col">
        <TopBar onNav={setPage} dark={dark} onToggleDark={() => setDark(d=>!d)} onQuickCreate={handleQuickCreate} />
        <div style={{ flex:1, overflowY:'auto', padding:'24px 24px' }}>
          <AnimatePresence mode="wait">
            <motion.div key={page}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-6 }}
              transition={{ duration:0.16 }}>
              {page === 'settings'
                ? <Page dark={dark} onToggleDark={()=>setDark(d=>!d)} />
                : page === 'dashboard'
                  ? <Page onNav={setPage} />
                  : <Page />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex flex-col w-full md:hidden" style={{ marginTop:52 }}>
        <div style={{ flex:1, overflowY:'auto', padding:'20px 16px' }}>
          <AnimatePresence mode="wait">
            <motion.div key={page}
              initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              transition={{ duration:0.16 }}>
              {page === 'settings'
                ? <Page dark={dark} onToggleDark={()=>setDark(d=>!d)} />
                : page === 'dashboard'
                  ? <Page onNav={setPage} />
                  : <Page />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppInner />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { fontSize:13, borderRadius:8, background:'#1F1F1F', color:'#fff', padding:'10px 14px' },
            success: { iconTheme: { primary:'#2E8B57', secondary:'#fff' } },
            error: { iconTheme: { primary:'#D9534F', secondary:'#fff' } },
          }}
        />
      </AppProvider>
    </AuthProvider>
  )
}
