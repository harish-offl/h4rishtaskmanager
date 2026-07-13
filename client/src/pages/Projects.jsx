import { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { uid, formatINR } from '../store/data'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

const STATUSES = ['Planning','Not Started','In Progress','Under Review','Client Approval','Completed','On Hold','Cancelled']
const PRIORITIES = ['Low','Medium','High','Urgent']
const TYPES = ['Social Media Marketing','Video Editing','Graphic Design','Website Development','UI/UX Design','Photography','Videography','Content Creation','Meta Ads','Branding','Email Automation','AI Automation','Event Management','Other']

const EMPTY = { name:'', client:'', type:'Social Media Marketing', service:'', manager:'', team:'', start:'', deadline:'', value:0, received:0, pending:0, progress:0, priority:'Medium', status:'Not Started', description:'', notes:'' }

export default function Projects() {
  const { projects, setProjects, clients } = useApp()
  const [q, setQ] = useState('')
  const [statusF, setStatusF] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const filtered = useMemo(() => projects.filter(p => {
    const mq = !q || [p.name, p.client, p.type].join(' ').toLowerCase().includes(q.toLowerCase())
    return mq && (!statusF || p.status === statusF)
  }), [projects, q, statusF])

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true) }
  const openEdit = (p) => { setForm({ ...p }); setEditId(p.id); setModal(true) }

  const save = () => {
    if (!form.name.trim()) return toast.error('Project name required')
    const pend = Number(form.value) - Number(form.received)
    if (editId) {
      setProjects(ps => ps.map(p => p.id === editId ? { ...form, pending: pend, id: editId } : p))
      toast.success('Project updated')
    } else {
      setProjects(ps => [{ ...form, pending: pend, id: uid(), createdAt: new Date().toISOString() }, ...ps])
      toast.success('Project added')
    }
    setModal(false)
  }

  const remove = (id) => { setProjects(ps => ps.filter(p => p.id !== id)); toast.success('Deleted') }
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const statusColor = (s) => ({ 'In Progress':'#4D7CFE','Completed':'#2E8B57','On Hold':'#D89B2B','Cancelled':'#D9534F' }[s] || '#777')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-sub">{projects.filter(p=>p.status==='In Progress').length} active projects</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary btn-sm"><Plus size={14} /> Add Project</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['Total', projects.length],['Active', projects.filter(p=>p.status==='In Progress').length],['Completed', projects.filter(p=>p.status==='Completed').length],['Pending Revenue', formatINR(projects.reduce((a,p)=>a+Number(p.pending||0),0))]].map(([l,v]) => (
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
            <input className="inp" style={{ paddingLeft: 30, fontSize: 13 }} placeholder="Search projects..." value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <select className="inp" style={{ width: 160 }} value={statusF} onChange={e => setStatusF(e.target.value)}>
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.length === 0 && <p style={{ color: '#AAA', fontSize: 13, padding: 20 }}>No projects found</p>}
        {filtered.map(p => (
          <div key={p.id} className="card card-hover" style={{ padding: 18 }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</p>
                <p style={{ fontSize: 12, color: '#777', marginTop: 2 }}>{p.client} · {p.type}</p>
              </div>
              <StatusBadge label={p.status} />
            </div>
            <div className="flex items-center justify-between mb-1">
              <span style={{ fontSize: 12, color: '#777' }}>Progress</span>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{p.progress}%</span>
            </div>
            <div className="prog-bar mb-3"><div className="prog-fill" style={{ width: `${p.progress}%` }} /></div>
            <div className="grid grid-cols-3 gap-2" style={{ marginBottom: 12 }}>
              <div><p style={{ fontSize: 10, color: '#AAA' }}>Value</p><p style={{ fontSize: 13, fontWeight: 700 }}>{formatINR(p.value)}</p></div>
              <div><p style={{ fontSize: 10, color: '#AAA' }}>Received</p><p style={{ fontSize: 13, fontWeight: 700, color: '#2E8B57' }}>{formatINR(p.received)}</p></div>
              <div><p style={{ fontSize: 10, color: '#AAA' }}>Pending</p><p style={{ fontSize: 13, fontWeight: 700, color: Number(p.pending) > 0 ? '#D89B2B' : '#777' }}>{formatINR(p.pending)}</p></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusBadge label={p.priority} />
                {p.deadline && <span style={{ fontSize: 11, color: '#777' }}>Due {p.deadline}</span>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(p)} className="btn btn-ghost btn-xs"><Edit2 size={12} /></button>
                <button onClick={() => setConfirmId(p.id)} className="btn btn-danger btn-xs"><Trash2 size={12} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Project' : 'Add Project'} maxW="620px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label style={{ fontSize: 12, color: '#777', display:'block', marginBottom: 3 }}>Project Name *</label><input className="inp" value={form.name} onChange={f('name')} /></div>
            <div><label style={{ fontSize: 12, color: '#777', display:'block', marginBottom: 3 }}>Client</label>
              <select className="inp" value={form.client} onChange={f('client')}>
                <option value="">Select client</option>
                {clients.map(c => <option key={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label style={{ fontSize: 12, color: '#777', display:'block', marginBottom: 3 }}>Project Type</label>
              <select className="inp" value={form.type} onChange={f('type')}>{TYPES.map(t=><option key={t}>{t}</option>)}</select>
            </div>
            <div><label style={{ fontSize: 12, color: '#777', display:'block', marginBottom: 3 }}>Manager</label><input className="inp" value={form.manager} onChange={f('manager')} /></div>
            <div><label style={{ fontSize: 12, color: '#777', display:'block', marginBottom: 3 }}>Start Date</label><input className="inp" type="date" value={form.start} onChange={f('start')} /></div>
            <div><label style={{ fontSize: 12, color: '#777', display:'block', marginBottom: 3 }}>Deadline</label><input className="inp" type="date" value={form.deadline} onChange={f('deadline')} /></div>
            <div><label style={{ fontSize: 12, color: '#777', display:'block', marginBottom: 3 }}>Project Value (₹)</label><input className="inp" type="number" value={form.value} onChange={f('value')} /></div>
            <div><label style={{ fontSize: 12, color: '#777', display:'block', marginBottom: 3 }}>Amount Received (₹)</label><input className="inp" type="number" value={form.received} onChange={f('received')} /></div>
            <div><label style={{ fontSize: 12, color: '#777', display:'block', marginBottom: 3 }}>Progress (%)</label><input className="inp" type="number" min={0} max={100} value={form.progress} onChange={f('progress')} /></div>
            <div><label style={{ fontSize: 12, color: '#777', display:'block', marginBottom: 3 }}>Priority</label>
              <select className="inp" value={form.priority} onChange={f('priority')}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select>
            </div>
            <div><label style={{ fontSize: 12, color: '#777', display:'block', marginBottom: 3 }}>Status</label>
              <select className="inp" value={form.status} onChange={f('status')}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
            </div>
          </div>
          <div><label style={{ fontSize: 12, color: '#777', display:'block', marginBottom: 3 }}>Description</label><textarea className="inp" rows={2} value={form.description} onChange={f('description')} style={{ resize:'vertical' }} /></div>
          <div className="flex gap-3 justify-end pt-2">
            <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={save}>Save Project</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={() => remove(confirmId)} />
    </div>
  )
}
