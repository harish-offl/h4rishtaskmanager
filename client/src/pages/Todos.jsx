import { useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, CheckCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { uid } from '../store/data'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

const PRIORITIES = ['Low','Medium','High','Urgent']
const REPEATS = ['No Repeat','Daily','Weekly','Monthly','Custom']
const STATUSES = ['To-Do','In Progress','Completed']
const EMPTY = { title:'', desc:'', assigned:'', due:'', time:'', priority:'Medium', status:'To-Do', repeat:'No Repeat', createdBy:'Arjun S' }

const COL_COLOR = { 'To-Do':'#777', 'In Progress':'#4D7CFE', 'Completed':'#2E8B57' }

export default function Todos() {
  const { todos, setTodos } = useApp()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true) }
  const openEdit = (t) => { setForm({ ...t }); setEditId(t.id); setModal(true) }

  const save = () => {
    if (!form.title.trim()) return toast.error('Title required')
    if (editId) {
      setTodos(ts => ts.map(t => t.id === editId ? { ...form, id: editId } : t))
      toast.success('Updated')
    } else {
      setTodos(ts => [{ ...form, id: uid(), createdAt: new Date().toISOString() }, ...ts])
      toast.success('Added')
    }
    setModal(false)
  }

  const move = (id, status) => setTodos(ts => ts.map(t => t.id === id ? { ...t, status } : t))
  const remove = (id) => { setTodos(ts => ts.filter(t => t.id !== id)); toast.success('Deleted') }
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const today = new Date().toISOString().slice(0,10)
  const isOverdue = (t) => t.status !== 'Completed' && t.due && t.due < today

  const priorityColor = (p) => ({ 'Urgent':'#D9534F','High':'#D89B2B','Medium':'#4D7CFE','Low':'#2E8B57' }[p]||'#777')

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Common To-Do</h1>
          <p className="page-sub">Team tasks not linked to a project</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary btn-sm"><Plus size={14} /> Add To-Do</button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {STATUSES.map(col => (
          <div key={col} className="stat-card" style={{ padding:'14px 16px' }}>
            <p style={{ fontSize:11, color:COL_COLOR[col], marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:700 }}>{col}</p>
            <p style={{ fontSize:24, fontWeight:700 }}>{todos.filter(t=>t.status===col).length}</p>
          </div>
        ))}
      </div>

      <div className="kanban-scroll">
        {STATUSES.map(col => (
          <div key={col} className="kanban-col" style={{ minWidth: 260, flex:'1 1 260px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:COL_COLOR[col] }} />
              <p style={{ fontSize:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#555' }}>{col}</p>
              <span style={{ fontSize:11, color:'#AAA', background:'#E3E3E3', borderRadius:99, padding:'1px 7px', marginLeft:'auto' }}>{todos.filter(t=>t.status===col).length}</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {todos.filter(t=>t.status===col).map(t => (
                <div key={t.id} className="card" style={{ padding:'12px 14px' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:6 }}>
                    <span style={{ width:6, height:6, borderRadius:'50%', background:priorityColor(t.priority), marginTop:5, flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:600, fontSize:13 }}>{t.title}</p>
                      {t.desc && <p style={{ fontSize:11, color:'#777', marginTop:2 }}>{t.desc}</p>}
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:11, color:'#777' }}>{t.assigned}</span>
                    <span style={{ fontSize:11, color:isOverdue(t)?'#D9534F':'#AAA' }}>{t.due||''}</span>
                  </div>
                  {t.repeat !== 'No Repeat' && <span style={{ fontSize:10, background:'#F0F0F0', color:'#777', padding:'2px 7px', borderRadius:99, marginBottom:8, display:'inline-block' }}>🔁 {t.repeat}</span>}
                  <div className="flex gap-1">
                    {col !== 'To-Do' && <button onClick={()=>move(t.id,'To-Do')} className="btn btn-ghost btn-xs" style={{ fontSize:10 }}>↩</button>}
                    {col !== 'In Progress' && col !== 'Completed' && <button onClick={()=>move(t.id,'In Progress')} className="btn btn-ghost btn-xs" style={{ fontSize:10 }}>▶</button>}
                    {col !== 'Completed' && <button onClick={()=>move(t.id,'Completed')} className="btn btn-ghost btn-xs"><CheckCircle size={11} style={{color:'#2E8B57'}} /></button>}
                    <button onClick={()=>openEdit(t)} className="btn btn-ghost btn-xs"><Edit2 size={11} /></button>
                    <button onClick={()=>setConfirmId(t.id)} className="btn btn-danger btn-xs"><Trash2 size={11} /></button>
                  </div>
                </div>
              ))}
              <button onClick={openAdd} style={{ border:'1.5px dashed #E3E3E3', borderRadius:8, padding:'10px', fontSize:13, color:'#AAA', background:'transparent', cursor:'pointer', width:'100%' }}>+ Add item</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editId ? 'Edit To-Do' : 'Add To-Do'}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Title *</label><input className="inp" value={form.title} onChange={f('title')} /></div>
          <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Description</label><textarea className="inp" rows={2} value={form.desc} onChange={f('desc')} style={{ resize:'vertical' }} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Assigned To</label><input className="inp" value={form.assigned} onChange={f('assigned')} /></div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Due Date</label><input className="inp" type="date" value={form.due} onChange={f('due')} /></div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Due Time</label><input className="inp" type="time" value={form.time} onChange={f('time')} /></div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Priority</label>
              <select className="inp" value={form.priority} onChange={f('priority')}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select>
            </div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Status</label>
              <select className="inp" value={form.status} onChange={f('status')}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
            </div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Repeat</label>
              <select className="inp" value={form.repeat} onChange={f('repeat')}>{REPEATS.map(r=><option key={r}>{r}</option>)}</select>
            </div>
          </div>
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
