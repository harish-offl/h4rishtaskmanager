import { useMemo } from 'react'
import {
  TrendingUp, Users, CheckSquare, FileText,
  CreditCard, AlertCircle, Target, Plus,
  ArrowRight
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatINR } from '../store/data'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const PIE_COLORS = ['#2E8B57', '#D89B2B', '#4D7CFE', '#D9534F']

export default function Dashboard({ onNav }) {
  const { leads, tasks, invoices, revenue, expenses, todos, projects } = useApp()

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const lastMonth = (() => {
    const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })()

  const today = now.toISOString().slice(0, 10)

  const leadStats = useMemo(() => ({
    total: leads.length,
    new: leads.filter(l => l.status === 'New').length,
    followup: leads.filter(l => l.status === 'Follow-Up Required').length,
    interested: leads.filter(l => l.status === 'Interested').length,
    converted: leads.filter(l => l.status === 'Converted').length,
    lost: leads.filter(l => l.status === 'Lost').length,
    convRate: leads.length ? Math.round((leads.filter(l => l.status === 'Converted').length / leads.length) * 100) : 0,
  }), [leads])

  const taskStats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'To-Do').length,
    inprog: tasks.filter(t => t.status === 'In Progress').length,
    review: tasks.filter(t => t.status === 'Under Review').length,
    done: tasks.filter(t => t.status === 'Completed').length,
    overdue: tasks.filter(t => t.status !== 'Completed' && t.due && t.due < today).length,
  }), [tasks, today])

  const monthRev = useMemo(() =>
    revenue.filter(r => r.date?.startsWith(thisMonth)).reduce((a, r) => a + Number(r.amount || 0), 0),
    [revenue, thisMonth])

  const monthExp = useMemo(() =>
    expenses.filter(e => e.date?.startsWith(thisMonth)).reduce((a, e) => a + Number(e.amount || 0), 0),
    [expenses, thisMonth])

  const lastMonthRev = useMemo(() =>
    revenue.filter(r => r.date?.startsWith(lastMonth)).reduce((a, r) => a + Number(r.amount || 0), 0),
    [revenue, lastMonth])

  const lastMonthExp = useMemo(() =>
    expenses.filter(e => e.date?.startsWith(lastMonth)).reduce((a, e) => a + Number(e.amount || 0), 0),
    [expenses, lastMonth])

  const netProfit = monthRev - monthExp
  const profitMargin = monthRev > 0 ? Math.round((netProfit / monthRev) * 100) : 0

  const totalInvoiced = useMemo(() => invoices.reduce((a, i) => a + Number(i.total || 0), 0), [invoices])
  const totalReceived = useMemo(() => invoices.reduce((a, i) => a + Number(i.received || 0), 0), [invoices])
  const totalPending = useMemo(() => invoices.reduce((a, i) => a + Number(i.pending || 0), 0), [invoices])
  const totalOverdue = useMemo(() => invoices.filter(i => i.status === 'Overdue').reduce((a, i) => a + Number(i.pending || 0), 0), [invoices])

  // Build monthly chart from real data (last 6 months)
  const chartData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleString('default', { month: 'short' })
      const rev = revenue.filter(r => r.date?.startsWith(key)).reduce((a, r) => a + Number(r.amount || 0), 0)
      const exp = expenses.filter(e => e.date?.startsWith(key)).reduce((a, e) => a + Number(e.amount || 0), 0)
      months.push({ m: label, rev, exp })
    }
    return months
  }, [revenue, expenses])

  const hasChartData = chartData.some(d => d.rev > 0 || d.exp > 0)

  const pieData = [
    { name: 'Paid', value: invoices.filter(i => i.status === 'Paid').length },
    { name: 'Partially Paid', value: invoices.filter(i => i.status === 'Partially Paid').length },
    { name: 'Pending', value: invoices.filter(i => i.status === 'Pending').length },
    { name: 'Overdue', value: invoices.filter(i => i.status === 'Overdue').length },
  ].filter(d => d.value > 0)

  const recentTodos = todos.filter(t => t.status !== 'Completed').slice(0, 5)
  const priorityColor = (p) => ({ 'Urgent': '#D9534F', 'High': '#D89B2B', 'Medium': '#4D7CFE', 'Low': '#2E8B57' }[p] || '#AAA')

  const isEmpty = leads.length === 0 && tasks.length === 0 && invoices.length === 0

  // ── Empty state ──
  if (isEmpty) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Your business overview at a glance</p>
        </div>

        {/* Welcome banner */}
        <div className="card-dark" style={{ padding: '32px 36px', borderRadius: 14, textAlign: 'center' }}>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.5, marginBottom: 8 }}>
            Welcome to Arrise Business Tracker 👋
          </p>
          <p style={{ fontSize: 14, color: '#888', maxWidth: 480, margin: '0 auto 28px' }}>
            Your dashboard is empty. Start adding your real data — leads, clients, invoices, tasks, expenses — and everything will appear here automatically.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              ['Add First Lead', 'leads'],
              ['Add Client', 'clients'],
              ['Create Invoice', 'invoices'],
              ['Add Expense', 'expenses'],
              ['Add Task', 'tasks'],
            ].map(([label, page]) => (
              <button key={page} onClick={() => onNav && onNav(page)}
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={13} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick start guide */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {[
            { step: '1', title: 'Add your team', desc: 'Go to Team → Add Member. Add yourself and your team so you can assign tasks and leads.', page: 'team', color: '#4D7CFE' },
            { step: '2', title: 'Set up business details', desc: 'Go to Settings → Business. Enter your name, address, GST, UPI — auto-fills every invoice.', page: 'settings', color: '#2E8B57' },
            { step: '3', title: 'Add your leads', desc: 'Go to Leads → Add Lead. Enter each lead with contact details, service, and priority.', page: 'leads', color: '#D89B2B' },
            { step: '4', title: 'Add clients', desc: 'Go to Clients → Add Client. Add active clients or convert leads from the Leads page.', page: 'clients', color: '#1F1F1F' },
            { step: '5', title: 'Create invoices', desc: 'Go to Invoices → Create Invoice. Add services, amounts, and track payment status.', page: 'invoices', color: '#D9534F' },
            { step: '6', title: 'Track expenses', desc: 'Go to Expenses → Add Expense. Log every business expense with category and amount.', page: 'expenses', color: '#777' },
          ].map(s => (
            <button key={s.step} onClick={() => onNav && onNav(s.page)}
              className="card card-hover" style={{ padding: '18px 20px', textAlign: 'left', border: 'none', cursor: 'pointer', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: s.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{s.step}</span>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{s.title}</p>
              </div>
              <p style={{ fontSize: 12, color: '#777', lineHeight: 1.6 }}>{s.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, color: s.color, fontSize: 12, fontWeight: 600 }}>
                <span>Go there</span><ArrowRight size={12} />
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Populated dashboard ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Financial Hero */}
      <div className="card-dark" style={{ padding: '24px 28px', borderRadius: 14 }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Net Profit — {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </p>
            <p style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1, color: netProfit >= 0 ? '#2E8B57' : '#D9534F' }}>
              {formatINR(netProfit)}
            </p>
            <p style={{ fontSize: 13, color: '#888', marginTop: 6 }}>
              Revenue: <span style={{ color: '#E8E8E8' }}>{formatINR(monthRev)}</span>
              &nbsp;·&nbsp;
              Expenses: <span style={{ color: '#E8E8E8' }}>{formatINR(monthExp)}</span>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Profit Margin</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#E8E8E8' }}>{profitMargin}%</p>
            {lastMonthRev > 0 && (
              <p style={{ fontSize: 12, color: monthRev >= lastMonthRev ? '#2E8B57' : '#D9534F', marginTop: 4 }}>
                {monthRev >= lastMonthRev ? '▲' : '▼'} vs last month
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {[
            { label: 'Total Invoiced', val: formatINR(totalInvoiced), color: '#E8E8E8' },
            { label: 'Payments Received', val: formatINR(totalReceived), color: '#2E8B57' },
            { label: 'Pending', val: formatINR(totalPending), color: '#D89B2B' },
            { label: 'Overdue', val: formatINR(totalOverdue), color: totalOverdue > 0 ? '#D9534F' : '#555' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '12px 14px' }}>
              <p style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SummaryCard icon={Users} label="Total Leads" value={leadStats.total} sub={`${leadStats.convRate}% converted`} color="#4D7CFE" />
        <SummaryCard icon={Target} label="Follow-ups Due" value={leadStats.followup} sub="Require action" color="#D89B2B" />
        <SummaryCard icon={CheckSquare} label="Active Tasks" value={taskStats.inprog + taskStats.todo} sub={`${taskStats.done} completed`} color="#2E8B57" />
        <SummaryCard icon={AlertCircle} label="Overdue Tasks" value={taskStats.overdue} sub="Need attention" color={taskStats.overdue > 0 ? '#D9534F' : '#AAA'} />
        <SummaryCard icon={Users} label="WhatsApp Sent" value={leads.filter(l => l.whatsappSent).length} sub="Contacted leads" color="#F97316" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenue vs Expenses chart */}
        <div className="card" style={{ padding: 20, gridColumn: 'span 2' }}>
          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Revenue vs Expenses (Last 6 Months)</p>
          {hasChartData ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1F1F1F" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1F1F1F" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D9534F" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#D9534F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: '#AAA' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#AAA' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `₹${(v/1000).toFixed(0)}k` : `₹${v}`} />
                <Tooltip formatter={v => formatINR(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E3E3E3' }} />
                <Area type="monotone" dataKey="rev" stroke="#1F1F1F" strokeWidth={2} fill="url(#rg)" name="Revenue" />
                <Area type="monotone" dataKey="exp" stroke="#D9534F" strokeWidth={2} fill="url(#eg)" name="Expenses" />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Add revenue and expenses to see the chart" />
          )}
        </div>

        {/* Payment status pie */}
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Payment Status</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No invoices yet" />
          )}
        </div>
      </div>

      {/* Lead + Task + To-Do row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Lead pipeline */}
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Lead Pipeline</p>
          {leads.length === 0 ? (
            <p style={{ fontSize: 13, color: '#AAA', textAlign: 'center', padding: '20px 0' }}>No leads yet. <br />Add your first lead →</p>
          ) : (
            <>
              {[
                { label: 'Total', val: leadStats.total, color: '#1F1F1F' },
                { label: 'New', val: leadStats.new, color: '#4D7CFE' },
                { label: 'Follow-Up', val: leadStats.followup, color: '#D89B2B' },
                { label: 'Interested', val: leadStats.interested, color: '#2E8B57' },
                { label: 'Converted', val: leadStats.converted, color: '#2E8B57' },
                { label: 'Lost', val: leadStats.lost, color: '#D9534F' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: '#555' }}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.val}</span>
                </div>
              ))}
              <div style={{ marginTop: 10, padding: '10px 12px', background: '#F3F3F1', borderRadius: 8 }}>
                <p style={{ fontSize: 11, color: '#777' }}>Conversion Rate</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: '#2E8B57' }}>{leadStats.convRate}%</p>
              </div>
            </>
          )}
        </div>

        {/* Task overview */}
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Task Overview</p>
          {tasks.length === 0 ? (
            <p style={{ fontSize: 13, color: '#AAA', textAlign: 'center', padding: '20px 0' }}>No tasks yet. <br />Add your first task →</p>
          ) : (
            [
              { label: 'To-Do', val: taskStats.todo, color: '#777' },
              { label: 'In Progress', val: taskStats.inprog, color: '#4D7CFE' },
              { label: 'Under Review', val: taskStats.review, color: '#D89B2B' },
              { label: 'Completed', val: taskStats.done, color: '#2E8B57' },
              { label: 'Overdue', val: taskStats.overdue, color: '#D9534F' },
            ].map(s => (
              <div key={s.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#555' }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.val}</span>
                </div>
                <div className="prog-bar">
                  <div className="prog-fill" style={{ width: taskStats.total ? `${(s.val / taskStats.total) * 100}%` : 0, background: s.color }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Common To-Do widget */}
        <div className="card" style={{ padding: 20 }}>
          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Common To-Do</p>
          {recentTodos.length === 0 ? (
            <p style={{ fontSize: 13, color: '#AAA', textAlign: 'center', padding: '20px 0' }}>All done! 🎉</p>
          ) : (
            recentTodos.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: priorityColor(t.priority), marginTop: 5, flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{t.title}</p>
                  <p style={{ fontSize: 11, color: '#777' }}>{t.assigned || '—'} · {t.due || 'No date'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: '#777', fontWeight: 500 }}>{label}</p>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>{value}</p>
      <p style={{ fontSize: 12, color: '#777', marginTop: 4 }}>{sub}</p>
    </div>
  )
}

function EmptyChart({ message }) {
  return (
    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 13, color: '#AAA', textAlign: 'center' }}>{message}</p>
    </div>
  )
}
