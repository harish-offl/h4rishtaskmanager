import { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2, Eye, Download } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { uid, formatINR } from '../store/data'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

const PROJECT_TYPES = ['Social Media Marketing','Video Editing','Graphic Design','Website Development','UI/UX Design','Photography','Videography','Content Creation','Meta Ads','Branding','Email Automation','AI Automation','Event Management','Other']
const BILLING_PERIODS = ['One-Time','Weekly','Monthly','Quarterly','Half-Yearly','Yearly','Custom']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const PAYMENT_METHODS = ['Cash','UPI','Bank Transfer','Credit Card','Cheque','Other']

const NEW_SERVICE = { name:'', desc:'', qty:1, rate:0, discount:0, tax:0, total:0 }

function calcService(s) {
  const sub = s.qty * s.rate
  const disc = sub * (s.discount / 100)
  const taxAmt = (sub - disc) * (s.tax / 100)
  return { ...s, total: +(sub - disc + taxAmt).toFixed(2) }
}

function calcStatus(inv) {
  const rec = Number(inv.received || 0)
  const tot = Number(inv.total || 0)
  const today = new Date().toISOString().slice(0,10)
  if (rec >= tot) return 'Paid'
  if (rec > 0 && rec < tot) {
    if (inv.dueDate && inv.dueDate < today) return 'Overdue'
    return 'Partially Paid'
  }
  if (inv.dueDate && inv.dueDate < today) return 'Overdue'
  return 'Pending'
}

const EMPTY_INV = {
  number: '', business: 'Arrise Digital', client: '', company: '', phone: '', email: '',
  date: new Date().toISOString().slice(0,10), dueDate: '', billing: 'Monthly', billingMonth: 'July 2026',
  projectType: 'Social Media Marketing', services: [{ ...NEW_SERVICE }],
  total: 0, received: 0, pending: 0, cleared: 'No', status: 'Pending',
  method: 'UPI', receivedDate: '', notes: ''
}

