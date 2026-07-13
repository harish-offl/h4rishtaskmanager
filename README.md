# Arrise Daily Task Tracker

A full-stack personal productivity dashboard with authentication, per-user data, daily tasks, weekly habits, streaks, notes, and a calendar view.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Framer Motion + Lucide React
- **Backend**: Node.js + Express + JWT Auth
- **Database**: MongoDB (Mongoose)

## Project Structure

```
arrise-daily-task-tracker/
├── client/          # React frontend
│   └── src/
│       ├── api/         # Axios instance
│       ├── context/     # Auth context
│       ├── components/  # Sidebar
│       └── pages/       # Dashboard, Tasks, Habits, Notes, Streaks, Calendar, Settings
└── server/          # Express API
    ├── models/      # User, Task, Habit, HabitLog, Note, Streak
    ├── routes/      # auth, tasks, habits, notes, streak, settings
    └── middleware/  # JWT auth
```

## Setup

### 1. MongoDB
Install and run MongoDB locally, or use MongoDB Atlas.

### 2. Server
```bash
cd server
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
npm install
npm run dev
```

### 3. Client
```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`, API at `http://localhost:5000`.

## Features

- Login / Register with JWT auth
- Per-user isolated data
- Daily tasks with date picker and history
- Weekly habit tracker (fully customizable)
- Streak system with milestones
- Colorful notes with star/edit/delete
- Monthly calendar with completion dots
- Dark / Light theme
- Fully responsive (desktop, tablet, mobile)
