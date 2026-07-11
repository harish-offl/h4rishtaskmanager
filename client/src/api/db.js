// localStorage database — all data scoped per user
function getUser() {
  try {
    const s = JSON.parse(localStorage.getItem('arrise_session') || 'null')
    return s?.username || null
  } catch { return null }
}

function key(collection) {
  const u = getUser()
  return `arrise_${collection}_${u}`
}

function load(collection) {
  try { return JSON.parse(localStorage.getItem(key(collection)) || '[]') } catch { return [] }
}

function save(collection, data) {
  localStorage.setItem(key(collection), JSON.stringify(data))
}

function loadObj(collection, fallback = {}) {
  try { return JSON.parse(localStorage.getItem(key(collection)) || JSON.stringify(fallback)) } catch { return fallback }
}

function saveObj(collection, data) {
  localStorage.setItem(key(collection), JSON.stringify(data))
}

let _uidCounter = 0
function uid() {
  // Combine timestamp + counter + random to guarantee uniqueness even in tight loops
  _uidCounter++
  return Date.now().toString(36) + '_' + _uidCounter.toString(36) + '_' + Math.random().toString(36).slice(2)
}

// ── TASKS ──────────────────────────────────────────────────────────────────
export const Tasks = {
  getByDate(date) {
    return load('tasks').filter(t => t.date === date)
  },
  getByMonth(month) { // 'YYYY-MM'
    return load('tasks').filter(t => t.date?.startsWith(month))
  },
  add(data) {
    const tasks = load('tasks')
    const task = { _id: uid(), status: 'pending', createdAt: new Date().toISOString(), completedAt: null, ...data }
    tasks.unshift(task)
    save('tasks', tasks)
    return task
  },
  update(id, updates) {
    const tasks = load('tasks')
    const idx = tasks.findIndex(t => t._id === id)
    if (idx === -1) return null
    if (updates.status === 'completed') updates.completedAt = new Date().toISOString()
    if (updates.status === 'pending') updates.completedAt = null
    tasks[idx] = { ...tasks[idx], ...updates }
    save('tasks', tasks)
    updateStreak()
    return tasks[idx]
  },
  delete(id) {
    const tasks = load('tasks').filter(t => t._id !== id)
    save('tasks', tasks)
  }
}

// ── HABITS ─────────────────────────────────────────────────────────────────
export const Habits = {
  getAll() {
    const stored = load('habits')
    if (stored.length > 0) {
      // Repair any duplicate _id values from old seeding bug
      const seen = new Set()
      let needsRepair = false
      stored.forEach(h => {
        if (seen.has(h._id)) needsRepair = true
        seen.add(h._id)
      })
      if (needsRepair) {
        const repaired = stored.map(h => ({ ...h, _id: uid() }))
        save('habits', repaired)
        return repaired
      }
      return stored
    }
    // Seed defaults with guaranteed unique IDs using index-based delay
    const defaults = ['Wake up early','Drink water','Study','Agency work','Client follow-up','Exercise','Reading','Sleep on time']
    const habits = defaults.map((name, i) => ({
      _id: `habit_${i}_${Math.random().toString(36).slice(2)}`,
      name,
      order: i
    }))
    save('habits', habits)
    return habits
  },
  add(name) {
    const habits = this.getAll()
    const habit = { _id: uid(), name, order: habits.length }
    habits.push(habit)
    save('habits', habits)
    return habit
  },
  update(id, updates) {
    const habits = load('habits')
    const idx = habits.findIndex(h => h._id === id)
    if (idx === -1) return null
    habits[idx] = { ...habits[idx], ...updates }
    save('habits', habits)
    return habits[idx]
  },
  delete(id) {
    const habits = load('habits').filter(h => h._id !== id)
    save('habits', habits)
    // also remove logs
    const logs = load('habitlogs').filter(l => l.habitId !== id)
    save('habitlogs', logs)
  }
}

export const HabitLogs = {
  getByWeek(weekKey) {
    return load('habitlogs').filter(l => l.weekKey === weekKey)
  },
  toggle(habitId, date, dayOfWeek, weekKey) {
    const logs = load('habitlogs')
    // Match on BOTH habitId AND date — this is the unique composite key per cell
    const idx = logs.findIndex(l => String(l.habitId) === String(habitId) && l.date === date)
    if (idx !== -1) {
      logs.splice(idx, 1)
      save('habitlogs', logs)
      return { toggled: false }
    }
    const log = { _id: uid(), habitId: String(habitId), date, dayOfWeek, weekKey, completed: true }
    logs.push(log)
    save('habitlogs', logs)
    return { toggled: true, log }
  }
}

// ── NOTES ──────────────────────────────────────────────────────────────────
export const Notes = {
  getAll() {
    return load('notes').sort((a, b) => (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0) || new Date(b.updatedAt) - new Date(a.updatedAt))
  },
  add(color) {
    const notes = load('notes')
    const note = { _id: uid(), title: '', content: '', color, isStarred: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    notes.unshift(note)
    save('notes', notes)
    return note
  },
  update(id, updates) {
    const notes = load('notes')
    const idx = notes.findIndex(n => n._id === id)
    if (idx === -1) return null
    notes[idx] = { ...notes[idx], ...updates, updatedAt: new Date().toISOString() }
    save('notes', notes)
    return notes[idx]
  },
  delete(id) {
    save('notes', load('notes').filter(n => n._id !== id))
  }
}

// ── STREAK ─────────────────────────────────────────────────────────────────
function updateStreak() {
  const today = new Date().toISOString().split('T')[0]
  const users = JSON.parse(localStorage.getItem('arrise_users') || '{}')
  const username = getUser()
  const dailyGoal = users[username]?.dailyGoal || 1

  const todayTasks = load('tasks').filter(t => t.date === today)
  const completed = todayTasks.filter(t => t.status === 'completed').length
  if (completed < dailyGoal) return

  const streak = loadObj('streak', { currentStreak: 0, bestStreak: 0, lastCompletedDate: null, history: [] })
  if (streak.lastCompletedDate === today) return

  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
  const yKey = yesterday.toISOString().split('T')[0]
  const newCurrent = streak.lastCompletedDate === yKey ? streak.currentStreak + 1 : 1
  const newBest = Math.max(newCurrent, streak.bestStreak)

  const hist = streak.history || []
  const hi = hist.findIndex(h => h.date === today)
  if (hi === -1) hist.push({ date: today, completed: true })
  else hist[hi].completed = true

  saveObj('streak', { currentStreak: newCurrent, bestStreak: newBest, lastCompletedDate: today, history: hist })
}

export const Streak = {
  get() {
    return loadObj('streak', { currentStreak: 0, bestStreak: 0, lastCompletedDate: null, history: [] })
  }
}
