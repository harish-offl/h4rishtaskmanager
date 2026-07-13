import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Streak as StreakDB } from '../api/db'

const MILESTONES = [
  { days: 1,  icon: '✨', label: 'Spark' },
  { days: 3,  icon: '🔥', label: 'Fire' },
  { days: 7,  icon: '🌟', label: 'Golden Flame' },
  { days: 14, icon: '🚀', label: 'Rocket' },
  { days: 30, icon: '👑', label: 'Crown' },
  { days: 50, icon: '💎', label: 'Diamond' },
]

function getIcon(days) {
  if (days >= 50) return MILESTONES[5]
  if (days >= 30) return MILESTONES[4]
  if (days >= 14) return MILESTONES[3]
  if (days >= 7)  return MILESTONES[2]
  if (days >= 3)  return MILESTONES[1]
  return MILESTONES[0]
}

export default function Streaks() {
  const [streak, setStreak] = useState({ currentStreak: 0, bestStreak: 0 })
  useEffect(() => { setStreak(StreakDB.get()) }, [])

  const current = getIcon(streak.currentStreak)
  const next = MILESTONES.find(m => m.days > streak.currentStreak) || MILESTONES[MILESTONES.length - 1]
  const prev = MILESTONES.filter(m => m.days <= streak.currentStreak).pop() || { days: 0 }
  const pct = Math.min(100, next.days === prev.days ? 100
    : Math.round(((streak.currentStreak - prev.days) / (next.days - prev.days)) * 100))

  return (
    <div className="space-y-5">
      <h1 className="page-title">Streaks</h1>

      <div className="card p-8 text-center">
        <motion.div animate={{ scale: [1,1.1,1] }} transition={{ repeat: Infinity, duration: 2.5 }}
          className="text-5xl mb-4">{current.icon}</motion.div>
        <h2 className="text-4xl font-semibold mb-1" style={{ color: '#f0f0f0' }}>{streak.currentStreak}</h2>
        <p className="text-sm mb-4" style={{ color: '#666' }}>Day Streak</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
          style={{ background: '#2a2a2a', border: '1px solid #333', color: '#aaa' }}>
          🔥 {streak.currentStreak} Day Streak — Keep Going!
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5 text-center">
          <p className="text-xs mb-2" style={{ color: '#666' }}>Current Streak</p>
          <p className="text-3xl font-semibold" style={{ color: '#f0f0f0' }}>{streak.currentStreak}</p>
          <p className="text-xs mt-1" style={{ color: '#555' }}>days</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-xs mb-2" style={{ color: '#666' }}>Best Streak</p>
          <p className="text-3xl font-semibold" style={{ color: '#f0f0f0' }}>{streak.bestStreak}</p>
          <p className="text-xs mt-1" style={{ color: '#555' }}>days</p>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-medium mb-4" style={{ color: '#ccc' }}>Milestones</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {MILESTONES.map(({ days, icon, label }) => {
            const unlocked = streak.bestStreak >= days
            return (
              <motion.div key={days} whileHover={{ scale: 1.04 }}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                style={{
                  background: unlocked ? '#252525' : '#1a1a1a',
                  border: `1px solid ${unlocked ? '#3a3a3a' : '#222'}`,
                  opacity: unlocked ? 1 : 0.35,
                  filter: unlocked ? 'none' : 'grayscale(1)',
                }}>
                <span className="text-xl">{icon}</span>
                <p className="text-xs font-medium" style={{ color: '#ccc' }}>{days}d</p>
                <p className="text-xs text-center leading-tight" style={{ color: '#666' }}>{label}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-sm font-medium mb-3" style={{ color: '#ccc' }}>Progress to Next Milestone</h2>
        <div className="flex justify-between text-xs mb-2">
          <span style={{ color: '#666' }}>{prev.icon || '🌱'} {prev.days}d</span>
          <span style={{ color: '#aaa' }}>{streak.currentStreak} / {next.days} days</span>
          <span style={{ color: '#666' }}>{next.icon} {next.days}d</span>
        </div>
        <div className="progress-bar">
          <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 1 }} />
        </div>
        <p className="text-xs mt-2" style={{ color: '#555' }}>
          {next.days - streak.currentStreak} more days to unlock {next.icon} {next.label}
        </p>
      </div>
    </div>
  )
}
