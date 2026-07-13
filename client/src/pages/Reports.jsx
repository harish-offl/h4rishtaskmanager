import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatINR } from '../store/data'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Download, TrendingUp, TrendingDown } from 'lucide-react'
import toast from 'react-hot-toast'

const CHART_DATA = [
  { m:'Jan', rev:38000, exp:14000 },{ m:'Feb', rev:42000, exp:16000 },
  { m:'Mar', rev:55000, exp:18000 },{ m:'Apr', rev:61000, exp:21000 },
  { m:'May', rev:72000, exp:22500 },{ m:'Jun', rev:68000, exp:23000 },
  { m:'Jul', rev:85500, exp:24700 },
]

export default function Reports() {
  const { leads, tasks, invoices, revenue, expenses } = useApp()
  const [tab, setTab] = useState('financial')

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  const lastMonth = (() => { const d=new Date(now.getFullYear(),now.getMonth()-1,1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` })()

  const thisMonthRev = useMemo(()=>revenue.filter(r=>r.date?.startsWith(thisMonth)).reduce((a,r)=>a+Number(r.amount||0),0),[revenue,thisMonth])
  const lastMonthRev = useMemo(()=>revenue.filter(r=>r.date?.startsWith(lastMonth)).reduce((a,r)=>a+Number(r.amount||0),0),[revenue,lastMonth])
  const thisMonthExp = useMemo(()=>expenses.filter(e=>e.date?.startsWith(thisMonth)).reduce((a,e)=>a+Number(e.amount||0),0),[expenses,thisMonth])
  const lastMonthExp = useMemo(()=>expenses.filter(e=>e.date?.startsWith(lastMonth)).reduce((a,e)=>a+Number(e.amount||0),0),[expenses,lastMonth])
  const netProfit = thisMonthRev - thisMonthExp
  const lastNetProfit = lastMonthRev - lastMonthExp
  const profitMargin = thisMonthRev > 0 ? Math.round((netProfit/thisMonthRev)*100) : 0
  const profitGrowth = lastNetProfit > 0 ? Math.round(((netProfit-lastNetProfit)/lastNetProfit)*100) : 0
  const revGrowth = lastMonthRev > 0 ? Math.round(((thisMonthRev-lastMonthRev)/lastMonthRev)*100) : 0

  const pendingInvoices = invoices.filter(i=>i.status!=='Paid')
  const totalPending = pendingInvoices.reduce((a,i)=>a+Number(i.pending||0),0)

  const leadConvRate = leads.length ? Math.round((leads.filter(l=>l.status==='Converted').length/leads.length)*100) : 0

  const exportCSV = (data, name) => {
    if (!data.length) return toast.error('No data to export')
    const keys = Object.keys(data[0])
    const csv = [keys.join(','), ...data.map(r=>keys.map(k=>JSON.stringify(r[k]||'')).join(','))].join('\n')
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,'+encodeURIComponent(csv)
    a.download = name+'.csv'; a.click()
    toast.success('Exported!')
  }

  const TABS = [['financial','Financial'],['leads','Leads'],['tasks','Tasks'],['invoices','Invoices']]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-sub">Business performance analytics</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, borderBottom:'1px solid #E3E3E3', paddingBottom:0 }}>
        {TABS.map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)}
            style={{ padding:'8px 16px', fontSize:13, fontWeight:tab===id?600:400, color:tab===id?'#1F1F1F':'#777', borderBottom:tab===id?'2px solid #1F1F1F':'2px solid transparent', background:'none', border:'none', borderBottom:tab===id?'2px solid #1F1F1F':'2px solid transparent', cursor:'pointer', marginBottom:-1 }}>
            {label}
          </button>
        ))}
      </div>

      {tab==='financial' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* P&L Summary */}
          <div className="card-dark" style={{ padding:'22px 26px', borderRadius:14 }}>
            <p style={{ fontSize:12, color:'#888', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>Profit & Loss — July 2026</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { l:'Gross Revenue', v:formatINR(thisMonthRev), sub:revGrowth>=0?`+${revGrowth}% vs last month`:`${revGrowth}% vs last month`, up:revGrowth>=0 },
                { l:'Total Expenses', v:formatINR(thisMonthExp), sub:'This month', up:false },
                { l:'Net Profit', v:formatINR(netProfit), sub:profitGrowth>=0?`+${profitGrowth}% vs last month`:`${profitGrowth}% vs last month`, up:profitGrowth>=0 },
                { l:'Profit Margin', v:`${profitMargin}%`, sub:'Revenue-based margin', up:profitMargin>=30 },
                { l:'Pending Revenue', v:formatINR(totalPending), sub:`${pendingInvoices.length} invoices pending`, up:false },
                { l:'Last Month Profit', v:formatINR(lastNetProfit), sub:'For comparison', up:lastNetProfit>=0 },
              ].map(s=>(
                <div key={s.l} style={{ background:'rgba(255,255,255,0.05)', borderRadius:8, padding:'14px 16px' }}>
                  <p style={{ fontSize:11, color:'#888', marginBottom:4 }}>{s.l}</p>
                  <p style={{ fontSize:20, fontWeight:700, color:'#E8E8E8' }}>{s.v}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:4 }}>
                    {s.up ? <TrendingUp size={11} style={{ color:'#2E8B57' }} /> : <TrendingDown size={11} style={{ color:'#D9534F' }} />}
                    <span style={{ fontSize:11, color:s.up?'#2E8B57':'#D9534F' }}>{s.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding:20 }}>
            <div className="flex items-center justify-between mb-4">
              <p style={{ fontWeight:600, fontSize:14 }}>Monthly Revenue vs Expenses</p>
              <button onClick={()=>exportCSV(CHART_DATA,'revenue-expenses')} className="btn btn-ghost btn-xs"><Download size={12} /> Export</button>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={CHART_DATA}>
                <defs>
                  <linearGradient id="r2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1F1F1F" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#1F1F1F" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="e2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D9534F" stopOpacity={0.10}/>
                    <stop offset="95%" stopColor="#D9534F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0"/>
                <XAxis dataKey="m" tick={{ fontSize:11, fill:'#AAA' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11, fill:'#AAA' }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v/1000}k`}/>
                <Tooltip formatter={v=>formatINR(v)} contentStyle={{ fontSize:12, borderRadius:8 }}/>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11 }}/>
                <Area type="monotone" dataKey="rev" stroke="#1F1F1F" strokeWidth={2} fill="url(#r2)" name="Revenue"/>
                <Area type="monotone" dataKey="exp" stroke="#D9534F" strokeWidth={2} fill="url(#e2)" name="Expenses"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ padding:20 }}>
            <p style={{ fontWeight:600, fontSize:14, marginBottom:14 }}>Monthly Net Profit</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={CHART_DATA.map(d=>({ m:d.m, profit:d.rev-d.exp }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0"/>
                <XAxis dataKey="m" tick={{ fontSize:11, fill:'#AAA' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11, fill:'#AAA' }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v/1000}k`}/>
                <Tooltip formatter={v=>formatINR(v)} contentStyle={{ fontSize:12, borderRadius:8 }}/>
                <Bar dataKey="profit" fill="#2E8B57" radius={[4,4,0,0]} name="Net Profit"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab==='leads' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[['Total Leads',leads.length],['Converted',leads.filter(l=>l.status==='Converted').length],['Lost',leads.filter(l=>l.status==='Lost').length],['Conv. Rate',`${leadConvRate}%`]].map(([l,v])=>(
              <div key={l} className="stat-card" style={{ padding:'14px 16px' }}>
                <p style={{ fontSize:11, color:'#777', marginBottom:4 }}>{l}</p>
                <p style={{ fontSize:22, fontWeight:700 }}>{v}</p>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding:20 }}>
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontWeight:600, fontSize:14 }}>Lead Status Breakdown</p>
              <button onClick={()=>exportCSV(leads,'leads-report')} className="btn btn-ghost btn-xs"><Download size={12} /> Export CSV</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {['New','Contacted','Interested','Proposal Sent','Negotiation','Converted','Lost'].map(s=>{
                const cnt = leads.filter(l=>l.status===s).length
                return (
                  <div key={s} style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <p style={{ fontSize:13, color:'#555', minWidth:130 }}>{s}</p>
                    <div className="prog-bar flex-1"><div className="prog-fill" style={{ width:leads.length?`${(cnt/leads.length)*100}%`:0 }} /></div>
                    <span style={{ fontSize:13, fontWeight:700, minWidth:24, textAlign:'right' }}>{cnt}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {tab==='tasks' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[['Total',tasks.length],['Completed',tasks.filter(t=>t.status==='Completed').length],['In Progress',tasks.filter(t=>t.status==='In Progress').length],['Overdue',tasks.filter(t=>t.status!=='Completed'&&t.due&&t.due<new Date().toISOString().slice(0,10)).length]].map(([l,v])=>(
              <div key={l} className="stat-card" style={{ padding:'14px 16px' }}>
                <p style={{ fontSize:11, color:'#777', marginBottom:4 }}>{l}</p>
                <p style={{ fontSize:22, fontWeight:700 }}>{v}</p>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding:20 }}>
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontWeight:600, fontSize:14 }}>Task Completion</p>
              <button onClick={()=>exportCSV(tasks,'tasks-report')} className="btn btn-ghost btn-xs"><Download size={12} /> Export CSV</button>
            </div>
            <div className="prog-bar" style={{ height:16, borderRadius:8 }}>
              <div className="prog-fill" style={{ width:tasks.length?`${(tasks.filter(t=>t.status==='Completed').length/tasks.length)*100}%`:0, borderRadius:8 }} />
            </div>
            <p style={{ fontSize:13, color:'#777', marginTop:8 }}>{tasks.filter(t=>t.status==='Completed').length} of {tasks.length} tasks completed</p>
          </div>
        </div>
      )}

      {tab==='invoices' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[['Paid',invoices.filter(i=>i.status==='Paid').length],['Partially Paid',invoices.filter(i=>i.status==='Partially Paid').length],['Pending',invoices.filter(i=>i.status==='Pending').length],['Overdue',invoices.filter(i=>i.status==='Overdue').length]].map(([l,v])=>(
              <div key={l} className="stat-card" style={{ padding:'14px 16px' }}>
                <p style={{ fontSize:11, color:'#777', marginBottom:4 }}>{l}</p>
                <p style={{ fontSize:22, fontWeight:700 }}>{v}</p>
              </div>
            ))}
          </div>
          <div className="card" style={{ overflow:'hidden' }}>
            <div style={{ display:'flex', justifyContent:'flex-end', padding:'10px 16px', borderBottom:'1px solid #F0F0F0' }}>
              <button onClick={()=>exportCSV(invoices,'invoices-report')} className="btn btn-ghost btn-xs"><Download size={12} /> Export CSV</button>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table className="tbl">
                <thead><tr><th>Invoice</th><th>Client</th><th>Date</th><th>Total</th><th>Received</th><th>Pending</th><th>Status</th></tr></thead>
                <tbody>
                  {invoices.map(i=>(
                    <tr key={i.id}>
                      <td style={{ fontWeight:700, fontSize:13 }}>{i.number}</td>
                      <td>{i.client}</td>
                      <td style={{ fontSize:12, color:'#777' }}>{i.date}</td>
                      <td style={{ fontWeight:600 }}>{formatINR(i.total)}</td>
                      <td style={{ color:'#2E8B57', fontWeight:600 }}>{formatINR(i.received)}</td>
                      <td style={{ color:Number(i.pending)>0?'#D89B2B':'#777' }}>{formatINR(i.pending)}</td>
                      <td><span className={`badge ${i.status==='Paid'?'badge-success':i.status==='Overdue'?'badge-danger':i.status==='Partially Paid'?'badge-warning':'badge-neutral'}`}>{i.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
