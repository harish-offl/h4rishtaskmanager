import { useState } from 'react'
import { Upload, FileText, Trash2, Download } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { uid } from '../store/data'
import toast from 'react-hot-toast'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const DOC_TYPES = ['Proposal','Quotation','Invoice','Contract','Client Brief','Receipt','Project File','Brand Asset','Other']
const ICONS = { pdf:'📄', doc:'📝', docx:'📝', xlsx:'📊', png:'🖼️', jpg:'🖼️', mp4:'🎬', zip:'📦', default:'📎' }

export default function Documents() {
  const { clients, leads, projects } = useApp()
  const [docs, setDocs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('arrise_biz_docs')||'[]') } catch { return [] }
  })
  const [typeF, setTypeF] = useState('')
  const [confirmId, setConfirmId] = useState(null)

  const saveDocs = (d) => { setDocs(d); localStorage.setItem('arrise_biz_docs', JSON.stringify(d)) }

  const handleUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const doc = { id:uid(), name:file.name, type:'Other', size:file.size, category:'General', uploadDate:new Date().toISOString().slice(0,10), uploader:'Arjun S' }
      saveDocs(prev => [...prev, doc])
      toast.success(`${file.name} uploaded`)
    })
    e.target.value = ''
  }

  const filtered = docs.filter(d => !typeF || d.type === typeF)

  const ext = (name) => name.split('.').pop().toLowerCase()
  const icon = (name) => ICONS[ext(name)] || ICONS.default
  const size = (bytes) => bytes < 1024*1024 ? `${(bytes/1024).toFixed(1)} KB` : `${(bytes/(1024*1024)).toFixed(1)} MB`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-sub">{docs.length} files stored</p>
        </div>
        <label className="btn btn-primary btn-sm" style={{ cursor:'pointer' }}>
          <Upload size={14} /> Upload Files
          <input type="file" multiple style={{ display:'none' }} onChange={handleUpload} />
        </label>
      </div>

      {/* Upload Drop Zone */}
      <label className="card" style={{ padding:32, textAlign:'center', cursor:'pointer', border:'1.5px dashed #E3E3E3' }}>
        <Upload size={28} style={{ color:'#AAA', margin:'0 auto 10px' }} />
        <p style={{ fontSize:14, color:'#555', fontWeight:500 }}>Drag & drop files or click to upload</p>
        <p style={{ fontSize:12, color:'#AAA', marginTop:4 }}>Proposals, Invoices, Contracts, Receipts, Brand Assets</p>
        <input type="file" multiple style={{ display:'none' }} onChange={handleUpload} />
      </label>

      <div className="card" style={{ padding:'14px 16px' }}>
        <select className="inp" style={{ width:200 }} value={typeF} onChange={e=>setTypeF(e.target.value)}>
          <option value="">All Types</option>
          {DOC_TYPES.map(t=><option key={t}>{t}</option>)}
        </select>
      </div>

      {filtered.length===0 ? (
        <div className="card" style={{ padding:40, textAlign:'center' }}>
          <FileText size={36} style={{ color:'#AAA', margin:'0 auto 12px' }} />
          <p style={{ fontSize:14, color:'#777' }}>No documents uploaded yet</p>
          <p style={{ fontSize:12, color:'#AAA', marginTop:4 }}>Upload proposals, invoices, contracts, and more</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:12 }}>
          {filtered.map(doc=>(
            <div key={doc.id} className="card card-hover" style={{ padding:16 }}>
              <div style={{ fontSize:32, marginBottom:10 }}>{icon(doc.name)}</div>
              <p style={{ fontWeight:600, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:4 }}>{doc.name}</p>
              <p style={{ fontSize:11, color:'#AAA', marginBottom:8 }}>{size(doc.size)} · {doc.uploadDate}</p>
              <div style={{ display:'flex', gap:2 }}>
                <button className="btn btn-ghost btn-xs flex-1"><Download size={11} /> Save</button>
                <button onClick={()=>setConfirmId(doc.id)} className="btn btn-danger btn-xs"><Trash2 size={11} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={!!confirmId} onClose={()=>setConfirmId(null)} onConfirm={()=>{ saveDocs(docs.filter(d=>d.id!==confirmId)); toast.success('Deleted') }} />
    </div>
  )
}
