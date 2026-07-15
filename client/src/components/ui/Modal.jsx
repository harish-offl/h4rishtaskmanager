import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, maxW = '560px' }) {
  if (!open) return null
  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <motion.div className="modal-box" style={{ maxWidth: maxW }}
          initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.18 }}>
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border,#E3E3E3)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h3>
            <button onClick={onClose} className="btn-ghost btn btn-xs" style={{ padding: '5px' }}><X size={15} /></button>
          </div>
          <div className="p-5">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
