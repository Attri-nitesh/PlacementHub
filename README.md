# PlacementHub — Phase 1 (Authentication & Foundation)

A production-grade, dark-first campus placement management platform built with **Node.js, Express.js, MongoDB, JWT (HttpOnly cookies)** and **React, Vite, Tailwind CSS, Framer Motion**.

---

## 🌟 Tech Stack & Architecture

### Backend (`/backend`)
- Node.js & Express.js
- MongoDB & Mongoose ORM
- JWT Authentication (stored securely in `HttpOnly` Cookies)
- bcryptjs (Password Hashing)
- Cookie-parser, CORS (with credentials), Dotenv

### Frontend (`/frontend`)
- React 18 (Vite)
- React Router DOM v6
- Tailwind CSS v3 (Custom Dark-First Palette & Glassmorphism)
- Framer Motion (Page transitions & micro-interactions)
- Lucide React Icons
- Axios (With Credentials enabled)

---

## 🚀 Quick Start Guide

### 1. Database & Seeding
Ensure MongoDB is running locally (`mongodb://127.0.0.1:27017/placementhub`) or configure your Atlas URI in `backend/.env`.

Run the seed script to populate default demo accounts:
```bash
npm run seed
```

This generates:
- **Placement Cell Demo Account**:
  - Email: `admin@placement.edu`
  - Password: `admin123password`
- **Student Demo Account**:
  - Email: `john@student.edu`
  - Password: `student123password`

---

### 2. Running Backend Server
```bash
cd backend
npm run dev
```
Or from the root directory:
```bash
npm run backend
```
The server will run on `http://localhost:5000`.

---

### 3. Running Frontend Application
```bash
cd frontend
npm run dev
```
Or from the root directory:
```bash
npm run frontend
```
The frontend application will launch on `http://localhost:5173`.

---

## 🔒 Security & Roles

- **Student Role**:
  - Can self-register at `/register` (Name, Email, Roll Number, Password, Confirm Password).
  - Granted access exclusively to `/student/dashboard`.

- **Placement Cell Role**:
  - No public registration form (Accounts are seeded manually).
  - Granted access exclusively to `/placement/dashboard`.

- **Protected Routes**: Unauthorized role navigation is intercepted and safely redirected to appropriate dashboards or login pages.
