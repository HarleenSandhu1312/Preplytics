# Preplytics API — Postman Testing Guide

## Base URL
```
http://localhost:5000
```

## Setup
1. Create a Postman Collection called "Preplytics API"
2. Set a Collection Variable: `base_url = http://localhost:5000`
3. After login, copy the token and set variable: `token = <your_token>`
4. Add Authorization header on protected requests: `Bearer {{token}}`

---

## 1. AUTH ROUTES

### Register
- **Method:** POST
- **URL:** `{{base_url}}/api/auth/register`
- **Body (JSON):**
```json
{
  "name": "Harleen Kaur",
  "email": "harleen@student.com",
  "password": "student123",
  "role": "student",
  "branch": "Computer Science",
  "examTarget": "GATE 2025"
}
```
- **Expected:** 201, returns `token` + user object

---

### Login
- **Method:** POST
- **URL:** `{{base_url}}/api/auth/login`
- **Body (JSON):**
```json
{
  "email": "harleen@student.com",
  "password": "student123"
}
```
- **Expected:** 200, returns `token`
- **Save token:** Copy `token` from response → set as collection variable

---

### Get Current User
- **Method:** GET
- **URL:** `{{base_url}}/api/auth/me`
- **Headers:** `Authorization: Bearer {{token}}`
- **Expected:** 200, returns user object

---

### Update Profile
- **Method:** PUT
- **URL:** `{{base_url}}/api/auth/update-profile`
- **Headers:** `Authorization: Bearer {{token}}`
- **Body (JSON):**
```json
{
  "name": "Harleen Kaur Sandhu",
  "phone": "+91 9876543210",
  "branch": "CSE",
  "examTarget": "GATE 2026",
  "dailyGoal": 6
}
```

---

### Change Password
- **Method:** PUT
- **URL:** `{{base_url}}/api/auth/change-password`
- **Headers:** `Authorization: Bearer {{token}}`
- **Body (JSON):**
```json
{
  "currentPassword": "student123",
  "newPassword": "newpassword456"
}
```

---

### Logout
- **Method:** POST
- **URL:** `{{base_url}}/api/auth/logout`
- **Expected:** 200, clears cookie

---

## 2. STUDY PLAN ROUTES

### Get All Plans
- **Method:** GET
- **URL:** `{{base_url}}/api/plans`
- **Headers:** `Authorization: Bearer {{token}}`

---

### Create Study Plan
- **Method:** POST
- **URL:** `{{base_url}}/api/plans`
- **Headers:** `Authorization: Bearer {{token}}`
- **Body (JSON):**
```json
{
  "title": "GATE 2025 Prep",
  "description": "Complete preparation plan",
  "examDate": "2025-02-01",
  "subjects": [
    {
      "name": "Data Structures",
      "topics": [
        { "name": "Arrays", "status": "completed" },
        { "name": "Linked Lists", "status": "in-progress" },
        { "name": "Trees", "status": "pending" }
      ]
    },
    {
      "name": "Operating Systems",
      "topics": [
        { "name": "Processes", "status": "pending" },
        { "name": "Memory Management", "status": "pending" }
      ]
    }
  ]
}
```
- **Expected:** 201, returns plan with `_id`
- **Save plan ID:** Copy `_id` → set as `plan_id` variable

---

### Get Single Plan
- **Method:** GET
- **URL:** `{{base_url}}/api/plans/{{plan_id}}`
- **Headers:** `Authorization: Bearer {{token}}`

---

### Update Plan
- **Method:** PUT
- **URL:** `{{base_url}}/api/plans/{{plan_id}}`
- **Headers:** `Authorization: Bearer {{token}}`
- **Body (JSON):**
```json
{
  "title": "GATE 2025 Updated Plan"
}
```

---

### Delete Plan
- **Method:** DELETE
- **URL:** `{{base_url}}/api/plans/{{plan_id}}`
- **Headers:** `Authorization: Bearer {{token}}`

---

## 3. PROGRESS ROUTES

### Get Full Progress
- **Method:** GET
- **URL:** `{{base_url}}/api/progress`
- **Headers:** `Authorization: Bearer {{token}}`

---

