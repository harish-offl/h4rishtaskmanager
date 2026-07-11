import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import StatusBadge from '../components/ui/StatusBadge'

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS_LABEL = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function CalendarView() {
  const { tasks, leads, invoices, todos } = useApp()
  const [cur, setCur] = useState(new Date(2026, 6, 1))
  const [selectedDate, setSelectedDate] = useState(null)

  const year = cur.getFullYear(), month = cur.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month+1, 0).getDate()

  const prev = () => setCur(d => new Date(d.getFullYear(), d.getMonth()-1, 1))
  const next = () => setCur(d => new Date(d.getFullYear(), d.getMonth()+1, 1))

  const pad = (n) => String(n).padStart(2,'0')

  const getEventsForDate = (d) => {
    const key = `${year}-${pad(month+1)}-${pad(d)}`
    const events = []
    tasks.filter(t=>t.due===key).forEach(t=>events.push({ type:'task', label:t.title, color:'#4D7CFE', status:t.status }))
    leads.filter(l=>l.nextFollowup===key).forEach(l=>events.push({ type:'follow-up', label:l.name+' follow-up', color:'#D89B2B' }))
    invoices.filter(i=>i.dueDate===key).forEach(i=>events.push({ type:'invoice', label:'Invoice '+i.number, color:i.status==='Overdue'?'#D9534F':'#2E8B57' }))
    todos.filter(t=>t.due===key).forEach(t=>events.push({ type:'todo', label:t.title, color:'#777' }))
    return events
  }

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : []

  const cells = []
  for (let i=0; i<firstDay; i++) cells.push(null)
  for (let d=1; d<=daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const today = new Date()
  const isToday = (d) => d && year===today.getFullYear() && month===today.getMonth() && d===today.getDate()

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div>
        <h1 className="page-title">Calendar</h1>
        <p className="page-sub">Tasks, follow-ups, invoices and more</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Calendar */}
        <div className="card" style={{ padding:20, gridColumn:'span 2' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <button onClick={prev} className="btn btn-ghost btn-xs"><ChevronLeft size={14} /></button>
            <p style={{ fontWeight:700, fontSize:15 }}>{MONTHS_LABEL[month]} {year}</p>
            <button onClick={next} className="btn btn-ghost btn-xs"><ChevronRight size={14} /></button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:8 }}>
            {DAYS.map(d=><div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:'#AAA', padding:'4px 0' }}>{d}</div>)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
            {cells.map((d,i) => {
              const events = d ? getEventsForDate(d) : []
              return (
                <div key={i}
                  onClick={() => d && setSelectedDate(d)}
                  style={{
                    minHeight:60, padding:'6px 5px', borderRadius:8, cursor:d?'pointer':'default',
                    background: selectedDate===d&&d?'#1F1F1F': isToday(d)?'rgba(31,31,31,0.07)':'transparent',
                    border: isToday(d)?'1.5px solid #1F1F1F':'1.5px solid transparent',
                    transition:'background 0.15s',
                  }}>
                  {d && <>
                    <p style={{ fontSize:12, fontWeight:isToday(d)?700:400, color:selectedDate===d?'#fff':isToday(d)?'#1F1F1F':'#333', marginBottom:3 }}>{d}</p>
                    {events.slice(0,2).map((e,j)=>(
                      <div key={j} style={{ fontSize:10, background:e.color+'22', color:e.color, borderRadius:3, padding:'1px 4px', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {e.label}
                      </div>
                    ))}
                    {events.length>2&&<div style={{ fontSize:10, color:'#AAA' }}>+{events.length-2}</div>}
                  </>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar — events for selected date */}
        <div className="card" style={{ padding:20 }}>
          <p style={{ fontWeight:600, fontSize:14, marginBottom:14 }}>
            {selectedDate ? `${MONTHS_LABEL[month]} ${selectedDate}` : 'Select a date'}
          </p>
          {!selectedDate && <p style={{ fontSize:13, color:'#AAA' }}>Click any date to see events</p>}
          {selectedDate && selectedEvents.length===0 && <p style={{ fontSize:13, color:'#AAA' }}>No events this day</p>}
          {selectedEvents.map((e,i)=>(
            <div key={i} style={{ display:'flex', gap:10, marginBottom:12, paddingBottom:12, borderBottom:'1px solid #F0F0F0' }}>
              <div style={{ width:4, borderRadius:99, background:e.color, flexShrink:0 }} />
              <div>
                <p style={{ fontSize:12, fontWeight:600, textTransform:'uppercase', color:e.color, letterSpacing:'0.06em', marginBottom:2 }}>{e.type}</p>
                <p style={{ fontSize:13 }}>{e.label}</p>
                {e.status && <StatusBadge label={e.status} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming this month */}
      <div className="card" style={{ padding:20 }}>
        <p style={{ fontWeight:600, fontSize:14, marginBottom:14 }}>Upcoming This Month</p>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {[
            ...tasks.filter(t=>t.due?.startsWith(`${year}-${pad(month+1)}`)).map(t=>({ date:t.due, label:t.title, type:'Task', color:'#4D7CFE', status:t.status })),
            ...leads.filter(l=>l.nextFollowup?.startsWith(`${year}-${pad(month+1)}`)).map(l=>({ date:l.nextFollowup, label:l.name, type:'Follow-Up', color:'#D89B2B' })),
            ...invoices.filter(i=>i.dueDate?.startsWith(`${year}-${pad(month+1)}`)).map(i=>({ date:i.dueDate, label:`Invoice ${i.number}`, type:'Invoice', color:'#2E8B57' })),
          ].sort((a,b)=>a.date?.localeCompare(b.date)).slice(0,10).map((e,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0', borderBottom:'1px solid #F5F5F5' }}>
              <span style={{ fontSize:11, color:'#AAA', minWidth:72 }}>{e.date}</span>
              <span style={{ fontSize:10, fontWeight:700, color:e.color, background:e.color+'15', padding:'2px 7px', borderRadius:99, minWidth:60, textAlign:'center' }}>{e.type}</span>
              <span style={{ fontSize:13, flex:1 }}>{e.label}</span>
              {e.status && <StatusBadge label={e.status} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
