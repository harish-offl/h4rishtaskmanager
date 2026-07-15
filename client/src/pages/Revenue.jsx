import { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { uid, formatINR } from '../store/data'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const METHODS = ['Cash','UPI','Bank Transfer','Credit Card','Cheque','Other']
const SERVICES = ['Social Media Marketing','Video Editing','Graphic Design','Website Development','Photography','Videography','Content Creation','Meta Ads','Branding','Other']
const EMPTY = { date: new Date().toISOString().slice(0,10), client:'', project:'', service:'Social Media Marketing', invoice:'', amount:0, method:'UPI', notes:'' }

export default function Revenue() {
  const { revenue, setRevenue, clients, invoices } = useApp()
  const [q, setQ] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [period, setPeriod] = useState('this-month')

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`
  const lastMonth = (() => { const d=new Date(now.getFullYear(),now.getMonth()-1,1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` })()

  const filtered = useMemo(() => {
    let r = revenue
    if (period==='this-month') r = r.filter(x=>x.date?.startsWith(thisMonth))
    else if (period==='last-month') r = r.filter(x=>x.date?.startsWith(lastMonth))
    else if (period==='this-year') r = r.filter(x=>x.date?.startsWith(String(now.getFullYear())))
    if (q) r = r.filter(x=>[x.client,x.service,x.invoice].join(' ').toLowerCase().includes(q.toLowerCase()))
    return r
  }, [revenue, q, period, thisMonth, lastMonth])

  const totalRev = useMemo(()=>filtered.reduce((a,r)=>a+Number(r.amount||0),0),[filtered])
  const thisMonthRev = useMemo(()=>revenue.filter(r=>r.date?.startsWith(thisMonth)).reduce((a,r)=>a+Number(r.amount||0),0),[revenue,thisMonth])
  const lastMonthRev = useMemo(()=>revenue.filter(r=>r.date?.startsWith(lastMonth)).reduce((a,r)=>a+Number(r.amount||0),0),[revenue,lastMonth])
  const thisYearRev = useMemo(()=>revenue.filter(r=>r.date?.startsWith(String(now.getFullYear()))).reduce((a,r)=>a+Number(r.amount||0),0),[revenue])

  // Service-wise
  const byService = useMemo(() => {
    const map = {}
    filtered.forEach(r => { map[r.service] = (map[r.service]||0) + Number(r.amount||0) })
    return Object.entries(map).map(([name,val])=>({ name, val })).sort((a,b)=>b.val-a.val)
  },[filtered])

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true) }
  const openEdit = (r) => { setForm({...r}); setEditId(r.id); setModal(true) }
  const f = (k) => (e) => setForm(p=>({...p,[k]:e.target.value}))

  const save = () => {
    if (!form.client) return toast.error('Client required')
    if (editId) {
      setRevenue(rs=>rs.map(r=>r.id===editId?{...form,id:editId}:r))
      toast.success('Updated')
    } else {
      setRevenue(rs=>[{...form,id:uid(),createdAt:new Date().toISOString()},...rs])
      toast.success('Revenue recorded')
    }
    setModal(false)
  }

  const remove = (id) => { setRevenue(rs=>rs.filter(r=>r.id!==id)); toast.success('Deleted') }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Revenue</h1>
          <p className="page-sub">Based on actual payments received</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary btn-sm"><Plus size={14} /> Add Revenue</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[['This Month', formatINR(thisMonthRev),'#2E8B57'],['Last Month', formatINR(lastMonthRev),'#4D7CFE'],['This Year', formatINR(thisYearRev),'#1F1F1F']].map(([l,v,c])=>(
          <div key={l} className="stat-card" style={{ padding:'14px 16px' }}>
            <p style={{ fontSize:11, color:'#777', marginBottom:4 }}>{l}</p>
            <p style={{ fontSize:22, fontWeight:700, color:c }}>{v}</p>
          </div>
        ))}
      </div>

      {byService.length>0 && (
        <div className="card" style={{ padding:20 }}>
          <p style={{ fontWeight:600, fontSize:14, marginBottom:14 }}>Service-wise Revenue</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byService} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize:11, fill:'#AAA' }} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v/1000}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:'#555' }} axisLine={false} tickLine={false} width={130} />
              <Tooltip formatter={v=>formatINR(v)} contentStyle={{ fontSize:12, borderRadius:8 }} />
              <Bar dataKey="val" fill="#1F1F1F" radius={[0,4,4,0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="card" style={{ padding:'14px 16px' }}>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1" style={{ minWidth:180 }}>
            <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#AAA' }} />
            <input className="inp" style={{ paddingLeft:30, fontSize:13 }} placeholder="Search..." value={q} onChange={e=>setQ(e.target.value)} />
          </div>
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
              <tr><th>Date</th><th>Client</th><th>Service</th><th>Invoice</th><th>Amount</th><th>Method</th><th>Notes</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length===0 && <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'#AAA' }}>No revenue records</td></tr>}
              {filtered.map(r=>(
                <tr key={r.id}>
                  <td style={{ fontSize:12, color:'#777' }}>{r.date}</td>
                  <td style={{ fontWeight:600 }}>{r.client}</td>
                  <td style={{ fontSize:13, color:'#777' }}>{r.service}</td>
                  <td style={{ fontSize:12, color:'#777' }}>{r.invoice||'—'}</td>
                  <td style={{ fontWeight:700, color:'#2E8B57' }}>{formatINR(r.amount)}</td>
                  <td style={{ fontSize:12 }}>{r.method}</td>
                  <td style={{ fontSize:12, color:'#777' }}>{r.notes||'—'}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={()=>openEdit(r)} className="btn btn-ghost btn-xs"><Edit2 size={12} /></button>
                      <button onClick={()=>setConfirmId(r.id)} className="btn btn-danger btn-xs"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length>0&&<div style={{ padding:'10px 16px', borderTop:'1px solid #F0F0F0', display:'flex', justifyContent:'flex-end' }}>
          <span style={{ fontSize:14, fontWeight:700 }}>Total: {formatINR(totalRev)}</span>
        </div>}
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={editId?'Edit Revenue':'Add Revenue'}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Date</label><input className="inp" type="date" value={form.date} onChange={f('date')} /></div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Client *</label>
              <select className="inp" value={form.client} onChange={f('client')}>
                <option value="">Select client</option>
                {clients.map(c=><option key={c.id}>{c.name}</option>)}
                <option value="Direct Client">Direct Client</option>
              </select>
            </div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Service</label>
              <select className="inp" value={form.service} onChange={f('service')}>{SERVICES.map(s=><option key={s}>{s}</option>)}</select>
            </div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Amount (₹)</label><input className="inp" type="number" value={form.amount} onChange={f('amount')} /></div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Payment Method</label>
              <select className="inp" value={form.method} onChange={f('method')}>{METHODS.map(m=><option key={m}>{m}</option>)}</select>
            </div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Invoice #</label><input className="inp" value={form.invoice} onChange={f('invoice')} /></div>
          </div>
          <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Notes</label><textarea className="inp" rows={2} value={form.notes} onChange={f('notes')} style={{ resize:'vertical' }} /></div>
          <div className="flex gap-3 justify-end pt-2">
            <button className="btn btn-ghost btn-sm" onClick={()=>setModal(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={save}>Save</button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!confirmId} onClose={()=>setConfirmId(null)} onConfirm={()=>remove(confirmId)} />
    </div>
  )
}
