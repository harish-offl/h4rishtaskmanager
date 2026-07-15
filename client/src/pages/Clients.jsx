import { useState, useMemo } from 'react'
import { Plus, Search, Eye, Edit2, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { uid, formatINR } from '../store/data'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

const STATUSES = ['Active','Inactive','Completed','On Hold','Recurring Client']
const EMPTY = { name:'', company:'', phone:'', whatsapp:'', email:'', address:'', industry:'', services:[], manager:'', projectValue:0, totalRevenue:0, pending:0, status:'Active', notes:'' }

export default function Clients() {
  const { clients, setClients } = useApp()
  const [q, setQ] = useState('')
  const [statusF, setStatusF] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const filtered = useMemo(() => clients.filter(c => {
    const mq = !q || [c.name, c.company, c.email, c.phone].join(' ').toLowerCase().includes(q.toLowerCase())
    return mq && (!statusF || c.status === statusF)
  }), [clients, q, statusF])

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal('form') }
  const openEdit = (c) => { setForm({ ...c }); setEditId(c.id); setModal('form') }

  const save = () => {
    if (!form.name.trim()) return toast.error('Client name required')
    if (!form.services || (Array.isArray(form.services) && form.services.filter(s => s?.trim()).length === 0)) return toast.error('Service details required')
    if (Number.isNaN(Number(form.projectValue))) return toast.error('Project value required')
    if (Number.isNaN(Number(form.totalRevenue))) return toast.error('Revenue required')
    if (Number.isNaN(Number(form.pending))) return toast.error('Pending amount required')

    const nextForm = {
      ...form,
      services: Array.isArray(form.services)
        ? form.services.filter(s => s?.trim())
        : String(form.services).split(',').map(s => s.trim()).filter(Boolean),
      projectValue: Number(form.projectValue) || 0,
      totalRevenue: Number(form.totalRevenue) || 0,
      pending: Number(form.pending) || 0,
    }

    if (editId) {
      setClients(cs => cs.map(c => c.id === editId ? { ...nextForm, id: editId } : c))
      toast.success('Client updated')
    } else {
      setClients(cs => [{ ...nextForm, id: uid(), createdAt: new Date().toISOString() }, ...cs])
      toast.success('Client added')
    }
    setModal(null)
  }

  const remove = (id) => { setClients(cs => cs.filter(c => c.id !== id)); toast.success('Deleted') }
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-sub">{clients.filter(c=>c.status==='Active').length} active clients</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary btn-sm"><Plus size={14} /> Add Client</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['Total', clients.length],['Active', clients.filter(c=>c.status==='Active').length],['Total Advance', formatINR(clients.reduce((a,c)=>a+Number(c.totalRevenue||0),0))],['Pending', formatINR(clients.reduce((a,c)=>a+Number(c.pending||0),0))]].map(([l,v]) => (
          <div key={l} className="stat-card" style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: 11, color: '#777', marginBottom: 4 }}>{l}</p>
            <p style={{ fontSize: 20, fontWeight: 700 }}>{v}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '14px 16px' }}>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1" style={{ minWidth: 180 }}>
            <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#AAA' }} />
            <input className="inp" style={{ paddingLeft: 30, fontSize: 13 }} placeholder="Search clients..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <select className="inp" style={{ width: 160 }} value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr><th>Client</th><th>Company</th><th>Phone</th><th>Services</th><th>Manager</th><th>Project Value</th><th>Advance</th><th>Pending</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={10} style={{ textAlign:'center', padding: 40, color:'#AAA' }}>No clients found</td></tr>}
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ color: '#777', fontSize: 13 }}>{c.company}</td>
                  <td style={{ fontSize: 13 }}>{c.phone}</td>
                  <td style={{ fontSize: 12, color: '#777' }}>{Array.isArray(c.services) ? c.services.join(', ') : c.services}</td>
                  <td style={{ fontSize: 13 }}>{c.manager}</td>
                  <td style={{ fontWeight: 600 }}>{formatINR(c.projectValue)}</td>
                  <td style={{ color: '#2E8B57', fontWeight: 600 }}>{formatINR(c.totalRevenue)}</td>
                  <td style={{ color: c.pending > 0 ? '#D89B2B' : '#777', fontWeight: 600 }}>{formatINR(c.pending)}</td>
                  <td><StatusBadge label={c.status} /></td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="btn btn-ghost btn-xs"><Edit2 size={12} /></button>
                      <button onClick={() => setConfirmId(c.id)} className="btn btn-danger btn-xs"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={editId ? 'Edit Client' : 'Add Client'} maxW="600px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="grid grid-cols-2 gap-3">
            {[['name','Client Name *'],['company','Company'],['phone','Phone'],['email','Email'],['whatsapp','WhatsApp'],['address','Billing Address'],['industry','Industry'],['manager','Account Manager']].map(([k,l]) => (
              <div key={k}><label style={{ fontSize: 12, color: '#777', display:'block', marginBottom: 3 }}>{l}</label><input className="inp" value={form[k]||''} onChange={f(k)} /></div>
            ))}
            <div><label style={{ fontSize: 12, color: '#777', display:'block', marginBottom: 3 }}>Services *</label>
              <input className="inp" value={Array.isArray(form.services) ? form.services.join(', ') : form.services || ''} onChange={e => setForm(p => ({ ...p, services: e.target.value }))} placeholder="Enter comma-separated services" />
            </div>
            <div><label style={{ fontSize: 12, color: '#777', display:'block', marginBottom: 3 }}>Project Value *</label>
              <input className="inp" type="number" min="0" value={form.projectValue || ''} onChange={e => setForm(p => ({ ...p, projectValue: e.target.value }))} />
            </div>
            <div><label style={{ fontSize: 12, color: '#777', display:'block', marginBottom: 3 }}>Advance *</label>
              <input className="inp" type="number" min="0" value={form.totalRevenue || ''} onChange={e => setForm(p => ({ ...p, totalRevenue: e.target.value }))} />
            </div>
            <div><label style={{ fontSize: 12, color: '#777', display:'block', marginBottom: 3 }}>Pending *</label>
              <input className="inp" type="number" min="0" value={form.pending || ''} onChange={e => setForm(p => ({ ...p, pending: e.target.value }))} />
            </div>
            <div><label style={{ fontSize: 12, color: '#777', display:'block', marginBottom: 3 }}>Status</label>
              <select className="inp" value={form.status} onChange={f('status')}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={save}>Save Client</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={() => remove(confirmId)} />
    </div>
  )
}
