# Arrise Daily Task Tracker

A full-stack personal productivity dashboard with authentication, per-user data, daily tasks, weekly habits, streaks, notes, and a calendar view.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Framer Motion + Lucide React
- **Data storage**: Browser localStorage
- **Authentication**: Local accounts stored in browser-local storage
- **Backend**: Not required for the standalone app

## Project Structure

```
arrise-daily-task-tracker/
├── client/          # React frontend
│   └── src/
│       ├── context/     # Auth context
│       ├── components/  # UI components
│       └── pages/       # Dashboard, Tasks, Habits, Notes, Streaks, Calendar, Settings
```

## Setup

### Client
```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Features

- Login / Register with local password auth
- Per-user isolated data stored in browser localStorage
- Daily tasks with date picker and history
- Weekly habit tracker (fully customizable)
- Streak system with milestones
- Colorful notes with star/edit/delete
- Monthly calendar with completion dots
- Dark / Light theme
- Fully responsive (desktop, tablet, mobile)
