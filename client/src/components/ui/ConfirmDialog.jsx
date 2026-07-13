import Modal from './Modal'

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Confirm Delete', message = 'This action cannot be undone.' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxW="400px">
      <p style={{ fontSize: 14, color: '#555', marginBottom: 20 }}>{message}</p>
      <div className="flex gap-3 justify-end">
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-sm" style={{ background: '#D9534F', color: '#fff' }}
          onClick={() => { onConfirm(); onClose() }}>Delete</button>
      </div>
    </Modal>
  )
}
