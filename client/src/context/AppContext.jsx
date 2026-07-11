import { createContext, useContext, useState, useEffect } from 'react'
import { getStore, setStore } from '../store/data'

const AppCtx = createContext(null)

// Always starts with stored data, or empty array — NO sample data fallback
function init(key) {
  const stored = getStore(key)
  if (Array.isArray(stored)) return stored
  return []
}

export function AppProvider({ children }) {
  const [leads,         setLeads]         = useState(() => init('leads'))
  const [clients,       setClients]       = useState(() => init('clients'))
  const [projects,      setProjects]      = useState(() => init('projects'))
  const [tasks,         setTasks]         = useState(() => init('tasks'))
  const [invoices,      setInvoices]      = useState(() => init('invoices'))
  const [payments,      setPayments]      = useState(() => init('payments'))
  const [revenue,       setRevenue]       = useState(() => init('revenue'))
  const [expenses,      setExpenses]      = useState(() => init('expenses'))
  const [todos,         setTodos]         = useState(() => init('todos'))
  const [team,          setTeam]          = useState(() => init('team'))
  const [notifications, setNotifications] = useState(() => init('notifications'))

  // Persist every change to localStorage
  useEffect(() => { setStore('leads',         leads)         }, [leads])
  useEffect(() => { setStore('clients',       clients)       }, [clients])
  useEffect(() => { setStore('projects',      projects)      }, [projects])
  useEffect(() => { setStore('tasks',         tasks)         }, [tasks])
  useEffect(() => { setStore('invoices',      invoices)      }, [invoices])
  useEffect(() => { setStore('payments',      payments)      }, [payments])
  useEffect(() => { setStore('revenue',       revenue)       }, [revenue])
  useEffect(() => { setStore('expenses',      expenses)      }, [expenses])
  useEffect(() => { setStore('todos',         todos)         }, [todos])
  useEffect(() => { setStore('team',          team)          }, [team])
  useEffect(() => { setStore('notifications', notifications) }, [notifications])

  // Nuclear reset — wipes all business data from localStorage and state
  const resetAllData = () => {
    const keys = ['leads','clients','projects','tasks','invoices','payments','revenue','expenses','todos','team','notifications']
    keys.forEach(k => setStore(k, []))
    setLeads([]);  setClients([]);  setProjects([]);  setTasks([])
    setInvoices([]); setPayments([]); setRevenue([]);  setExpenses([])
    setTodos([]);  setTeam([]);     setNotifications([])
  }

  return (
    <AppCtx.Provider value={{
      leads,         setLeads,
      clients,       setClients,
      projects,      setProjects,
      tasks,         setTasks,
      invoices,      setInvoices,
      payments,      setPayments,
      revenue,       setRevenue,
      expenses,      setExpenses,
      todos,         setTodos,
      team,          setTeam,
      notifications, setNotifications,
      resetAllData,
    }}>
      {children}
    </AppCtx.Provider>
  )
}

export const useApp = () => useContext(AppCtx)
