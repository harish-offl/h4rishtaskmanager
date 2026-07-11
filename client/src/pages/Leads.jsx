import { useState, useMemo } from 'react'
import { Plus, Search, Filter, Download, Upload, Eye, Edit2, Trash2, UserPlus, MoreHorizontal } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { uid, formatINR } from '../store/data'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

const STATUSES = ['New','Not Contacted','Contacted','Follow-Up Required','Interested','Meeting Scheduled','Proposal Sent','Negotiation','Converted','Not Interested','Lost','On Hold']
const PRIORITIES = ['Low','Medium','High','Urgent']
const SOURCES = ['Instagram','Facebook','Google','LinkedIn','Referral','Walk-in','WhatsApp','Cold Call','Website','Other']
const SERVICES = ['Social Media Marketing','Video Editing','Graphic Design','Website Development','UI/UX Design','Photography','Videography','Content Creation','Meta Ads','Branding','Email Automation','AI Automation','Event Management','Other']

const EMPTY = { name:'', company:'', phone:'', whatsapp:'', email:'', industry:'', category:'', location:'', source:'Instagram', service:'Social Media Marketing', value:'', assigned:'', priority:'Medium', status:'New', firstContact:'', lastContact:'', nextFollowup:'', expectedClose:'', notes:'' }

