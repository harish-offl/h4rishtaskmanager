import { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2, CheckCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { uid } from '../store/data'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

const STATUSES = ['To-Do','In Progress','Waiting','Under Review','Revision','Completed','Cancelled']
const PRIORITIES = ['Low','Medium','High','Urgent']
const EMPTY = { title:'', description:'', client:'', project:'', assigned:'', createdBy:'', start:'', due:'', time:'', priority:'Medium', status:'To-Do', progress:0, subtasks:[] }
const KANBAN_COLS = ['To-Do','In Progress','Under Review','Completed']

export default function Tasks() {
  const { tasks, setTasks, projects, clients } = useApp()
  const [q, setQ] = useState('')
  const [statusF, setStatusF] = useState('')
  const [priorityF, setPriorityF] = useState('')
  const [view, setView] = useState('table')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [page, setPage] = useState(1)
  const PER = 10

  const filtered = useMemo(() => tasks.filter(t => {
    const mq = !q || [t.title, t.client, t.assigned].join(' ').toLowerCase().includes(q.toLowerCase())
    return mq && (!statusF || t.status === statusF) && (!priorityF || t.priority === priorityF)
  }), [tasks, q, statusF, priorityF])

  const pages = Math.ceil(filtered.length / PER)
  const pageData = filtered.slice((page-1)*PER, page*PER)

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true) }
  const openEdit = (t) => { setForm({ ...t }); setEditId(t.id); setModal(true) }

  const save = () => {
    if (!form.title.trim()) return toast.error('Task title required')
    if (editId) {
      setTasks(ts => ts.map(t => t.id === editId ? { ...form, id: editId } : t))
      toast.success('Task updated')
    } else {
      setTasks(ts => [{ ...form, id: uid(), createdAt: new Date().toISOString() }, ...ts])
      toast.success('Task added')
    }
    setModal(false)
  }

  const markDone = (id) => {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, status: 'Completed', progress: 100 } : t))
    toast.success('Task completed!')
  }

  const remove = (id) => { setTasks(ts => ts.filter(t => t.id !== id)); toast.success('Deleted') }
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const today = new Date().toISOString().slice(0,10)
  const isOverdue = (t) => t.status !== 'Completed' && t.due && t.due < today

  const priorityDot = (p) => ({
    'Urgent': '#D9534F', 'High': '#D89B2B', 'Medium': '#4D7CFE', 'Low': '#2E8B57'
  }[p] || '#AAA')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-sub">{tasks.filter(t=>t.status!=='Completed').length} active · {tasks.filter(t=>isOverdue(t)).length} overdue</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView(v => v==='table'?'kanban':'table')} className="btn btn-ghost btn-sm">
            {view === 'table' ? 'Kanban' : 'Table'}
          </button>
          <button onClick={openAdd} className="btn btn-primary btn-sm"><Plus size={14} /> Add Task</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[['Total',tasks.length],['To-Do',tasks.filter(t=>t.status==='To-Do').length],['In Progress',tasks.filter(t=>t.status==='In Progress').length],['Completed',tasks.filter(t=>t.status==='Completed').length],['Overdue',tasks.filter(t=>isOverdue(t)).length]].map(([l,v],i) => (
          <div key={l} className="stat-card" style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: 11, color: '#777', marginBottom: 4 }}>{l}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: i===4&&v>0?'#D9534F':'inherit' }}>{v}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '14px 16px' }}>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1" style={{ minWidth: 180 }}>
            <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#AAA' }} />
            <input className="inp" style={{ paddingLeft: 30, fontSize: 13 }} placeholder="Search tasks..." value={q} onChange={e => { setQ(e.target.value); setPage(1) }} />
          </div>
          <select className="inp" style={{ width: 150 }} value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1) }}>
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
                <tr><th>Task</th><th>Client</th><th>Assigned</th><th>Due Date</th><th>Priority</th><th>Status</th><th>Progress</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {pageData.length === 0 && <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'#AAA' }}>No tasks</td></tr>}
                {pageData.map(t => (
                  <tr key={t.id} style={{ opacity: t.status === 'Cancelled' ? 0.5 : 1 }}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                        <span style={{ width:6, height:6, borderRadius:'50%', background: priorityDot(t.priority), flexShrink:0, display:'inline-block' }} />
                        <div>
                          <p style={{ fontWeight: 600, fontSize: 13 }}>{t.title}</p>
                          {t.description && <p style={{ fontSize: 11, color: '#AAA' }}>{t.description.slice(0,40)}...</p>}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: '#777' }}>{t.client || '—'}</td>
                    <td style={{ fontSize: 13 }}>{t.assigned}</td>
                    <td style={{ fontSize: 12, color: isOverdue(t) ? '#D9534F' : '#777' }}>{t.due || '—'}</td>
                    <td><StatusBadge label={t.priority} /></td>
                    <td><StatusBadge label={t.status} /></td>
                    <td style={{ minWidth: 80 }}>
                      <div className="flex items-center gap-2">
                        <div className="prog-bar flex-1"><div className="prog-fill" style={{ width:`${t.progress}%` }} /></div>
                        <span style={{ fontSize: 11, color:'#777' }}>{t.progress}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        {t.status !== 'Completed' && <button onClick={() => markDone(t.id)} className="btn btn-ghost btn-xs" title="Complete"><CheckCircle size={12} style={{ color:'#2E8B57' }} /></button>}
                        <button onClick={() => openEdit(t)} className="btn btn-ghost btn-xs"><Edit2 size={12} /></button>
                        <button onClick={() => setConfirmId(t.id)} className="btn btn-danger btn-xs"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop:'1px solid #F0F0F0' }}>
              <span style={{ fontSize:12, color:'#777' }}>Showing {(page-1)*PER+1}–{Math.min(page*PER,filtered.length)} of {filtered.length}</span>
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-xs" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Prev</button>
                <button className="btn btn-ghost btn-xs" disabled={page===pages} onClick={()=>setPage(p=>p+1)}>Next</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="kanban-scroll">
          {KANBAN_COLS.map(col => (
            <div key={col} className="kanban-col">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <p style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#555' }}>{col}</p>
                <span style={{ fontSize:11, color:'#AAA', background:'#E3E3E3', borderRadius:99, padding:'1px 7px' }}>{filtered.filter(t=>t.status===col).length}</span>
              </div>
              {filtered.filter(t => t.status === col).map(t => (
                <div key={t.id} className="card" style={{ padding:'12px 14px', marginBottom: 8 }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:6, marginBottom:6 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:priorityDot(t.priority), marginTop:5, flexShrink:0 }} />
                    <p style={{ fontWeight:600, fontSize:13 }}>{t.title}</p>
                  </div>
                  {t.client && <p style={{ fontSize:12, color:'#777', marginBottom:6 }}>{t.client}</p>}
                  <div className="prog-bar mb-2"><div className="prog-fill" style={{ width:`${t.progress}%` }} /></div>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize:11, color:'#777' }}>{t.assigned}</span>
                    <span style={{ fontSize:11, color: isOverdue(t)?'#D9534F':'#AAA' }}>{t.due}</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {t.status !== 'Completed' && <button onClick={()=>markDone(t.id)} className="btn btn-ghost btn-xs"><CheckCircle size={11} style={{color:'#2E8B57'}} /></button>}
                    <button onClick={()=>openEdit(t)} className="btn btn-ghost btn-xs"><Edit2 size={11} /></button>
                    <button onClick={()=>setConfirmId(t.id)} className="btn btn-danger btn-xs"><Trash2 size={11} /></button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit Task' : 'Add Task'} maxW="600px">
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Task Title *</label><input className="inp" value={form.title} onChange={f('title')} /></div>
          <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Description</label><textarea className="inp" rows={2} value={form.description} onChange={f('description')} style={{ resize:'vertical' }} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Client</label>
              <select className="inp" value={form.client} onChange={f('client')}>
                <option value="">None</option>
                {clients.map(c => <option key={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Project</label>
              <select className="inp" value={form.project} onChange={f('project')}>
                <option value="">None</option>
                {projects.map(p => <option key={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Assigned To</label><input className="inp" value={form.assigned} onChange={f('assigned')} /></div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Due Date</label><input className="inp" type="date" value={form.due} onChange={f('due')} /></div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Due Time</label><input className="inp" type="time" value={form.time} onChange={f('time')} /></div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Priority</label>
              <select className="inp" value={form.priority} onChange={f('priority')}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select>
            </div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Status</label>
              <select className="inp" value={form.status} onChange={f('status')}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
            </div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Progress (%)</label><input className="inp" type="number" min={0} max={100} value={form.progress} onChange={f('progress')} /></div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={save}>Save Task</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={() => remove(confirmId)} />
    </div>
  )
}
