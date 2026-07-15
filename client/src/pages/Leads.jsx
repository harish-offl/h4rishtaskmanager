import { useState, useMemo, useRef } from 'react'
import { Plus, Search, Filter, Download, Upload, Eye, Edit2, Trash2, UserPlus, MoreHorizontal } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { uid, formatINR } from '../store/data'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import * as XLSX from 'xlsx'

const STATUSES = ['New','Not Contacted','Contacted','Follow-Up Required','Interested','Meeting Scheduled','Proposal Sent','Negotiation','Converted','Not Interested','Lost','On Hold']
const PRIORITIES = ['Low','Medium','High','Urgent']
const SOURCES = ['Instagram','Facebook','Google','LinkedIn','Referral','Walk-in','WhatsApp','Cold Call','Website','Other']
const SERVICES = ['Social Media Marketing','Video Editing','Graphic Design','Website Development','UI/UX Design','Photography','Videography','Content Creation','Meta Ads','Branding','Email Automation','AI Automation','Event Management','Other']

const EMPTY = { name:'', company:'', phone:'', whatsapp:'', email:'', industry:'', category:'', location:'', source:'Instagram', service:'Social Media Marketing', value:'', assigned:'', priority:'Medium', status:'New', firstContact:'', lastContact:'', nextFollowup:'', expectedClose:'', notes:'', whatsappSent:false, whatsappSentAt:null, messageCount:0, lastWhatsappMessage:'' }

const INPUT_HEADER_MAP = {
  title: 'title',
  companyname: 'title',
  company: 'title',
  totalscore: 'totalScore',
  rating: 'totalScore',
  reviewscount: 'reviewsCount',
  reviews: 'reviewsCount',
  street: 'street',
  streetaddress: 'street',
  street_address: 'street',
  city: 'city',
  state: 'state',
  countrycode: 'countryCode',
  country_code: 'countryCode',
  country: 'countryCode',
  website: 'website',
  url: 'website',
  phone: 'phone',
  whatsapp: 'phone',
  'categories/0': 'categories/0',
  category: 'categories/0',
  categories: 'categories/0'
}

const REQUIRED_HEADERS = ['title', 'phone']

const CATEGORY_NORMALIZER = {
  'cafe': 'Café',
  'coffee shop': 'Café',
  'restaurant': 'Restaurant',
  'family restaurant': 'Restaurant',
  'bakery': 'Bakery',
  'juice shop': 'Juice Shop',
  'ice cream shop': 'Juice Shop',
  'fast food restaurant': 'Fast Food',
  'pizza restaurant': 'Pizza Restaurant',
  'chicken restaurant': 'Restaurant',
  'vegetarian restaurant': 'Restaurant'
}

const DEFAULT_IMPORT_VALUES = {
  service: '',
  source: '',
  assignedTo: '',
  priority: 'Medium',
  status: 'New',
  estimatedValue: '',
  countryCode: '+91'
}

function normalizeCountryCode(code) {
  if (!code) return '91'
  const raw = String(code).trim()
  const lower = raw.toLowerCase()
  if (lower === 'in' || lower === 'india') return '91'
  if (lower === 'us' || lower === 'usa' || lower === 'united states') return '1'
  const digits = raw.replace(/\D/g, '')
  if (digits === '91') return '91'
  if (digits === '1') return '1'
  return digits || '91'
}

function normalizePhone(rawPhone, countryCode) {
  const digits = String(rawPhone || '').replace(/\D/g, '')
  if (!digits) return ''
  const cc = normalizeCountryCode(countryCode)
  if (digits.startsWith(cc)) return digits
  if (digits.length === 10) return cc + digits
  return digits
}

function normalizeCategory(category) {
  if (!category) return ''
  const normalized = category.toString().trim().toLowerCase()
  return CATEGORY_NORMALIZER[normalized] || category.toString().trim()
}

function detectHeaders(headers) {
  const mapping = {}
  headers.forEach(header => {
    const normalizedHeader = String(header).trim().toLowerCase()
    if (INPUT_HEADER_MAP[normalizedHeader]) mapping[header] = INPUT_HEADER_MAP[normalizedHeader]
  })
  return mapping
}