export default function Invoices() {
  const { invoices, setInvoices, clients } = useApp()
  const [q, setQ] = useState('')
  const [statusF, setStatusF] = useState('')
  const [modal, setModal] = useState(null) // 'form' | 'view'
  const [form, setForm] = useState(EMPTY_INV)
  const [editId, setEditId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [page, setPage] = useState(1); const PER = 10

  const filtered = useMemo(() => invoices.filter(i => {
    const mq = !q || [i.number, i.client, i.company, i.projectType].join(' ').toLowerCase().includes(q.toLowerCase())
    return mq && (!statusF || i.status === statusF)
  }), [invoices, q, statusF])

  const pages = Math.ceil(filtered.length / PER)
  const pageData = filtered.slice((page-1)*PER, page*PER)

  const totalInvoiced = useMemo(() => invoices.reduce((a,i)=>a+Number(i.total||0),0),[invoices])
  const totalReceived = useMemo(() => invoices.reduce((a,i)=>a+Number(i.received||0),0),[invoices])
  const totalPending = useMemo(() => invoices.reduce((a,i)=>a+Number(i.pending||0),0),[invoices])
  const totalOverdue = useMemo(() => invoices.filter(i=>i.status==='Overdue').reduce((a,i)=>a+Number(i.pending||0),0),[invoices])

  const openAdd = () => {
    const nextNum = `AD-INV-${String(invoices.length + 1).padStart(3,'0')}`
    setForm({ ...EMPTY_INV, number: nextNum }); setEditId(null); setModal('form')
  }
  const openEdit = (i) => { setForm({ ...i }); setEditId(i.id); setModal('form') }
  const openView = (i) => { setForm({ ...i }); setModal('view') }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const updateService = (idx, field, val) => {
    setForm(p => {
      const svs = [...p.services]
      svs[idx] = calcService({ ...svs[idx], [field]: field==='name'||field==='desc'?val:Number(val)||0 })
      const total = svs.reduce((a,s)=>a+s.total,0)
      const rec = Number(p.received||0)
      const pending = total - rec
      return { ...p, services: svs, total, pending, status: calcStatus({ ...p, total, pending }) }
    })
  }

  const addService = () => setForm(p => ({ ...p, services: [...p.services, { ...NEW_SERVICE }] }))
  const removeService = (idx) => setForm(p => {
    const svs = p.services.filter((_,i)=>i!==idx)
    const total = svs.reduce((a,s)=>a+s.total,0)
    return { ...p, services: svs, total, pending: total-Number(p.received||0) }
  })

  const updateReceived = (val) => setForm(p => {
    const rec = Number(val)||0
    const tot = p.total
    const pending = tot - rec
    const cleared = rec >= tot ? 'Yes' : rec > 0 ? 'Partially' : 'No'
    return { ...p, received: rec, pending, cleared, status: calcStatus({ ...p, received: rec, pending }) }
  })

  const save = () => {
    if (!form.client.trim()) return toast.error('Client name required')
    if (!form.number.trim()) return toast.error('Invoice number required')
    if (editId) {
      setInvoices(is => is.map(i => i.id === editId ? { ...form, id: editId } : i))
      toast.success('Invoice updated')
    } else {
      if (invoices.find(i => i.number === form.number)) return toast.error('Duplicate invoice number')
      setInvoices(is => [{ ...form, id: uid(), createdAt: new Date().toISOString() }, ...is])
      toast.success('Invoice created')
    }
    setModal(null)
  }

  const markPaid = (id) => {
    setInvoices(is => is.map(i => i.id === id ? { ...i, received: i.total, pending: 0, cleared:'Yes', status:'Paid' } : i))
    toast.success('Marked as paid!')
  }

  const remove = (id) => { setInvoices(is => is.filter(i => i.id !== id)); toast.success('Deleted') }

  const daysInfo = (dueDate) => {
    if (!dueDate) return null
    const diff = Math.ceil((new Date(dueDate) - new Date()) / 86400000)
    if (diff < 0) return { label: `${Math.abs(diff)}d overdue`, color: '#D9534F' }
    if (diff === 0) return { label: 'Due today', color: '#D89B2B' }
    if (diff <= 3) return { label: `Due in ${diff}d`, color: '#D89B2B' }
    return { label: `${diff} days left`, color: '#777' }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-sub">{invoices.length} total invoices</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary btn-sm"><Plus size={14} /> Create Invoice</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['Total Invoiced',formatINR(totalInvoiced),'#1F1F1F'],['Received',formatINR(totalReceived),'#2E8B57'],['Pending',formatINR(totalPending),'#D89B2B'],['Overdue',formatINR(totalOverdue),'#D9534F']].map(([l,v,c]) => (
          <div key={l} className="stat-card" style={{ padding:'14px 16px' }}>
            <p style={{ fontSize:11, color:'#777', marginBottom:4 }}>{l}</p>
            <p style={{ fontSize:20, fontWeight:700, color:c }}>{v}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding:'14px 16px' }}>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1" style={{ minWidth:180 }}>
            <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#AAA' }} />
            <input className="inp" style={{ paddingLeft:30, fontSize:13 }} placeholder="Search invoices..." value={q} onChange={e=>{setQ(e.target.value);setPage(1)}} />
          </div>
          <select className="inp" style={{ width:160 }} value={statusF} onChange={e=>{setStatusF(e.target.value);setPage(1)}}>
            <option value="">All Status</option>
            {['Paid','Partially Paid','Pending','Overdue','Cancelled','Refunded'].map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table className="tbl">
            <thead>
              <tr><th>Invoice #</th><th>Client</th><th>Date</th><th>Due Date</th><th>Type</th><th>Total</th><th>Received</th><th>Pending</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {pageData.length===0 && <tr><td colSpan={10} style={{ textAlign:'center', padding:40, color:'#AAA' }}>No invoices</td></tr>}
              {pageData.map(i => {
                const di = daysInfo(i.dueDate)
                return (
                  <tr key={i.id}>
                    <td style={{ fontWeight:700, fontSize:13 }}>{i.number}</td>
                    <td><p style={{ fontWeight:600, fontSize:13 }}>{i.client}</p><p style={{ fontSize:11, color:'#AAA' }}>{i.company}</p></td>
                    <td style={{ fontSize:12, color:'#777' }}>{i.date}</td>
                    <td><p style={{ fontSize:12 }}>{i.dueDate}</p>{di&&<p style={{ fontSize:10, color:di.color, fontWeight:600 }}>{di.label}</p>}</td>
                    <td style={{ fontSize:12, color:'#777' }}>{i.projectType}</td>
                    <td style={{ fontWeight:700 }}>{formatINR(i.total)}</td>
                    <td style={{ color:'#2E8B57', fontWeight:600 }}>{formatINR(i.received)}</td>
                    <td style={{ color:Number(i.pending)>0?'#D89B2B':'#777', fontWeight:600 }}>{formatINR(i.pending)}</td>
                    <td><StatusBadge label={i.status} /></td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={()=>openView(i)} className="btn btn-ghost btn-xs" title="View"><Eye size={12} /></button>
                        <button onClick={()=>openEdit(i)} className="btn btn-ghost btn-xs" title="Edit"><Edit2 size={12} /></button>
                        {i.status!=='Paid' && <button onClick={()=>markPaid(i.id)} className="btn btn-ghost btn-xs" style={{ fontSize:10 }} title="Mark Paid">✓</button>}
                        <button onClick={()=>setConfirmId(i.id)} className="btn btn-danger btn-xs"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {pages>1&&(
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop:'1px solid #F0F0F0' }}>
            <span style={{ fontSize:12, color:'#777' }}>Showing {(page-1)*PER+1}–{Math.min(page*PER,filtered.length)} of {filtered.length}</span>
            <div className="flex gap-2">
              <button className="btn btn-ghost btn-xs" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Prev</button>
              <button className="btn btn-ghost btn-xs" disabled={page===pages} onClick={()=>setPage(p=>p+1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modal==='form'} onClose={()=>setModal(null)} title={editId?'Edit Invoice':'Create Invoice'} maxW="700px">
        <InvoiceForm form={form} f={f} clients={clients} updateService={updateService} addService={addService} removeService={removeService} updateReceived={updateReceived} onSave={save} onCancel={()=>setModal(null)} />
      </Modal>

      {/* View Modal */}
      <Modal open={modal==='view'} onClose={()=>setModal(null)} title={`Invoice ${form.number}`} maxW="600px">
        <InvoiceView inv={form} onEdit={()=>{setEditId(form.id);setModal('form')}} />
      </Modal>

      <ConfirmDialog open={!!confirmId} onClose={()=>setConfirmId(null)} onConfirm={()=>remove(confirmId)} />
    </div>
  )
}

function InvoiceForm({ form, f, clients, updateService, addService, removeService, updateReceived, onSave, onCancel }) {
  const selectClient = (e) => {
    const c = clients.find(cl => cl.name === e.target.value)
    if (c) {
      f('client')({ target: { value: c.name } })
      f('company')({ target: { value: c.company } })
      f('phone')({ target: { value: c.phone } })
      f('email')({ target: { value: c.email } })
    } else {
      f('client')(e)
    }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Invoice Info */}
      <div className="grid grid-cols-2 gap-3">
        <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Invoice Number</label><input className="inp" value={form.number} onChange={f('number')} /></div>
        <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Business</label><input className="inp" value={form.business} onChange={f('business')} /></div>
        <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Invoice Date</label><input className="inp" type="date" value={form.date} onChange={f('date')} /></div>
        <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Due Date</label><input className="inp" type="date" value={form.dueDate} onChange={f('dueDate')} /></div>
      </div>

      {/* Client */}
      <div style={{ borderTop:'1px solid #F0F0F0', paddingTop:12 }}>
        <p style={{ fontSize:12, fontWeight:700, color:'#777', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Client Details</p>
        <div className="grid grid-cols-2 gap-3">
          <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Client</label>
            <select className="inp" value={form.client} onChange={selectClient}>
              <option value="">Select or type below</option>
              {clients.map(c=><option key={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Company</label><input className="inp" value={form.company} onChange={f('company')} /></div>
          <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Phone</label><input className="inp" value={form.phone} onChange={f('phone')} /></div>
          <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Email</label><input className="inp" value={form.email} onChange={f('email')} /></div>
        </div>
      </div>

      {/* Billing */}
      <div className="grid grid-cols-3 gap-3">
        <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Billing Period</label>
          <select className="inp" value={form.billing} onChange={f('billing')}>{BILLING_PERIODS.map(b=><option key={b}>{b}</option>)}</select>
        </div>
        {form.billing==='Monthly'&&<div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Month</label>
          <select className="inp" value={form.billingMonth} onChange={f('billingMonth')}>
            {MONTHS.map(m=><option key={m}>{m} 2026</option>)}
          </select>
        </div>}
        <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Project Type</label>
          <select className="inp" value={form.projectType} onChange={f('projectType')}>{PROJECT_TYPES.map(t=><option key={t}>{t}</option>)}</select>
        </div>
      </div>

      {/* Services */}
      <div>
        <p style={{ fontSize:12, fontWeight:700, color:'#777', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Services</p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {form.services.map((s,i) => (
            <div key={i} className="card" style={{ padding:'10px 12px' }}>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input className="inp" style={{ fontSize:13 }} placeholder="Service name" value={s.name} onChange={e=>updateService(i,'name',e.target.value)} />
                <input className="inp" style={{ fontSize:13 }} placeholder="Description" value={s.desc} onChange={e=>updateService(i,'desc',e.target.value)} />
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                {[['qty','Qty',60],['rate','Rate',80],['discount','Disc%',60],['tax','Tax%',60]].map(([k,l,w])=>(
                  <div key={k} style={{ flex:`0 0 ${w}px` }}>
                    <p style={{ fontSize:10, color:'#AAA', marginBottom:2 }}>{l}</p>
                    <input className="inp" style={{ fontSize:12, padding:'5px 8px' }} type="number" value={s[k]} onChange={e=>updateService(i,k,e.target.value)} />
                  </div>
                ))}
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:10, color:'#AAA', marginBottom:2 }}>Total</p>
                  <p style={{ fontSize:13, fontWeight:700, paddingTop:6 }}>{formatINR(s.total)}</p>
                </div>
                {form.services.length>1 && <button onClick={()=>removeService(i)} className="btn btn-danger btn-xs" style={{ marginTop:14 }}><Trash2 size={11} /></button>}
              </div>
            </div>
          ))}
          <button onClick={addService} style={{ border:'1.5px dashed #E3E3E3', borderRadius:8, padding:'10px', fontSize:13, color:'#AAA', background:'transparent', cursor:'pointer', width:'100%' }}>+ Add Service</button>
        </div>
        <div style={{ marginTop:10, textAlign:'right' }}>
          <p style={{ fontSize:14, fontWeight:700 }}>Grand Total: {formatINR(form.total)}</p>
        </div>
      </div>

      {/* Payment */}
      <div className="grid grid-cols-3 gap-3" style={{ borderTop:'1px solid #F0F0F0', paddingTop:12 }}>
        <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Amount Received (₹)</label>
          <input className="inp" type="number" value={form.received} onChange={e=>updateReceived(e.target.value)} />
        </div>
        <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Payment Method</label>
          <select className="inp" value={form.method} onChange={f('method')}>{PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}</select>
        </div>
        <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Payment Date</label>
          <input className="inp" type="date" value={form.receivedDate} onChange={f('receivedDate')} />
        </div>
        <div style={{ display:'flex', gap:16, alignItems:'center', marginTop:4 }}>
          <p style={{ fontSize:13 }}>Pending: <span style={{ fontWeight:700, color:'#D89B2B' }}>{formatINR(form.pending)}</span></p>
          <StatusBadge label={form.status} />
        </div>
      </div>

      <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Notes</label><textarea className="inp" rows={2} value={form.notes} onChange={f('notes')} style={{ resize:'vertical' }} /></div>

      <div className="flex gap-3 justify-end pt-2">
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={onSave}>Save Invoice</button>
      </div>
    </div>
  )
}

function InvoiceView({ inv, onEdit }) {
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
        <div>
          <p style={{ fontSize:11, color:'#777', textTransform:'uppercase', letterSpacing:'0.08em' }}>{inv.business}</p>
          <p style={{ fontSize:22, fontWeight:800, letterSpacing:-0.5, marginTop:2 }}>{inv.number}</p>
          <p style={{ fontSize:13, color:'#777' }}>{inv.date} · Due {inv.dueDate}</p>
        </div>
        <StatusBadge label={inv.status} />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div><p style={{ fontSize:11, color:'#AAA', marginBottom:4 }}>Client</p><p style={{ fontWeight:600 }}>{inv.client}</p><p style={{ fontSize:12, color:'#777' }}>{inv.company}</p></div>
        <div><p style={{ fontSize:11, color:'#AAA', marginBottom:4 }}>Type / Period</p><p style={{ fontWeight:600 }}>{inv.projectType}</p><p style={{ fontSize:12, color:'#777' }}>{inv.billing}{inv.billingMonth?` · ${inv.billingMonth}`:''}</p></div>
      </div>
      <div style={{ marginBottom:16 }}>
        <p style={{ fontSize:11, color:'#AAA', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Services</p>
        {(inv.services||[]).map((s,i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #F0F0F0' }}>
            <div><p style={{ fontSize:13, fontWeight:600 }}>{s.name}</p><p style={{ fontSize:11, color:'#777' }}>{s.desc} · {s.qty} × {formatINR(s.rate)}</p></div>
            <p style={{ fontSize:13, fontWeight:700 }}>{formatINR(s.total)}</p>
          </div>
        ))}
      </div>
      <div style={{ background:'#FAFAFA', borderRadius:8, padding:'12px 14px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}><span style={{ fontSize:13 }}>Total</span><span style={{ fontWeight:700 }}>{formatINR(inv.total)}</span></div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}><span style={{ fontSize:13, color:'#2E8B57' }}>Received</span><span style={{ fontWeight:700, color:'#2E8B57' }}>{formatINR(inv.received)}</span></div>
        <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ fontSize:13, color:'#D89B2B' }}>Pending</span><span style={{ fontWeight:700, color:'#D89B2B' }}>{formatINR(inv.pending)}</span></div>
      </div>
      {inv.notes && <p style={{ fontSize:12, color:'#777', marginTop:10 }}>Note: {inv.notes}</p>}
      <div className="flex justify-end mt-4">
        <button className="btn btn-primary btn-sm" onClick={onEdit}><Edit2 size={13} /> Edit Invoice</button>
      </div>
    </div>
  )
}