export default function Leads() {
  const { leads, setLeads } = useApp()
  const [q, setQ] = useState('')
  const [statusF, setStatusF] = useState('')
  const [priorityF, setPriorityF] = useState('')
  const [view, setView] = useState('table') // table | kanban
  const [modal, setModal] = useState(null) // null | 'add' | 'edit' | 'view'
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [page, setPage] = useState(1)
  const PER = 10

  const filtered = useMemo(() => leads.filter(l => {
    const mq = !q || [l.name, l.company, l.phone, l.email, l.service].join(' ').toLowerCase().includes(q.toLowerCase())
    const ms = !statusF || l.status === statusF
    const mp = !priorityF || l.priority === priorityF
    return mq && ms && mp
  }), [leads, q, statusF, priorityF])

  const pages = Math.ceil(filtered.length / PER)
  const pageData = filtered.slice((page-1)*PER, page*PER)

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal('add') }
  const openEdit = (l) => { setForm({ ...l }); setEditId(l.id); setModal('edit') }
  const openView = (l) => { setForm({ ...l }); setModal('view') }

  const save = () => {
    if (!form.name.trim()) return toast.error('Lead name required')
    if (editId) {
      setLeads(ls => ls.map(l => l.id === editId ? { ...form, id: editId, updatedAt: new Date().toISOString() } : l))
      toast.success('Lead updated')
    } else {
      setLeads(ls => [{ ...form, id: uid(), createdAt: new Date().toISOString() }, ...ls])
      toast.success('Lead added')
    }
    setModal(null)
  }

  const remove = (id) => {
    setLeads(ls => ls.filter(l => l.id !== id))
    toast.success('Lead deleted')
  }

  const convertToClient = (l) => {
    toast.success(`${l.name} marked as Converted`)
    setLeads(ls => ls.map(x => x.id === l.id ? { ...x, status: 'Converted' } : x))
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Leads Management</h1>
          <p className="page-sub">{leads.length} total leads · {leads.filter(l=>l.status==='Converted').length} converted</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setView(v => v === 'table' ? 'kanban' : 'table')} className="btn btn-ghost btn-sm">
            {view === 'table' ? 'Kanban View' : 'Table View'}
          </button>
          <button onClick={openAdd} className="btn btn-primary btn-sm"><Plus size={14} /> Add Lead</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['Total', leads.length,'#1F1F1F'],['Follow-Up', leads.filter(l=>l.status==='Follow-Up Required').length,'#D89B2B'],['Converted', leads.filter(l=>l.status==='Converted').length,'#2E8B57'],['Lost', leads.filter(l=>l.status==='Lost').length,'#D9534F']].map(([l,v,c]) => (
          <div key={l} className="stat-card" style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: 11, color: '#777', marginBottom: 4 }}>{l}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: c }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1" style={{ minWidth: 180 }}>
            <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#AAA' }} />
            <input className="inp" style={{ paddingLeft: 30, fontSize: 13 }} placeholder="Search leads..." value={q} onChange={e => { setQ(e.target.value); setPage(1) }} />
          </div>
          <select className="inp" style={{ width: 160 }} value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1) }}>
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="inp" style={{ width: 140 }} value={priorityF} onChange={e => { setPriorityF(e.target.value); setPage(1) }}>
            <option value="">All Priority</option>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {view === 'table' ? (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Lead</th><th>Company</th><th>Phone</th>
                  <th>Service</th><th>Source</th><th>Value</th>
                  <th>Assigned</th><th>Follow-Up</th><th>Priority</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageData.length === 0 && (
                  <tr><td colSpan={11} style={{ textAlign: 'center', padding: 40, color: '#AAA' }}>No leads found</td></tr>
                )}
                {pageData.map(l => (
                  <tr key={l.id}>
                    <td><span style={{ fontWeight: 600 }}>{l.name}</span></td>
                    <td style={{ color: '#777', fontSize: 13 }}>{l.company}</td>
                    <td style={{ fontSize: 13 }}>{l.phone}</td>
                    <td style={{ fontSize: 13 }}>{l.service}</td>
                    <td style={{ fontSize: 12, color: '#777' }}>{l.source}</td>
                    <td style={{ fontWeight: 600 }}>{formatINR(l.value)}</td>
                    <td style={{ fontSize: 13 }}>{l.assigned}</td>
                    <td style={{ fontSize: 12, color: l.nextFollowup && l.nextFollowup < new Date().toISOString().slice(0,10) ? '#D9534F' : '#777' }}>{l.nextFollowup || '—'}</td>
                    <td><StatusBadge label={l.priority} /></td>
                    <td><StatusBadge label={l.status} /></td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => openView(l)} className="btn btn-ghost btn-xs" title="View"><Eye size={12} /></button>
                        <button onClick={() => openEdit(l)} className="btn btn-ghost btn-xs" title="Edit"><Edit2 size={12} /></button>
                        <button onClick={() => convertToClient(l)} className="btn btn-ghost btn-xs" title="Convert"><UserPlus size={12} /></button>
                        <button onClick={() => setConfirmId(l.id)} className="btn btn-danger btn-xs" title="Delete"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid #F0F0F0' }}>
              <span style={{ fontSize: 12, color: '#777' }}>Showing {(page-1)*PER+1}–{Math.min(page*PER, filtered.length)} of {filtered.length}</span>
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-xs" disabled={page===1} onClick={() => setPage(p=>p-1)}>Prev</button>
                <button className="btn btn-ghost btn-xs" disabled={page===pages} onClick={() => setPage(p=>p+1)}>Next</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <KanbanView leads={filtered} onEdit={openEdit} onDelete={id => setConfirmId(id)} onConvert={convertToClient} setLeads={setLeads} />
      )}

      {/* Add/Edit Modal */}
      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)}
        title={modal === 'edit' ? 'Edit Lead' : 'Add New Lead'} maxW="640px">
        <LeadForm form={form} f={f} onSave={save} onCancel={() => setModal(null)} />
      </Modal>

      {/* View Modal */}
      <Modal open={modal === 'view'} onClose={() => setModal(null)} title="Lead Details" maxW="580px">
        <LeadView lead={form} onEdit={() => { setEditId(form.id); setModal('edit') }} />
      </Modal>

      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={() => remove(confirmId)} message="Delete this lead? This cannot be undone." />
    </div>
  )
}

