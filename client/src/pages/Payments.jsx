import { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { uid, formatINR } from '../store/data'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

const MODES = ['Cash','UPI','Bank Transfer','Credit Card','Cheque','Other']
const EMPTY = { client:'', project:'', invoice:'', invoiceTotal:0, paid:0, remaining:0, date:new Date().toISOString().slice(0,10), mode:'UPI', ref:'', status:'Paid', notes:'' }

export default function Payments() {
  const { payments, setPayments, clients, invoices } = useApp()
  const [q, setQ] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const filtered = useMemo(() => payments.filter(p =>
    !q || [p.client, p.invoice, p.ref].join(' ').toLowerCase().includes(q.toLowerCase())
  ), [payments, q])

  const today = new Date().toISOString().slice(0,10)

  const totalReceived = useMemo(() => payments.reduce((a,p)=>a+Number(p.paid||0),0),[payments])
  const totalPending = useMemo(() => payments.filter(p=>p.status!=='Paid').reduce((a,p)=>a+Number(p.remaining||0),0),[payments])

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true) }
  const openEdit = (p) => { setForm({ ...p }); setEditId(p.id); setModal(true) }

  const f = (k) => (e) => {
    setForm(p => {
      const next = { ...p, [k]: e.target.value }
      if (k==='paid'||k==='invoiceTotal') {
        const rem = Number(next.invoiceTotal) - Number(next.paid)
        const status = rem <= 0 ? 'Paid' : 'Partial'
        return { ...next, remaining: rem < 0 ? 0 : rem, status }
      }
      return next
    })
  }

  const selectInvoice = (e) => {
    const inv = invoices.find(i => i.number === e.target.value)
    if (inv) setForm(p => ({ ...p, invoice: inv.number, client: inv.client, invoiceTotal: inv.total, paid: inv.received, remaining: inv.pending, status: inv.status }))
  }

  const save = () => {
    if (!form.client) return toast.error('Client required')
    if (editId) {
      setPayments(ps => ps.map(p => p.id === editId ? { ...form, id: editId } : p))
      toast.success('Updated')
    } else {
      setPayments(ps => [{ ...form, id: uid(), createdAt: new Date().toISOString() }, ...ps])
      toast.success('Payment recorded')
    }
    setModal(false)
  }

  const remove = (id) => { setPayments(ps => ps.filter(p => p.id !== id)); toast.success('Deleted') }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-sub">{payments.length} payment records</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary btn-sm"><Plus size={14} /> Record Payment</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['Total Payments', payments.length],['Total Received', formatINR(totalReceived)],['Pending', formatINR(totalPending)],['Paid Invoices', payments.filter(p=>p.status==='Paid').length]].map(([l,v]) => (
          <div key={l} className="stat-card" style={{ padding:'14px 16px' }}>
            <p style={{ fontSize:11, color:'#777', marginBottom:4 }}>{l}</p>
            <p style={{ fontSize:20, fontWeight:700 }}>{v}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding:'14px 16px' }}>
        <div className="relative" style={{ maxWidth:300 }}>
          <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#AAA' }} />
          <input className="inp" style={{ paddingLeft:30, fontSize:13 }} placeholder="Search..." value={q} onChange={e=>setQ(e.target.value)} />
        </div>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table className="tbl">
            <thead>
              <tr><th>Client</th><th>Invoice</th><th>Invoice Total</th><th>Amount Paid</th><th>Remaining</th><th>Date</th><th>Mode</th><th>Reference</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length===0 && <tr><td colSpan={10} style={{ textAlign:'center', padding:40, color:'#AAA' }}>No payments</td></tr>}
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight:600 }}>{p.client}</td>
                  <td style={{ fontSize:13, color:'#777' }}>{p.invoice||'—'}</td>
                  <td style={{ fontWeight:600 }}>{formatINR(p.invoiceTotal)}</td>
                  <td style={{ color:'#2E8B57', fontWeight:700 }}>{formatINR(p.paid)}</td>
                  <td style={{ color:Number(p.remaining)>0?'#D89B2B':'#777', fontWeight:600 }}>{formatINR(p.remaining)}</td>
                  <td style={{ fontSize:12, color:'#777' }}>{p.date}</td>
                  <td style={{ fontSize:12 }}>{p.mode}</td>
                  <td style={{ fontSize:12, color:'#777', maxWidth:120, overflow:'hidden', textOverflow:'ellipsis' }}>{p.ref||'—'}</td>
                  <td><StatusBadge label={p.status} /></td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={()=>openEdit(p)} className="btn btn-ghost btn-xs"><Edit2 size={12} /></button>
                      <button onClick={()=>setConfirmId(p.id)} className="btn btn-danger btn-xs"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={editId?'Edit Payment':'Record Payment'}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Invoice</label>
            <select className="inp" value={form.invoice} onChange={selectInvoice}>
              <option value="">Select invoice (optional)</option>
              {invoices.map(i=><option key={i.id}>{i.number}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Client *</label><input className="inp" value={form.client} onChange={f('client')} /></div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Invoice Total (₹)</label><input className="inp" type="number" value={form.invoiceTotal} onChange={f('invoiceTotal')} /></div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Amount Paid (₹)</label><input className="inp" type="number" value={form.paid} onChange={f('paid')} /></div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Payment Date</label><input className="inp" type="date" value={form.date} onChange={f('date')} /></div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Payment Mode</label>
              <select className="inp" value={form.mode} onChange={f('mode')}>{MODES.map(m=><option key={m}>{m}</option>)}</select>
            </div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Reference</label><input className="inp" value={form.ref} onChange={f('ref')} /></div>
          </div>
          <div style={{ display:'flex', gap:16, alignItems:'center' }}>
            <p style={{ fontSize:13 }}>Remaining: <span style={{ fontWeight:700, color:'#D89B2B' }}>{formatINR(form.remaining)}</span></p>
            <StatusBadge label={form.status} />
          </div>
          <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Notes</label><textarea className="inp" rows={2} value={form.notes} onChange={f('notes')} style={{ resize:'vertical' }} /></div>
          <div className="flex gap-3 justify-end pt-2">
            <button className="btn btn-ghost btn-sm" onClick={()=>setModal(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={save}>Save Payment</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirmId} onClose={()=>setConfirmId(null)} onConfirm={()=>remove(confirmId)} />
    </div>
  )
}
