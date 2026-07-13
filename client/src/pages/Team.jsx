import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { uid } from '../store/data'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

const ROLES = ['Admin','Manager','Sales Executive','Video Editor','Graphic Designer','Content Creator','Photographer','Developer','Freelancer','Viewer']
const DEPTS = ['Management','Sales','Design','Production','Development','Marketing','Operations']
const EMPTY = { name:'', email:'', phone:'', role:'Graphic Designer', dept:'Design', avatar:'' }

export default function Team() {
  const { team, setTeam, tasks, leads } = useApp()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true) }
  const openEdit = (m) => { setForm({...m}); setEditId(m.id); setModal(true) }

  const save = () => {
    if (!form.name) return toast.error('Name required')
    const avatar = form.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)
    if (editId) {
      setTeam(ts => ts.map(t => t.id===editId?{...form,avatar,id:editId}:t))
      toast.success('Updated')
    } else {
      setTeam(ts => [...ts, { ...form, avatar, id:uid(), createdAt:new Date().toISOString() }])
      toast.success('Team member added')
    }
    setModal(false)
  }

  const remove = (id) => { setTeam(ts=>ts.filter(t=>t.id!==id)); toast.success('Removed') }
  const f = (k) => (e) => setForm(p=>({...p,[k]:e.target.value}))

  const getStats = (name) => ({
    tasks: tasks.filter(t=>t.assigned===name).length,
    done: tasks.filter(t=>t.assigned===name&&t.status==='Completed').length,
    leads: leads.filter(l=>l.assigned===name).length,
  })

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="page-sub">{team.length} team members</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary btn-sm"><Plus size={14} /> Add Member</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:16 }}>
        {team.map(m => {
          const s = getStats(m.name)
          const perf = s.tasks > 0 ? Math.round((s.done/s.tasks)*100) : 0
          return (
            <div key={m.id} className="card" style={{ padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:'#1F1F1F', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, flexShrink:0 }}>
                  {m.avatar||m.name[0]}
                </div>
                <div>
                  <p style={{ fontWeight:700, fontSize:15 }}>{m.name}</p>
                  <p style={{ fontSize:12, color:'#777' }}>{m.role}</p>
                  <p style={{ fontSize:11, color:'#AAA' }}>{m.dept}</p>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                {[['Tasks', s.tasks],['Done', s.done],['Leads', s.leads]].map(([l,v])=>(
                  <div key={l} style={{ flex:1, textAlign:'center', background:'#F3F3F1', borderRadius:8, padding:'8px 6px' }}>
                    <p style={{ fontSize:16, fontWeight:700 }}>{v}</p>
                    <p style={{ fontSize:10, color:'#777' }}>{l}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:12, color:'#777' }}>Performance</span>
                  <span style={{ fontSize:12, fontWeight:700 }}>{perf}%</span>
                </div>
                <div className="prog-bar"><div className="prog-fill" style={{ width:`${perf}%` }} /></div>
              </div>
              <div style={{ display:'flex', gap:6, fontSize:12, color:'#777', marginBottom:12 }}>
                <span>{m.email}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>openEdit(m)} className="btn btn-ghost btn-sm flex-1"><Edit2 size={12} /> Edit</button>
                <button onClick={()=>setConfirmId(m.id)} className="btn btn-danger btn-sm"><Trash2 size={12} /></button>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={modal} onClose={()=>setModal(false)} title={editId?'Edit Member':'Add Team Member'}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Full Name *</label><input className="inp" value={form.name} onChange={f('name')} /></div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Email</label><input className="inp" type="email" value={form.email} onChange={f('email')} /></div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Phone</label><input className="inp" value={form.phone} onChange={f('phone')} /></div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Role</label>
              <select className="inp" value={form.role} onChange={f('role')}>{ROLES.map(r=><option key={r}>{r}</option>)}</select>
            </div>
            <div><label style={{ fontSize:12, color:'#777', display:'block', marginBottom:3 }}>Department</label>
              <select className="inp" value={form.dept} onChange={f('dept')}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select>
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
