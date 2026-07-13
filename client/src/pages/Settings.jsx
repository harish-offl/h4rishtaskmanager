import { useState } from 'react'
import { Save, Building2, User, Bell, Trash2, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import toast from 'react-hot-toast'

const EMPTY_BIZ = { name: '', address: '', phone: '', email: '', gst: '', logo: '', bank: '', upi: '' }
const INV_FORMATS = ['AD-INV-001', 'AD-2026-001', 'INV-JUL-001', 'Custom']

export default function Settings({ dark, onToggleDark }) {
  const { user, updateUser } = useAuth()
  const { resetAllData } = useApp()
  const [tab, setTab] = useState('business')
  const [biz, setBiz] = useState(() => {
    try {
      const saved = localStorage.getItem('arrise_biz_settings')
      return saved ? JSON.parse(saved) : EMPTY_BIZ
    } catch { return EMPTY_BIZ }
  })
  const [invFormat, setInvFormat] = useState(() => localStorage.getItem('arrise_inv_format') || 'AD-INV-001')
  const [profile, setProfile] = useState({ name: user?.name || '', email: '' })
  const [confirmReset, setConfirmReset] = useState(false)

  const saveBiz = () => {
    localStorage.setItem('arrise_biz_settings', JSON.stringify(biz))
    toast.success('Business details saved')
  }

  const saveProfile = () => {
    try { updateUser({ name: profile.name }); toast.success('Profile updated') }
    catch (e) { toast.error(e.message) }
  }

  const saveInvFormat = () => {
    localStorage.setItem('arrise_inv_format', invFormat)
    toast.success('Invoice format saved')
  }

  const handleReset = () => {
    resetAllData()
    setConfirmReset(false)
    toast.success('All data cleared. You can now enter your own data.')
  }

  const fb = (k) => (e) => setBiz(p => ({ ...p, [k]: e.target.value }))
  const fp = (k) => (e) => setProfile(p => ({ ...p, [k]: e.target.value }))

  const TABS = [
    ['business', 'Business'],
    ['invoice', 'Invoice'],
    ['profile', 'Profile'],
    ['notifications', 'Notifications'],
    ['appearance', 'Appearance'],
    ['data', 'Data'],
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-sub">Configure your business and preferences</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E3E3E3', overflowX: 'auto' }}>
        {TABS.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{
              padding: '9px 18px', fontSize: 13, fontWeight: tab === id ? 600 : 400,
              color: tab === id ? '#1F1F1F' : '#777',
              borderBottom: tab === id ? '2px solid #1F1F1F' : '2px solid transparent',
              background: 'none', border: 'none', cursor: 'pointer',
              marginBottom: -1, whiteSpace: 'nowrap'
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Business Details ── */}
      {tab === 'business' && (
        <div className="card" style={{ padding: 24, maxWidth: 580 }}>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={16} /> Business Details
          </p>
          <p style={{ fontSize: 12, color: '#777', marginBottom: 20 }}>
            These details auto-fill in every invoice you create.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['name', 'Business Name', 'e.g. Arrise Digital'],
                ['address', 'Business Address', 'Street, City, State, PIN'],
                ['phone', 'Phone Number', '+91 XXXXX XXXXX'],
                ['email', 'Email Address', 'hello@yourbusiness.com'],
                ['gst', 'GST Number', '27XXXXX1234Z1ZX'],
                ['upi', 'UPI ID', 'yourname@upi'],
              ].map(([k, l, ph]) => (
                <div key={k}>
                  <label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 3 }}>{l}</label>
                  <input className="inp" value={biz[k] || ''} onChange={fb(k)} placeholder={ph} />
                </div>
              ))}
              <div className="col-span-2">
                <label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 3 }}>Bank Details</label>
                <textarea className="inp" rows={2} value={biz.bank || ''} onChange={fb('bank')}
                  placeholder="Account Name, Account No, IFSC, Bank Name" style={{ resize: 'vertical' }} />
              </div>
            </div>
            <button onClick={saveBiz} className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }}>
              <Save size={13} /> Save Business Details
            </button>
          </div>
        </div>
      )}

      {/* ── Invoice ── */}
      {tab === 'invoice' && (
        <div className="card" style={{ padding: 24, maxWidth: 460 }}>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Invoice Settings</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 3 }}>Invoice Number Format</label>
              <select className="inp" value={invFormat} onChange={e => setInvFormat(e.target.value)}>
                {INV_FORMATS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div style={{ padding: '12px 14px', background: '#F3F3F1', borderRadius: 8 }}>
              <p style={{ fontSize: 11, color: '#777', marginBottom: 4 }}>Preview</p>
              <p style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>
                {invFormat === 'Custom' ? 'YOUR-FORMAT-001' : invFormat}
              </p>
            </div>
            <button onClick={saveInvFormat} className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }}>
              <Save size={13} /> Save Format
            </button>
          </div>
        </div>
      )}

      {/* ── Profile ── */}
      {tab === 'profile' && (
        <div className="card" style={{ padding: 24, maxWidth: 460 }}>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={16} /> Profile
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1F1F1F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800 }}>
              {profile.name?.[0]?.toUpperCase() || 'A'}
            </div>
            {[['name', 'Full Name', 'Your name'], ['email', 'Email', 'your@email.com']].map(([k, l, ph]) => (
              <div key={k}>
                <label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 3 }}>{l}</label>
                <input className="inp" value={profile[k] || ''} onChange={fp(k)} placeholder={ph} />
              </div>
            ))}
            <button onClick={saveProfile} className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }}>
              <Save size={13} /> Save Profile
            </button>
          </div>
        </div>
      )}

      {/* ── Notifications ── */}
      {tab === 'notifications' && (
        <div className="card" style={{ padding: 24, maxWidth: 460 }}>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={16} /> Notifications
          </p>
          {[
            'Follow-up due reminders', 'Missed follow-up alerts', 'Task deadline alerts',
            'Overdue task warnings', 'Project deadline reminders', 'Invoice due alerts',
            'Payment due reminders', 'Overdue invoice warnings', 'New lead assigned',
            'Payment received confirmations',
          ].map(n => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
              <span style={{ fontSize: 13 }}>{n}</span>
              <input type="checkbox" defaultChecked style={{ width: 16, height: 16, accentColor: '#1F1F1F', cursor: 'pointer' }} />
            </div>
          ))}
        </div>
      )}

      {/* ── Appearance ── */}
      {tab === 'appearance' && (
        <div className="card" style={{ padding: 24, maxWidth: 460 }}>
          <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Appearance</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #F0F0F0' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 14 }}>Dark Mode</p>
              <p style={{ fontSize: 12, color: '#777' }}>Toggle between light and dark theme</p>
            </div>
            <button onClick={onToggleDark} className="btn btn-primary btn-sm">
              {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
          <div style={{ padding: '14px 0' }}>
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Theme</p>
            <p style={{ fontSize: 12, color: '#777' }}>Premium Monochrome — Black, White & Grey with status colors</p>
          </div>
        </div>
      )}

      {/* ── Data Management ── */}
      {tab === 'data' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
          {/* What's stored */}
          <div className="card" style={{ padding: 24 }}>
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Your Data</p>
            <p style={{ fontSize: 13, color: '#777', marginBottom: 16 }}>
              All data is stored locally in your browser. Nothing is sent to any server.
              You can add, edit, and delete entries from each section using the forms.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Leads', 'Add from Leads page → Add Lead button'],
                ['Clients', 'Add from Clients page → Add Client button'],
                ['Projects', 'Add from Projects page → Add Project button'],
                ['Tasks', 'Add from Tasks page → Add Task button'],
                ['Invoices', 'Add from Invoices page → Create Invoice button'],
                ['Payments', 'Add from Payments page → Record Payment button'],
                ['Revenue', 'Add from Revenue page → Add Revenue button'],
                ['Expenses', 'Add from Expenses page → Add Expense button'],
                ['To-Dos', 'Add from Common To-Do page → Add To-Do button'],
                ['Team', 'Add from Team page → Add Member button'],
              ].map(([section, hint]) => (
                <div key={section} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid #F5F5F5' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, minWidth: 80 }}>{section}</span>
                  <span style={{ fontSize: 12, color: '#777' }}>{hint}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clear data */}
          <div className="card" style={{ padding: 24, border: '1px solid rgba(217,83,79,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
              <AlertTriangle size={20} style={{ color: '#D9534F', flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#D9534F' }}>Clear All Data</p>
                <p style={{ fontSize: 13, color: '#777', marginTop: 4 }}>
                  This will permanently delete all leads, clients, projects, tasks, invoices,
                  payments, revenue, expenses, to-dos, and team members.
                  This action <strong>cannot be undone</strong>.
                </p>
              </div>
            </div>

            {!confirmReset ? (
              <button onClick={() => setConfirmReset(true)} className="btn btn-danger btn-sm">
                <Trash2 size={13} /> Clear All Data
              </button>
            ) : (
              <div style={{ background: 'rgba(217,83,79,0.06)', borderRadius: 8, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#D9534F' }}>
                  Are you absolutely sure? This cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={handleReset}
                    style={{ background: '#D9534F', color: '#fff', padding: '8px 18px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    Yes, Delete Everything
                  </button>
                  <button onClick={() => setConfirmReset(false)} className="btn btn-ghost btn-sm">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
