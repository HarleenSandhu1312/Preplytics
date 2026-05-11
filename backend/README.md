# PrepLytics v2 — Backend Auth Upgrade

## What Changed

### Backend
- ✅ **MongoDB + Mongoose** — users stored permanently in MongoDB
- ✅ **bcrypt** — passwords hashed with bcryptjs (salt rounds: 10)
- ✅ **JWT** — stateless authentication via JSON Web Tokens (7-day expiry)
- ✅ **Removed** PostgreSQL, Passport.js, express-session, Socket.io
- ✅ **Added** `acceptedTerms` field to User model
- ✅ **Added** `semester` field to User model
- ✅ **Added** `GET /api/admin/users` — fetch all users (admins + students)
- ✅ **Added** `DELETE /api/admin/users/:id` — remove any user
- ✅ **Simplified** `package.json` — removed unused dependencies

### Frontend
- ✅ **AuthContext** — fully rewritten to use backend API (axios), no localStorage user storage
- ✅ **Login** — calls `POST /api/auth/login`, stores JWT in localStorage
- ✅ **Register** — calls `POST /api/auth/register`, includes Terms & Conditions checkbox
- ✅ **Logout** — calls `POST /api/auth/logout`, clears token from localStorage
- ✅ **Password change** — calls `PUT /api/auth/change-password` API (Settings page)
- ✅ **Admin pages** — AdminDashboard, AdminSettings, StudentAnalytics, AdminProfile all fetch users from `GET /api/admin/users`
- ✅ **storage.js** — auth methods removed (`getUsers`, `saveUsers`, `getCurrentUser`, etc.)
- ✅ **Added** `src/utils/api.js` — configured axios instance with JWT interceptor
- ✅ **vite.config.js** — added `/api` proxy to backend (port 5000)
- ✅ **Added** axios to `package.json`

---

## Setup & Run

### 1. Start MongoDB
```bash
mongod
```

### 2. Backend
```bash
cd backend
npm install
node utils/seeder.js    # Creates default admin (run once)
npm run dev             # Starts on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev             # Starts on http://localhost:5173
```

---

## API Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |

### Auth (Protected — requires JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update-profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Admin (Protected — Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| DELETE | `/api/admin/users/:id` | Remove a user |
| GET | `/api/admin/analytics` | Platform stats |

---

## Default Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@preplytics.com | admin123 |

> ⚠️ Change the admin password after first login!

---

## Register Payload
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Secret123",
  "branch": "CSE",
  "examTarget": "GATE",
  "semester": "",
  "acceptedTerms": "true"
}
```

## Login Payload
```json
{
  "email": "jane@example.com",
  "password": "Secret123"
}
```

## JWT Usage
Every protected request needs:
```
Authorization: Bearer <token>
```
The token is automatically attached by `src/utils/api.js` via an Axios interceptor.

---

## Environment Variables (backend/.env)
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/preplytics
JWT_SECRET=your_strong_random_secret_here
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```
