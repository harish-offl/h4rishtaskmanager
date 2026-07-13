import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Edit3, Star, Check, X } from 'lucide-react'
import { Notes as NotesDB } from '../api/db'

const COLOR_MAP = {
  orange:'#f97316', yellow:'#eab308', purple:'#8b5cf6', cyan:'#06b6d4',
  green:'#22c55e', pink:'#ec4899', red:'#ef4444', blue:'#3b82f6'
}

function NoteCard({ note, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(!note.title && !note.content)
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const color = COLOR_MAP[note.color] || COLOR_MAP.cyan

  const save = () => { onUpdate(note._id, { title, content }); setEditing(false) }
  const toggleStar = () => onUpdate(note._id, { isStarred: !note.isStarred })

  return (
    <motion.div layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      whileHover={{ y: -2 }}
      className={`note-${note.color} card rounded-xl flex flex-col min-h-[160px] overflow-hidden`}
      style={{ border: `1px solid ${color}25` }}>

      {/* Action bar — top, separated, never overlaps */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 flex-shrink-0"
        style={{ borderBottom: `1px solid ${color}15` }}>
        <div>
          {note.isStarred && <span className="text-xs" style={{ color }}>★</span>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleStar} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <Star size={12} fill={note.isStarred ? color : 'none'} style={{ color }} />
          </button>
          <button onClick={() => { setTitle(note.title); setContent(note.content); setEditing(true) }}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <Edit3 size={12} style={{ color }} />
          </button>
          <button onClick={() => onDelete(note._id)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <Trash2 size={12} style={{ color: '#ef4444' }} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-3 flex flex-col gap-2">
        {editing ? (
          <>
            <input className="bg-transparent border-b text-sm font-medium outline-none pb-1 w-full"
              style={{ borderColor: `${color}30`, color: '#e8e8e8' }}
              placeholder="Title..." value={title} onChange={e => setTitle(e.target.value)} autoFocus />
            <textarea className="bg-transparent text-sm outline-none resize-none flex-1 leading-relaxed w-full"
              style={{ color: 'rgba(232,232,232,0.7)' }}
              placeholder="Write your note..." value={content}
              onChange={e => setContent(e.target.value)} rows={4} />
            <div className="flex items-center gap-2 pt-1">
              <button onClick={save} className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium"
                style={{ background: color, color: '#111' }}>
                <Check size={11} /> Save
              </button>
              <button onClick={() => setEditing(false)} className="text-xs" style={{ color: 'rgba(232,232,232,0.35)' }}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            {title && <h3 className="text-sm font-medium" style={{ color: '#e8e8e8' }}>{title}</h3>}
            <p className="text-sm leading-relaxed flex-1 whitespace-pre-wrap"
              style={{ color: 'rgba(232,232,232,0.6)' }}>
              {content || <span style={{ opacity: 0.3, fontStyle: 'italic', fontSize: 12 }}>Empty note...</span>}
            </p>
            <p className="text-xs mt-auto" style={{ color: `${color}60` }}>
              {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </>
        )}
      </div>
    </motion.div>
  )
}

export default function Notes({ pendingColor, onColorConsumed }) {
  const [notes, setNotes] = useState([])

  useEffect(() => { setNotes(NotesDB.getAll()) }, [])

  useEffect(() => {
    if (!pendingColor) return
    NotesDB.add(pendingColor)
    setNotes(NotesDB.getAll())
    onColorConsumed()
  }, [pendingColor, onColorConsumed])

  const updateNote = (id, updates) => { NotesDB.update(id, updates); setNotes(NotesDB.getAll()) }
  const deleteNote = (id) => { NotesDB.delete(id); setNotes(prev => prev.filter(n => n._id !== id)) }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Notes</h1>
        <p className="text-sm" style={{ color: '#666' }}>{notes.length} notes · Use + in sidebar</p>
      </div>

      {notes.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="card py-16 text-center text-sm" style={{ color: '#555' }}>
          <p className="text-3xl mb-3">📝</p>
          No notes yet. Click the + button in the sidebar to create one!
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {notes.map(note => (
              <NoteCard key={note._id} note={note} onUpdate={updateNote} onDelete={deleteNote} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
