export default function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <div style={{ opacity: 0.2, marginBottom: 14 }}><Icon size={40} /></div>}
      <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{title}</p>
      {desc && <p style={{ fontSize: 13, color: '#777', marginBottom: 16, maxWidth: 280 }}>{desc}</p>}
      {action}
    </div>
  )
}
