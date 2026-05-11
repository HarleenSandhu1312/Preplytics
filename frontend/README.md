# PrepLytics v2

Smart exam preparation platform with Role-based access (Student + Admin).

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## 🔑 Demo Login

| Role    | Email                      | Password  |
|---------|----------------------------|-----------|
| Admin   | admin@preplytics.com       | admin123  |
| Student | Register a new account     | —         |

## ✨ Features

### Student Side
- **Dashboard** — Opens by default (no login required to view)
- **Study** — Topics per subject, notes, materials from admin, mini tests
- **Planner** — Smart revision calendar based on your test scores
- **Progress** — Weekly chart, subject performance, test history
- **Profile** — Edit info, view strong/weak subjects
- **Settings** — Dark/light theme toggle, reset, sign out

### Admin Side
- **Admin Dashboard** — Stats overview, activity log, students below 50%
- **Subjects Manager** — Add/edit/delete subjects with icons & weightage
- **Topics Manager** — Per-subject topics with difficulty & importance
- **Notes Manager** — Upload notes entries linked to subject→topic
- **Test Manager** — Create multi-question tests with correct answers & explanations
- **Student Analytics** — Per-student subject scores, weak area detection
- **Admin Settings** — Manage admins, students, system thresholds

## 🎨 Design

- **Both sidebars** (left nav + right panel) use the same dark navy color
- **Only blue** used as accent throughout
- **Yellow** used only for weak topics / warnings
- **Red** used only for critical alerts
- Light/Dark theme toggleable from sidebar bottom

## 📁 Structure

```
src/
├── student/pages/     Dashboard, Study, Planner, Progress, Profile, Settings
├── admin/pages/       AdminDashboard, SubjectsManager, TopicsManager, NotesManager, TestManager, StudentAnalytics, AdminSettings
├── shared/            Sidebar, Topbar, RightSidebar
├── context/           AuthContext, StudyContext, ThemeContext
├── utils/             storage.js, analytics.js, seed.js
└── styles/            global.css
```

## 🏗 Tech

- React 18 + Vite
- localStorage for all data persistence (no backend needed)
- No external UI libraries — pure CSS