function normalizeInputRow(raw) {
  const row = {}
  Object.entries(raw).forEach(([key, value]) => {
    const normalizedKey = INPUT_HEADER_MAP[String(key).trim().toLowerCase()] || key
    row[normalizedKey] = value
  })
  return row
}

function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
        resolve(rows)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

function buildImportLead(raw, defaults, rowIndex) {
  const title = String(raw.title || '').trim()
  const phone = String(raw.phone || '').trim()
  const countryCode = normalizeCountryCode(raw.countryCode || defaults.countryCode)
  const normalizedPhone = normalizePhone(phone, countryCode)
  const businessType = normalizeCategory(raw['categories/0'] || raw.category || '')
  const rating = raw.totalScore !== undefined && raw.totalScore !== '' ? Number(raw.totalScore) : ''
  const reviewsCount = raw.reviewsCount !== undefined && raw.reviewsCount !== '' ? Number(raw.reviewsCount) : ''
  const streetAddress = String(raw.street || '').trim()
  const city = String(raw.city || '').trim()
  const state = String(raw.state || '').trim()
  const location = [streetAddress, city, state].filter(Boolean).join(', ')
  const errors = []
  const warnings = []

  if (!title) errors.push('Missing title')
  if (!phone) errors.push('Missing phone')
  if (rating !== '' && (Number.isNaN(rating) || rating < 0 || rating > 5)) warnings.push('Rating should be 0–5')
  if (reviewsCount !== '' && (!Number.isInteger(reviewsCount) || reviewsCount < 0)) warnings.push('Reviews count must be a non-negative integer')

  return {
    id: `row-${rowIndex}`,
    rowIndex,
    title,
    companyName: title,
    leadName: '',
    phone,
    originalPhone: phone,
    normalizedPhone,
    whatsappNumber: normalizedPhone,
    originalCountryCode: String(raw.countryCode || defaults.countryCode || ''),
    countryCode,
    website: String(raw.website || '').trim(),
    businessType,
    originalCategory: String(raw['categories/0'] || raw.category || '').trim(),
    rating: rating === '' ? '' : rating,
    reviewsCount: reviewsCount === '' ? '' : reviewsCount,
    streetAddress,
    city,
    state,
    service: raw.service ? String(raw.service).trim() : defaults.service,
    source: raw.source ? String(raw.source).trim() : defaults.source,
    assignedTo: raw.assignedTo ? String(raw.assignedTo).trim() : defaults.assignedTo,
    followUpDate: defaults.followUpDate || '',
    priority: defaults.priority,
    status: defaults.status,
    estimatedValue: raw.estimatedValue !== undefined && raw.estimatedValue !== '' ? Number(raw.estimatedValue) : '',
    tags: '',
    messageTemplate: '',
    location,
    importStatus: errors.length ? 'Invalid' : 'Valid',
    errors,
    warnings,
    raw
  }
}

