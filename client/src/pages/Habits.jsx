import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Check, Plus, Trash2, Edit3, X } from 'lucide-react'
import { Habits as HabitsDB, HabitLogs } from '../api/db'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekDates() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now)
  monday.setDate(diff)
  return DAYS.map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

export default function Habits() {
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState([])
  const [newHabit, setNewHabit] = useState('')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const weekDates = getWeekDates()
  const weekKey = weekDates[0]

  const load = useCallback(() => {
    setHabits(HabitsDB.getAll())
    setLogs(HabitLogs.getByWeek(weekKey))
  }, [weekKey])

  useEffect(() => { load() }, [load])

  const isChecked = (habitId, date) =>
    logs.some(l => String(l.habitId) === String(habitId) && l.date === date)

  const toggle = (habitId, date, dayOfWeek) => {
    HabitLogs.toggle(habitId, date, dayOfWeek, weekKey)
    setLogs(HabitLogs.getByWeek(weekKey))
  }

  const addHabit = () => {
    if (!newHabit.trim()) return
    const h = HabitsDB.add(newHabit.trim())
    setHabits(prev => [...prev, h])
    setNewHabit('')
  }

  const deleteHabit = (id) => {
    HabitsDB.delete(id)
    setHabits(prev => prev.filter(h => h._id !== id))
    setLogs(prev => prev.filter(l => l.habitId !== id))
  }

  const saveEdit = (id) => {
    if (!editName.trim()) return
    HabitsDB.update(id, { name: editName.trim() })
    setHabits(prev => prev.map(h => h._id === id ? { ...h, name: editName.trim() } : h))
    setEditId(null)
  }

  const getCompletion = (habitId) => {
    const done = weekDates.filter(d => isChecked(habitId, d)).length
    return { done, pct: Math.round((done / 7) * 100) }
  }

  const pctColor = (pct) => pct >= 70 ? '#4ade80' : pct >= 40 ? '#fbbf24' : '#f87171'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">Weekly Habits</h1>
        <p className="text-sm" style={{ color: '#666' }}>Week of {weekDates[0]}</p>
      </div>

      {/* Add habit input — matches screenshot style */}
      <div className="card p-3 flex gap-2 items-center">
        <input className="input flex-1" style={{ background: 'transparent', border: 'none', padding: '6px 4px' }}
          placeholder="Add new habit..."
          value={newHabit} onChange={e => setNewHabit(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addHabit()} />
        <button onClick={addHabit} className="btn btn-primary text-sm flex-shrink-0"
          style={{ padding: '8px 16px' }}>
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Habit grid — matches screenshot exactly */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 580 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                <th className="text-left py-3 px-5" style={{ color: '#666', fontSize: 13, fontWeight: 500, width: 180 }}>
                  Habit
                </th>
                {DAYS.map((d, i) => (
                  <th key={d} className="text-center py-3" style={{ color: '#666', fontSize: 12, fontWeight: 500, width: 60 }}>
                    <div>{d}</div>
                    <div style={{ color: '#444', fontWeight: 400, fontSize: 11 }}>{weekDates[i]?.slice(8)}</div>
                  </th>
                ))}
                <th className="text-center py-3 px-3" style={{ color: '#666', fontSize: 12, fontWeight: 500, width: 50 }}>%</th>
                <th style={{ width: 60 }} />
              </tr>
            </thead>
            <tbody>
              {habits.map((habit, hi) => {
                const { pct } = getCompletion(habit._id)
                return (
                  <motion.tr key={habit._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: hi * 0.03 }}
                    className="group"
                    style={{ borderBottom: '1px solid #222' }}>

                    {/* Habit name */}
                    <td className="py-3 px-5">
                      {editId === habit._id ? (
                        <div className="flex items-center gap-1.5">
                          <input className="input text-sm py-1 flex-1" value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveEdit(habit._id); if (e.key === 'Escape') setEditId(null) }}
                            autoFocus />
                          <button onClick={() => saveEdit(habit._id)} style={{ color: '#aaa' }}><Check size={13} /></button>
                          <button onClick={() => setEditId(null)} style={{ color: '#666' }}><X size={13} /></button>
                        </div>
                      ) : (
                        <span className="text-sm" style={{ color: '#ccc' }}>{habit.name}</span>
                      )}
                    </td>

                    {/* Day checkboxes */}
                    {DAYS.map((d, i) => {
                      const checked = isChecked(habit._id, weekDates[i])
                      return (
                        <td key={d} className="py-3 text-center">
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => toggle(habit._id, weekDates[i], d)}
                            className={`habit-check mx-auto ${checked ? 'checked' : ''}`}>
                            {checked && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                                <Check size={14} style={{ color: '#ccc' }} strokeWidth={2.5} />
                              </motion.div>
                            )}
                          </motion.button>
                        </td>
                      )
                    })}

                    {/* % */}
                    <td className="py-3 text-center px-3">
                      <span className="text-sm font-medium" style={{ color: pctColor(pct) }}>{pct}%</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditId(habit._id); setEditName(habit.name) }}
                          style={{ color: '#555' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#aaa'}
                          onMouseLeave={e => e.currentTarget.style.color = '#555'}>
                          <Edit3 size={13} />
                        </button>
                        <button onClick={() => deleteHabit(habit._id)}
                          style={{ color: '#555' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={e => e.currentTarget.style.color = '#555'}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
          {habits.length === 0 && (
            <p className="text-center py-12 text-sm" style={{ color: '#555' }}>
              No habits yet. Add one above!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