### Get Dashboard Stats
- **Method:** GET
- **URL:** `{{base_url}}/api/progress/dashboard`
- **Headers:** `Authorization: Bearer {{token}}`
- **Returns:** streak, hours, completionPct, avgScore, lastScore, etc.

---

### Submit Test Result
- **Method:** POST
- **URL:** `{{base_url}}/api/progress/test`
- **Headers:** `Authorization: Bearer {{token}}`
- **Body (JSON):**
```json
{
  "subject": "Data Structures",
  "testName": "Mock Test 1",
  "score": 78,
  "total": 100
}
```

---

### Log Daily Study
- **Method:** POST
- **URL:** `{{base_url}}/api/progress/daily`
- **Headers:** `Authorization: Bearer {{token}}`
- **Body (JSON):**
```json
{
  "date": "2025-01-15",
  "hoursStudied": 4,
  "topicsCompleted": 2
}
```

---

### Upload Certificate
- **Method:** POST
- **URL:** `{{base_url}}/api/progress/certificate`
- **Headers:** `Authorization: Bearer {{token}}`
- **Body (form-data):**
  - `subject` : `Data Structures`  (text)
  - `certificate` : (file — select a PDF)

---

## 4. ADMIN ROUTES
> First login as admin: `admin@preplytics.com / admin123`
> Set the admin token as `admin_token`

### Get Platform Analytics
- **Method:** GET
- **URL:** `{{base_url}}/api/admin/analytics`
- **Headers:** `Authorization: Bearer {{admin_token}}`
- **Returns:** totalStudents, totalPlans, subjectAverages, recentStudents

---

### Get All Students
- **Method:** GET
- **URL:** `{{base_url}}/api/admin/students`
- **Headers:** `Authorization: Bearer {{admin_token}}`

---

### Remove a Student
- **Method:** DELETE
- **URL:** `{{base_url}}/api/admin/students/{{student_id}}`
- **Headers:** `Authorization: Bearer {{admin_token}}`

---

### Create Subject
- **Method:** POST
- **URL:** `{{base_url}}/api/admin/subjects`
- **Headers:** `Authorization: Bearer {{admin_token}}`
- **Body (JSON):**
```json
{
  "name": "Full Stack Development"
}
```

---

### Post Announcement
- **Method:** POST
- **URL:** `{{base_url}}/api/admin/announce`
- **Headers:** `Authorization: Bearer {{admin_token}}`
- **Body (JSON):**
```json
{
  "title": "New Study Material Added",
  "message": "DSA notes for Chapter 5 have been uploaded."
}
```

---

## 5. SSR DEMO ROUTES (open in browser)

| URL | Description |
|-----|-------------|
| `http://localhost:5000/views/login` | SSR login page (EJS) |
| `http://localhost:5000/views/dashboard` | SSR dashboard (session protected) |
| `http://localhost:5000/views/logout` | Logout + redirect |
| `http://localhost:5000/api/health` | API health check |

---

## 6. SOCKET.IO TESTING (JavaScript Console)

Open browser console at `http://localhost:5173` and run:

```javascript
// Connect to socket
const socket = io('http://localhost:5000', {
  auth: { token: 'YOUR_JWT_TOKEN_HERE' }
});

socket.on('connect', () => console.log('Connected:', socket.id));

// Send a message to admin
socket.emit('send_message', {
  recipientId: 'ADMIN_USER_ID',
  message: 'Hello admin!'
});

// Listen for messages
socket.on('receive_message', (data) => {
  console.log('New message:', data);
});

// Set a study reminder (fires after 1 minute)
socket.emit('set_reminder', { minutes: 1, subject: 'DSA' });
socket.on('study_reminder', (data) => {
  console.log('Reminder:', data.message);
});

// Notify topic completed
socket.emit('topic_completed', {
  subject: 'DSA',
  topic: 'Binary Trees'
});
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Not authorized | Missing/expired token | Re-login and update token |
| 400 Validation failed | Missing required fields | Check request body |
| 403 Admins only | Not an admin account | Login with admin credentials |
| 404 Not found | Wrong ID or route | Check URL and ID |
| 429 Too many requests | Rate limit hit | Wait 15 minutes |
| 500 Server Error | DB not connected | Check MongoDB is running |