export default function Leads() {
  const { leads, setLeads } = useApp()
  const [q, setQ] = useState('')
  const [statusF, setStatusF] = useState('')
  const [priorityF, setPriorityF] = useState('')
  const [whatsappF, setWhatsappF] = useState('')
  const [sentFeedback, setSentFeedback] = useState({})
  const [view, setView] = useState('table') // table | kanban
  const [modal, setModal] = useState(null) // null | 'add' | 'edit' | 'view'
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const [page, setPage] = useState(1)
  const [importModal, setImportModal] = useState(false)
  const [importFileName, setImportFileName] = useState('')
  const [importRows, setImportRows] = useState([])
  const [importHeaders, setImportHeaders] = useState({})
  const [importError, setImportError] = useState('')
  const [importCounts, setImportCounts] = useState({ valid: 0, invalid: 0 })
  const importInputRef = useRef(null)
  const PER = 10

  const openImportPicker = () => importInputRef.current?.click()

  const resetImportState = () => {
    setImportModal(false)
    setImportFileName('')
    setImportRows([])
    setImportHeaders({})
    setImportError('')
    setImportCounts({ valid: 0, invalid: 0 })
  }

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setImportFileName(file.name)
    setImportError('')
    setImportRows([])
    setImportHeaders({})
    setImportCounts({ valid: 0, invalid: 0 })

    try {
      const rows = await parseExcelFile(file)
      if (!rows.length) {
        setImportError('The selected file contains no rows.')
        setImportModal(true)
        return
      }

      const headers = Object.keys(rows[0] || {})
      const mapping = detectHeaders(headers)
      const mappedKeys = Object.values(mapping)
      const missingRequired = REQUIRED_HEADERS.filter(req => !mappedKeys.includes(req))

      const normalizedRows = rows.map((raw, index) => buildImportLead(normalizeInputRow(raw), DEFAULT_IMPORT_VALUES, index + 1))
      const validCount = normalizedRows.filter(r => r.importStatus === 'Valid').length
      const invalidCount = normalizedRows.length - validCount

      setImportHeaders(mapping)
      setImportRows(normalizedRows)
      setImportCounts({ valid: validCount, invalid: invalidCount })
      setImportModal(true)

      if (missingRequired.length) {
        setImportError(`Missing required headers: ${missingRequired.join(', ')}`)
      }
    } catch (error) {
      setImportError('Unable to parse the selected file. Please choose a valid XLSX, XLS, or CSV file with headers.')
      setImportModal(true)
    }
  }

  const importLeads = () => {
    const validRows = importRows.filter(r => r.importStatus === 'Valid')
    if (!validRows.length) {
      toast.error('No valid rows available to import.')
      return
    }

    setLeads(ls => [
      ...validRows.map(row => ({
        id: uid(),
        name: row.title || row.companyName || `Lead ${row.rowIndex}`,
        company: row.companyName,
        phone: row.normalizedPhone,
        whatsapp: row.whatsappNumber,
        email: '',
        industry: '',
        category: row.businessType,
        location: row.location,
        source: row.source || '',
        service: row.service || '',
        value: row.estimatedValue !== '' && row.estimatedValue !== null && row.estimatedValue !== undefined ? row.estimatedValue : '',
        assigned: row.assignedTo || '',
        priority: row.priority,
        status: row.status,
        nextFollowup: row.followUpDate,
        expectedClose: '',
        notes: `Imported from ${importFileName}`,
        whatsappSent: false,
        whatsappSentAt: null,
        messageCount: 0,
        lastWhatsappMessage: '',
        createdAt: new Date().toISOString()
      })),
      ...ls
    ])

    toast.success(`${validRows.length} leads imported successfully.`)
    resetImportState()
  }

  const filtered = useMemo(() => leads.filter(l => {
    const mq = !q || [l.name, l.company, l.phone, l.email, l.service].join(' ').toLowerCase().includes(q.toLowerCase())
    const ms = !statusF || l.status === statusF
    const mw = !whatsappF || (whatsappF === 'Not Messaged' ? !l.whatsappSent : whatsappF === 'Messaged' ? !!l.whatsappSent : true)
    const mp = !priorityF || l.priority === priorityF
    return mq && ms && mw && mp
  }), [leads, q, statusF, whatsappF, priorityF])

  const pages = Math.ceil(filtered.length / PER)
  const pageData = filtered.slice((page-1)*PER, page*PER)

  const openAdd = () => { setForm(EMPTY); setEditId(null); setModal('add') }
  const openEdit = (l) => { setForm({ ...l }); setEditId(l.id); setModal('edit') }
  const openView = (l) => { setForm({ ...l }); setModal('view') }

  const save = () => {
    if (!form.name.trim()) return toast.error('Lead name required')
    if (editId) {
      setLeads(ls => ls.map(l => l.id === editId ? { ...form, id: editId, updatedAt: new Date().toISOString() } : l))
      toast.success('Lead updated')
    } else {
      setLeads(ls => [{ ...form, id: uid(), createdAt: new Date().toISOString() }, ...ls])
      toast.success('Lead added')
    }
    setModal(null)
  }

  const remove = (id) => {
    setLeads(ls => ls.filter(l => l.id !== id))
    toast.success('Lead deleted')
  }

  const convertToClient = (l) => {
    toast.success(`${l.name} marked as Converted`)
    setLeads(ls => ls.map(x => x.id === l.id ? { ...x, status: 'Converted' } : x))
  }

  const openWhatsapp = (l) => {
    const rawPhone = l.whatsapp || l.phone || ''
    let digits = String(rawPhone).replace(/\D/g, '')
    if (!digits) return toast.error('No phone number available for WhatsApp')
    if (digits.length === 10) digits = `91${digits}`
    const businessName = l.company || l.name || 'there'
    const message = `Hi! 👋\n\nGreetings from Arrise Digital Marketing Agency.\n\nWe're a creative digital marketing agency that helps restaurants, cafés, and businesses build a strong online presence through high-quality content, branding, and performance-driven marketing. Our goal is to help brands attract more customers, increase visibility, and grow consistently across digital platforms.\n\n🚀 Our Services\n\n• 📱 Social Media Management\n• 🎥 Professional Reel Creation\n• 🎨 Poster & Carousel Design\n• 🌐 Website Development\n• 📋 Premium Menu Design\n• 🏷️ Branding & Visual Identity\n• 📢 Promotional Campaigns & Event Marketing\n• 📸 Product Photography & Videography\n\n📦 Monthly Digital Marketing Packages\n\n💡 Starter Plan – ₹3,900\n• 6 Reels\n• 4 Posters\n• 2 Carousels\n• 3 Posts per Week\n\n💡 Growth Plan – ₹5,800\n• 8 Reels\n• 8 Posters\n• 4 Carousels\n• 5 Posts per Week\n\n💡 Elite Plan – ₹9,800\n• 16 Reels\n• 8 Posters\n• 4 Carousels\n• Daily Posting\n\nWe also offer customized packages by combining Digital Marketing, Website Development, and Menu Design to provide your business with a complete online branding solution.\n\n📂 Our Portfolio\n\n🔹 Bon Appetit – Restaurant (Narayana Puram, Madurai)\nhttps://drive.google.com/drive/folders/1gv5bX4WbD-0f99xI4cRgcI0J72tGAESf?usp=drive_link\n\n🔹 Le Brew Café (Opp. High Court, Uthangudi, Madurai)\nhttps://drive.google.com/drive/folders/11wX-_OUEu2ZLKjfQCZzGjT4wZu3v3OJr?usp=drive_link\n\n🔹 PST Construction – Ranipet\nhttps://drive.google.com/drive/folders/1qclR_-ir9-imG8B4pg7r_PjFIiqdOtOY\n\n(This project has recently started, and new creatives will be updated regularly.)\n\n🔹 Other Brand Portfolio\nIncludes:\n• Tikka2Tacco (Food)\n• Urs Choice Madurai (Real Estate)\n• Fun Spot Madurai (Kids Entertainment)\n• Vaigai Namma Taxi\n• Break Time Restaurant\n\nhttps://drive.google.com/drive/folders/1L3Z_T76bST6Ss-lqQjmD5gWRbeRuz_ki?usp=drive_link\n\nhttps://drive.google.com/drive/folders/1WvQaUk6UPOWPuqs_KBV1LATtggz3tkq6?usp=drive_link\n\nWe apologize for sharing multiple links. We're currently organizing all of our work into a single, streamlined portfolio, which will be available soon.\n\nPlease take your time to review our work. We'd be happy to discuss your requirements and recommend the best strategy to help grow your business.\n\nThank you for your time, and we look forward to working with you! 🚀\n\nArrise Digital Marketing Agency\n\nYou focus on your business.\nWe handle the growth.\n`
    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/${digits}?text=${encoded}`, '_blank')
    setLeads(ls => ls.map(x => x.id === l.id ? {
      ...x,
      whatsappSent: true,
      whatsappSentAt: new Date().toISOString(),
      messageCount: Number(x.messageCount || 0) + 1,
      lastWhatsappMessage: message,
    } : x))
    setSentFeedback(prev => ({ ...prev, [l.id]: 'sent' }))
    setTimeout(() => setSentFeedback(prev => ({ ...prev, [l.id]: undefined })), 1000)
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Leads Management</h1>
          <p className="page-sub">{leads.length} total leads · {leads.filter(l=>l.status==='Converted').length} converted</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setView(v => v === 'table' ? 'kanban' : 'table')} className="btn btn-ghost btn-sm">
            {view === 'table' ? 'Kanban View' : 'Table View'}
          </button>
          <button onClick={openImportPicker} className="btn btn-secondary btn-sm"><Upload size={14} /> Import Excel</button>
          <button onClick={openAdd} className="btn btn-primary btn-sm"><Plus size={14} /> Add Lead</button>
        </div>
      </div>
      <input ref={importInputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleImportFile} />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['Total', leads.length,'#1F1F1F'],['Follow-Up', leads.filter(l=>l.status==='Follow-Up Required').length,'#D89B2B'],['Converted', leads.filter(l=>l.status==='Converted').length,'#2E8B57'],['Lost', leads.filter(l=>l.status==='Lost').length,'#D9534F']].map(([l,v,c]) => (
          <div key={l} className="stat-card" style={{ padding: '14px 16px' }}>
            <p style={{ fontSize: 11, color: '#777', marginBottom: 4 }}>{l}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: c }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1" style={{ minWidth: 180 }}>
            <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#AAA' }} />
            <input className="inp" style={{ paddingLeft: 30, fontSize: 13 }} placeholder="Search leads..." value={q} onChange={e => { setQ(e.target.value); setPage(1) }} />
          </div>
          <select className="inp" style={{ width: 160 }} value={statusF} onChange={e => { setStatusF(e.target.value); setPage(1) }}>
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="inp" style={{ width: 160 }} value={whatsappF} onChange={e => { setWhatsappF(e.target.value); setPage(1) }}>
            <option value="">WhatsApp Status</option>
            <option value="Not Messaged">Not Messaged</option>
            <option value="Messaged">Messaged</option>
          </select>
          <select className="inp" style={{ width: 140 }} value={priorityF} onChange={e => { setPriorityF(e.target.value); setPage(1) }}>
            <option value="">All Priority</option>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {view === 'table' ? (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-scroll">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Lead</th><th>Company</th><th>Phone</th><th>WhatsApp</th>
                  <th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageData.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#AAA' }}>No leads found</td></tr>
                )}
                {pageData.map(l => (
                  <tr key={l.id}>
                    <td><span style={{ fontWeight: 600 }}>{l.name}</span></td>
                    <td style={{ color: '#777', fontSize: 13 }}>{l.company}</td>
                    <td style={{ fontSize: 13 }}>{l.phone}</td>
                    <td style={{ minWidth: 120 }}>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ y: -1 }}
                        onClick={() => openWhatsapp(l)}
                        className={`btn btn-whatsapp btn-xs${l.whatsappSent ? ' sent' : ''}`}
                        title={l.whatsappSent ? 'Message already sent' : 'Click to message on WhatsApp'}
                        style={{ whiteSpace: 'nowrap', minWidth: 100, height: 32, padding: '0 12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        {sentFeedback[l.id] === 'sent' ? '✓ Sent' : 'WhatsApp'}
                      </motion.button>
                    </td>
                    <td><StatusBadge label={l.status} /></td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => openView(l)} className="btn btn-ghost btn-xs" title="View"><Eye size={12} /></button>
                        <button onClick={() => openEdit(l)} className="btn btn-ghost btn-xs" title="Edit"><Edit2 size={12} /></button>
                        <button onClick={() => convertToClient(l)} className="btn btn-ghost btn-xs" title="Convert"><UserPlus size={12} /></button>
                        <button onClick={() => setConfirmId(l.id)} className="btn btn-danger btn-xs" title="Delete"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid #F0F0F0' }}>
              <span style={{ fontSize: 12, color: '#777' }}>Showing {(page-1)*PER+1}–{Math.min(page*PER, filtered.length)} of {filtered.length}</span>
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-xs" disabled={page===1} onClick={() => setPage(p=>p-1)}>Prev</button>
                <button className="btn btn-ghost btn-xs" disabled={page===pages} onClick={() => setPage(p=>p+1)}>Next</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <KanbanView leads={filtered} onEdit={openEdit} onDelete={id => setConfirmId(id)} onConvert={convertToClient} setLeads={setLeads} />
      )}

      {/* Add/Edit Modal */}
      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)}
        title={modal === 'edit' ? 'Edit Lead' : 'Add New Lead'} maxW="640px">
        <LeadForm form={form} f={f} onSave={save} onCancel={() => setModal(null)} />
      </Modal>

      {/* View Modal */}
      <Modal open={modal === 'view'} onClose={() => setModal(null)} title="Lead Details" maxW="580px">
        <LeadView lead={form} onEdit={() => { setEditId(form.id); setModal('edit') }} />
      </Modal>

      <Modal open={importModal} onClose={resetImportState} title="Import Leads from Excel" maxW="760px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {importFileName && <p style={{ fontSize: 13, color: '#555' }}>File: <strong>{importFileName}</strong></p>}
          {importError && <div style={{ color: '#D9534F', background: '#F8D7DA', padding: 12, borderRadius: 8 }}>{importError}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div className="card" style={{ padding: 12 }}>
              <p style={{ fontSize: 12, color: '#777', marginBottom: 8 }}>Detected Headers</p>
              {Object.keys(importHeaders).length ? (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {Object.entries(importHeaders).map(([raw, mapped]) => (
                    <li key={raw}><strong>{raw}</strong> → {mapped}</li>
                  ))}
                </ul>
              ) : <p style={{ fontSize: 12, color: '#AAA' }}>No exact import headers detected.</p>}
            </div>
            <div className="card" style={{ padding: 12 }}>
              <p style={{ fontSize: 12, color: '#777', marginBottom: 8 }}>Import Summary</p>
              <p style={{ fontSize: 13, marginBottom: 6 }}>Rows: <strong>{importRows.length}</strong></p>
              <p style={{ fontSize: 13, marginBottom: 6 }}>Valid: <strong>{importCounts.valid}</strong></p>
              <p style={{ fontSize: 13, marginBottom: 6 }}>Invalid: <strong>{importCounts.invalid}</strong></p>
            </div>
          </div>
          <div style={{ maxHeight: 320, overflow: 'auto' }}>
            <table className="tbl" style={{ minWidth: 520 }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Company</th>
                  <th>Phone</th>
                  <th>Country</th>
                  <th>Website</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Errors</th>
                </tr>
              </thead>
              <tbody>
                {importRows.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 30, color: '#AAA' }}>No import rows to preview.</td></tr>
                )}
                {importRows.slice(0, 20).map(row => (
                  <tr key={row.id} style={{ opacity: row.importStatus === 'Invalid' ? 0.7 : 1 }}>
                    <td>{row.rowIndex}</td>
                    <td>{row.companyName || '—'}</td>
                    <td>{row.normalizedPhone || '—'}</td>
                    <td>{row.countryCode || '—'}</td>
                    <td>{row.website || '—'}</td>
                    <td>{row.businessType || '—'}</td>
                    <td>{row.importStatus}</td>
                    <td style={{ fontSize: 11, color: '#D9534F' }}>{row.errors.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button className="btn btn-ghost btn-sm" onClick={resetImportState}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={importLeads} disabled={!importRows.length || importCounts.valid === 0}>Import Valid Leads</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirmId} onClose={() => setConfirmId(null)} onConfirm={() => remove(confirmId)} message="Delete this lead? This cannot be undone." />
    </div>
  )
}

function LeadForm({ form, f, onSave, onCancel }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="grid grid-cols-2 gap-3">
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Lead Name *</label><input className="inp" value={form.name} onChange={f('name')} placeholder="Contact name" /></div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Company</label><input className="inp" value={form.company} onChange={f('company')} placeholder="Business name" /></div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Phone</label><input className="inp" value={form.phone} onChange={f('phone')} /></div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Email</label><input className="inp" type="email" value={form.email} onChange={f('email')} /></div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Service</label>
          <select className="inp" value={form.service} onChange={f('service')}>{SERVICES.map(s=><option key={s}>{s}</option>)}</select>
        </div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Lead Source</label>
          <select className="inp" value={form.source} onChange={f('source')}>{SOURCES.map(s=><option key={s}>{s}</option>)}</select>
        </div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Estimated Value (₹)</label><input className="inp" type="number" value={form.value} onChange={f('value')} /></div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Assigned To</label><input className="inp" value={form.assigned} onChange={f('assigned')} /></div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Priority</label>
          <select className="inp" value={form.priority} onChange={f('priority')}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select>
        </div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Status</label>
          <select className="inp" value={form.status} onChange={f('status')}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
        </div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Next Follow-Up</label><input className="inp" type="date" value={form.nextFollowup} onChange={f('nextFollowup')} /></div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Expected Close</label><input className="inp" type="date" value={form.expectedClose} onChange={f('expectedClose')} /></div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Location</label><input className="inp" value={form.location} onChange={f('location')} /></div>
        <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Industry</label><input className="inp" value={form.industry} onChange={f('industry')} /></div>
      </div>
      <div><label style={{ fontSize: 12, color: '#777', display: 'block', marginBottom: 4 }}>Notes</label><textarea className="inp" rows={3} value={form.notes} onChange={f('notes')} style={{ resize: 'vertical' }} /></div>
      <div className="flex gap-3 justify-end pt-2">
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={onSave}>Save Lead</button>
      </div>
    </div>
  )
}

function LeadView({ lead, onEdit }) {
  const rows = [['Company', lead.company], ['Phone', lead.phone], ['Email', lead.email], ['Service', lead.service], ['Source', lead.source], ['Value', lead.value !== '' && lead.value !== null && lead.value !== undefined ? formatINR(lead.value) : '—'], ['Assigned', lead.assigned], ['Follow-Up', lead.nextFollowup || '—'], ['Location', lead.location || '—'], ['Notes', lead.notes || '—']]
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1F1F1F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>{lead.name?.[0]?.toUpperCase()}</div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 16 }}>{lead.name}</p>
          <div className="flex gap-2 mt-1"><StatusBadge label={lead.status} /><StatusBadge label={lead.priority} /></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {rows.map(([k,v]) => (
          <div key={k}><p style={{ fontSize: 11, color: '#777', marginBottom: 2 }}>{k}</p><p style={{ fontSize: 13, fontWeight: 500 }}>{v}</p></div>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <button className="btn btn-primary btn-sm" onClick={onEdit}><Edit2 size={13} /> Edit Lead</button>
      </div>
    </div>
  )
}

const KANBAN_COLS = ['New','Contacted','Interested','Proposal Sent','Negotiation','Converted','Lost']

function KanbanView({ leads, onEdit, onDelete, onConvert, setLeads }) {
  const byStatus = (s) => leads.filter(l => {
    if (s === 'New') return l.status === 'New' || l.status === 'Not Contacted'
    if (s === 'Contacted') return l.status === 'Contacted' || l.status === 'Meeting Scheduled'
    return l.status === s
  })

  return (
    <div className="kanban-scroll" style={{ paddingBottom: 8 }}>
      {KANBAN_COLS.map(col => (
        <div key={col} className="kanban-col" style={{ minHeight: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#555' }}>{col}</p>
            <span style={{ fontSize: 11, color: '#AAA', background: '#E3E3E3', borderRadius: 99, padding: '1px 7px' }}>{byStatus(col).length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {byStatus(col).map(l => (
              <div key={l.id} className="card" style={{ padding: '12px 14px' }}>
                <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{l.name}</p>
                <p style={{ fontSize: 12, color: '#777', marginBottom: 6 }}>{l.company}</p>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{formatINR(l.value)}</span>
                  <StatusBadge label={l.priority} />
                </div>
                {l.assigned && <p style={{ fontSize: 11, color: '#AAA', marginTop: 5 }}>{l.assigned}</p>}
                <div className="flex items-center justify-between mt-2">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: l.whatsappSent ? '#F97316' : '#25D366', display: 'inline-block', boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }} />
                    <span style={{ fontSize: 11, color: '#777' }}>{l.whatsappSent ? 'Messaged' : 'Not Messaged'}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(l)} className="btn btn-ghost btn-xs"><Edit2 size={11} /></button>
                    {col !== 'Converted' && <button onClick={() => onConvert(l)} className="btn btn-ghost btn-xs"><UserPlus size={11} /></button>}
                    <button onClick={() => onDelete(l.id)} className="btn btn-danger btn-xs"><Trash2 size={11} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
