import { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { uid, formatINR } from '../store/data'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const CATEGORIES = ['Software Subscription','Advertising','Travel','Salary','Freelancer Payment','Equipment','Internet','Office Expense','Food','Printing','Client Meeting','Hosting and Domain','Miscellaneous']
const METHODS = ['Cash','UPI','Bank Transfer','Credit Card','Cheque','Other']
const EMPTY = { date:new Date().toISOString().slice(0,10), category:'Software Subscription', title:'', vendor:'', amount:0, method:'UPI', paidBy:'', project:'', notes:'', recurring:false }

const CAT_COLORS = ['#1F1F1F','#333','#555','#777','#999','#BBB','#4D7CFE','#2E8B57','#D89B2B','#D9534F','#8B5CF6','#F59E0B','#06B6D4']

export default function Expenses() {
  const { expenses, setExpenses, projects } = useApp()
  const [q, setQ] = useState('')
  const [catF, setCatF] = useState('')
  const [period, setPeriod] = useState('this-month')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  const lastMonth = (() => { const d=new Date(now.getFullYear(),now.getMonth()-1,1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` })()

  const periodFiltered = useMemo(() => {
    let e = expenses
    if (period==='this-month') e = e.filter(x=>x.date?.startsWith(thisMonth))
    else if (period==='last-month') e = e.filter(x=>x.date?.startsWith(lastMonth))
    else if (period==='this-year') e = e.filter(x=>x.date?.startsWith(String(now.getFullYear())))
    return e
  }, [expenses, period, thisMonth, lastMonth])

  const filtered = useMemo(() => periodFiltered.filter(e =>
    (!q || [e.title, e.vendor, e.category].join(' ').toLowerCase().includes(q.toLowerCase())) &&
    (!catF || e.category === catF)
  ), [periodFiltered, q, catF])

  const totalExp = useMemo(()=>periodFiltered.reduce((a,e)=>a+Number(e.amount||0),0),[periodFiltered])
  const thisMonthExp = useMemo(()=>expenses.filter(e=>e.date?.startsWith(thisMonth)).reduce((a,e)=>a+Number(e.amount||0),0),[expenses,thisMonth])

  const byCat = useMemo(() => {
    const map = {}
    periodFiltered.forEach(e => { map[e.category] = (map[e.category]||0)+Number(e.amount||0) })
    return Object.entries(map).map(([name,val])=>({ name, val })).sort((a,b)=>b.val-a.val)
  },[periodFiltered])

  const pieData = byCat.map(b=>({ name:b.name, value:b.val }))

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true) }
  const openEdit = (e) => { setForm({...e}); setEditId(e.id); setModal(true) }
  const f = (k) => (e) => setForm(p=>({...p,[k]:e.target.value}))

  const save = () => {
    if (!form.title) return toast.error('Title required')
    if (editId) {
      setExpenses(es=>es.map(e=>e.id===editId?{...form,id:editId}:e))
      toast.success('Updated')
    } else {
      setExpenses(es=>[{...form,id:uid(),createdAt:new Date().toISOString()},...es])
      toast.success('Expense added')
    }
    setModal(false)
  }

  const remove = (id) => { setExpenses(es=>es.filter(e=>e.id!==id)); toast.success('Deleted') }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Expenses</h1>
          <p className="page-sub">Track all business expenses</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary btn-sm"><Plus size={14} /> Add Expense</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['This Month', formatINR(thisMonthExp)],['Period Total', formatINR(totalExp)],['Recurring', expenses.filter(e=>e.recurring).length + ' items'],['Top Category', byCat[0]?.name||'—']].map(([l,v])=>(
          <div key={l} className="stat-card" style={{ padding:'14px 16px' }}>
            <p style={{ fontSize:11, color:'#777', marginBottom:4 }}>{l}</p>
            <p style={{ fontSize:16, fontWeight:700 }}>{v}</p>
          </div>
        ))}
      </div>

      {pieData.length>0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card" style={{ padding:20 }}>
            <p style={{ fontWeight:600, fontSize:14, marginBottom:14 }}>Expense by Category</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" paddingAngle={2}>
                  {pieData.map((_,i)=><Cell key={i} fill={CAT_COLORS[i%CAT_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v=>formatINR(v)} contentStyle={{ fontSize:12, borderRadius:8 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize:11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding:20 }}>
            <p style={{ fontWeight:600, fontSize:14, marginBottom:14 }}>Top Expenses</p>
            {byCat.slice(0,6).map((c,i)=>(
              <div key={c.name} style={{ marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:12, color:'#555' }}>{c.name}</span>
                  <span style={{ fontSize:12, fontWeight:700 }}>{formatINR(c.val)}</span>
                </div>
                <div className="prog-bar"><div className="prog-fill" style={{ width:`${totalExp?Math.round((c.val/totalExp)*100):0}%`, background:CAT_COLORS[i%CAT_COLORS.length] }} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ padding:'14px 16px' }}>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1" style={{ minWidth:180 }}>
            <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#AAA' }} />
            <input className="inp" style={{ paddingLeft:30, fontSize:13 }} placeholder="Search expenses..." value={q} onChange={e=>setQ(e.target.value)} />
          </div>
          <select className="inp" style={{ width:200 }} value={catF} onChange={e=>setCatF(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
          <select className="inp" style={{ width:160 }} value={period} onChange={e=>setPeriod(e.target.value)}>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table className="tbl">
            <thead>
              <tr><th>Date</th><th>Title</th><th>Category</th><th>Vendor</th><th>Amount</th><th>Method</th><th>Paid By</th><th>Project</th><th>Recurring</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length===0 && <tr><td colSpan={10} style={{ textAlign:'center', padding:40, color:'#AAA' }}>No expenses</td></tr>}
              {filtered.map(e=>(
                <tr key={e.id}>
                  <td style={{ fontSize:12, color:'#777' }}>{e.date}</td>
                  <td style={{ fontWeight:600 }}>{e.title}</td>
                  <td><span style={{ fontSize:11, background:'#F0F0F0', color:'#555', padding:'2px 8px', borderRadius:99 }}>{e.category}</span></td>
                  <td style={{ fontSize:13, color:'#777' }}>{e.vendor||'—'}</td>
                  <td style={{ fontWeight:700, color:'#D9534F' }}>{formatINR(e.amount)}</td>
                  <td style={{ fontSize:12 }}>{e.method}</td>
                  <td style={{ fontSize:13 }}>{e.paidBy||'—'}</td>
                  <td style={{ fontSize:12, color:'#777' }}>{e.project||'—'}</td>
                  <td style={{ fontSize:12 }}>{e.recurring?'🔁 Yes':'—'}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={()=>openEdit(e)} className="btn btn-ghost btn-xs"><Edit2 size={12} /></button>
                      <button onClick={()=>setConfirmId(e.id)} className="btn btn-danger btn-xs"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length>0&&<div style={{ padding:'10px 16px', borderTop:'1px solid #F0F0F0', display:'flex', justifyContent:'flex-end' }}>
          <span style={{ fontSize:14, fontWeight:700 }}>Total: <span style={{ color:'#D9534F' }}>{formatINR(filtered.reduce((a,e)=>a+Number(e.amount||0),0))}</span></span>
        </div>}
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={editId?'Edit Expense':'Add Expense'}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Date</label><input className="inp" type="date" value={form.date} onChange={f('date')} /></div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Category</label>
              <select className="inp" value={form.category} onChange={f('category')}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
            </div>
            <div className="col-span-2"><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Title *</label><input className="inp" value={form.title} onChange={f('title')} placeholder="e.g. Adobe Creative Cloud" /></div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Vendor</label><input className="inp" value={form.vendor} onChange={f('vendor')} /></div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Amount (₹)</label><input className="inp" type="number" value={form.amount} onChange={f('amount')} /></div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Payment Method</label>
              <select className="inp" value={form.method} onChange={f('method')}>{METHODS.map(m=><option key={m}>{m}</option>)}</select>
            </div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Paid By</label><input className="inp" value={form.paidBy} onChange={f('paidBy')} /></div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Related Project</label>
              <select className="inp" value={form.project} onChange={f('project')}>
                <option value="">None</option>
                {projects.map(p=><option key={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, paddingTop:20 }}>
              <input type="checkbox" id="rec" checked={!!form.recurring} onChange={e=>setForm(p=>({...p,recurring:e.target.checked}))} />
              <label htmlFor="rec" style={{ fontSize:13 }}>Recurring expense</label>
            </div>
          </div>
          <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Notes</label><textarea className="inp" rows={2} value={form.notes} onChange={f('notes')} style={{ resize:'vertical' }} /></div>
          <div className="flex gap-3 justify-end pt-2">
            <button className="btn btn-ghost btn-sm" onClick={()=>setModal(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={save}>Save Expense</button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!confirmId} onClose={()=>setConfirmId(null)} onConfirm={()=>remove(confirmId)} />
    </div>
  )
}