function LeadForm({ form, f, onSave, onCancel }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="grid grid-cols-2 gap-3">
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Lead Name *</label><input className="inp" value={form.name} onChange={f('name')} placeholder="Contact name" /></div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Company</label><input className="inp" value={form.company} onChange={f('company')} placeholder="Business name" /></div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Phone</label><input className="inp" value={form.phone} onChange={f('phone')} /></div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Email</label><input className="inp" type="email" value={form.email} onChange={f('email')} /></div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Service</label>
          <select className="inp" value={form.service} onChange={f('service')}>{SERVICES.map(s=><option key={s}>{s}</option>)}</select>
        </div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Lead Source</label>
          <select className="inp" value={form.source} onChange={f('source')}>{SOURCES.map(s=><option key={s}>{s}</option>)}</select>
        </div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Estimated Value (₹)</label><input className="inp" type="number" value={form.value} onChange={f('value')} /></div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Assigned To</label><input className="inp" value={form.assigned} onChange={f('assigned')} /></div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Priority</label>
          <select className="inp" value={form.priority} onChange={f('priority')}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select>
        </div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Status</label>
          <select className="inp" value={form.status} onChange={f('status')}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
        </div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Next Follow-Up</label><input className="inp" type="date" value={form.nextFollowup} onChange={f('nextFollowup')} /></div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Expected Close</label><input className="inp" type="date" value={form.expectedClose} onChange={f('expectedClose')} /></div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Location</label><input className="inp" value={form.location} onChange={f('location')} /></div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Industry</label><input className="inp" value={form.industry} onChange={f('industry')} /></div>
      </div>
      <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Notes</label><textarea className="inp" rows={3} value={form.notes} onChange={f('notes')} style={{ resize: 'vertical' }} /></div>
      <div className="flex gap-3 justify-end pt-2">
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={onSave}>Save Lead</button>
      </div>
    </div>
  )
}

function LeadView({ lead, onEdit }) {
  const rows = [['Company', lead.company], ['Phone', lead.phone], ['Email', lead.email], ['Service', lead.service], ['Source', lead.source], ['Value', formatINR(lead.value)], ['Assigned', lead.assigned], ['Follow-Up', lead.nextFollowup || '—'], ['Location', lead.location || '—'], ['Notes', lead.notes || '—']]
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1F1F1F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>{lead.name?.[0]?.toUpperCase()}</div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 16 }}>{lead.name}</p>
          <div className="flex gap-2 mt-1"><StatusBadge label={lead.status} /><StatusBadge label={lead.priority} /></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {rows.map(([k,v]) => (
          <div key={k}><p style={{ fontSize: 11, color: '#777', marginBottom: 2 }}>{k}</p><p style={{ fontSize: 13, fontWeight: 500 }}>{v}</p></div>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <button className="btn btn-primary btn-sm" onClick={onEdit}><Edit2 size={13} /> Edit Lead</button>
      </div>
    </div>
  )
}

const KANBAN_COLS = ['New','Contacted','Interested','Proposal Sent','Negotiation','Converted','Lost']

function KanbanView({ leads, onEdit, onDelete, onConvert, setLeads }) {
  const byStatus = (s) => leads.filter(l => {
    if (s === 'New') return l.status === 'New' || l.status === 'Not Contacted'
    if (s === 'Contacted') return l.status === 'Contacted' || l.status === 'Meeting Scheduled'
    return l.status === s
  })

  return (
    <div className="kanban-scroll" style={{ paddingBottom: 8 }}>
      {KANBAN_COLS.map(col => (
        <div key={col} className="kanban-col" style={{ minHeight: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#555' }}>{col}</p>
            <span style={{ fontSize: 11, color: '#AAA', background: '#E3E3E3', borderRadius: 99, padding: '1px 7px' }}>{byStatus(col).length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {byStatus(col).map(l => (
              <div key={l.id} className="card" style={{ padding: '12px 14px' }}>
                <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{l.name}</p>
                <p style={{ fontSize: 12, color: '#777', marginBottom: 6 }}>{l.company}</p>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{formatINR(l.value)}</span>
                  <StatusBadge label={l.priority} />
                </div>
                {l.assigned && <p style={{ fontSize: 11, color: '#AAA', marginTop: 5 }}>{l.assigned}</p>}
                <div className="flex gap-1 mt-2">
                  <button onClick={() => onEdit(l)} className="btn btn-ghost btn-xs"><Edit2 size={11} /></button>
                  {col !== 'Converted' && <button onClick={() => onConvert(l)} className="btn btn-ghost btn-xs"><UserPlus size={11} /></button>}
                  <button onClick={() => onDelete(l.id)} className="btn btn-danger btn-xs"><Trash2 size={11} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
