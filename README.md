# PlacementHub

PlacementHub is a production-ready, full-stack placement management and job application tracking platform. It serves as a centralized hub for Students (to track application status via a Kanban Board), Corporate Recruiters (to post job drives and manage applicants), and College Placement Officers / Admins (to approve candidates, set criteria, and broadcast real-time announcements).

---

## Technical Stack

- **Frontend**: React.js (Vite), React Router DOM, Zustand (State Management), Axios, Recharts (Data Visualizations), Tailwind CSS v4, Lucide React (Icons), Socket.io-client.
- **Backend**: Node.js, Express.js, MongoDB with Mongoose, JWT Authentication, Socket.io (Real-time Events), Nodemailer (Email Dispatches), `node-cron` (Daily Automation Tasks).
- **Security**: Password hashing via `bcryptjs`, CORS validation protection, Helmet HTTP headers, API Rate Limiting, and express-validator input sanitizations.

---

## Project Structure

```text
PlacementHub/
├── backend/                  # Node/Express API Server
│   ├── src/
│   │   ├── config/           # Database, Socket, and Mail configurations
│   │   ├── controllers/      # Route controllers for business logic
│   │   ├── middleware/       # Auth checks, Role authorization, Val rules
│   │   ├── models/           # Mongoose schemas (User, StudentProfile, etc.)
│   │   ├── routes/           # REST APIs routing mounts
│   │   ├── utils/            # node-cron jobs, email HTML templates, seeds
│   │   └── server.js         # Entry point
│   ├── .env.example
│   └── package.json
├── frontend/                 # React/Vite Client
│   ├── src/
│   │   ├── components/       # Reusable components (Layout, Kanban, Skeletons)
│   │   ├── pages/            # Dashboard views & Auth screens
│   │   ├── services/         # Axios interceptor setups
│   │   ├── store/            # Zustand global stores (Auth, Drives, Notifs)
│   │   ├── App.jsx           # Client router
│   │   ├── index.css         # Tailwind directives
│   │   └── main.jsx          # Entry point
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md                 # Documentation
```

---

## Key Features

1. **Role-Based Access Control**:
   - **Student**: Build details (GPA, Skills, Branch, Education), upload resumes, apply to job drives, and track statuses in a drag-and-drop Kanban Board.
   - **Recruiter**: Create company profiles, publish job requirements, inspect student CVs, and shortlist or reject candidates with feedback.
   - **College Admin**: Manage registrations, view college-wide applicants, approve or reject applications before recruiter forwarding, and broadcast system announcements.
2. **Real-time Notifications**: Custom Socket.io server dispatches notifications for status changes, new placement drives, and deadline warnings.
3. **Automated Reminders**: node-cron triggers a daily task at midnight, scanning active placement drives closing in exactly 3 days, and automatically emails students who have not yet registered.
4. **Rich Analytics**: Visualized dashboards leveraging Recharts displaying Monthly application volume, Most active drives, Package averages, and Success rates.

---

## Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://localhost:27017` (or remote cluster)
- npm or yarn

### 1. Backend Configuration
1. Open the backend folder:
   ```bash
   cd backend
   ```
2. Create your `.env` configuration:
   ```bash
   cp .env.example .env
   ```
3. Set your variables in `.env`. (If SMTP host is left blank, Nodemailer automatically falls back to an Ethereal mock email account, logging sandbox check links to the console).
4. Run the seed script to wipe the database and pre-populate mock students, recruiters, and drives data:
   ```bash
   npm run seed
   # or run directly: node src/utils/seed.js
   ```
5. Launch the backend API server in development mode:
   ```bash
   npm run dev
   ```

### 2. Frontend Configuration
1. Open a new terminal tab and enter the frontend folder:
   ```bash
   cd frontend
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Boot the Vite hot-reloading development server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:5173`.

---

## Testing Credentials

The seed script establishes the following accounts for immediate dashboard testing (all passwords are `password123`):

- **Placement Admin**: `admin@placementhub.com`
- **Recruiters**:
  - `sarah@google.com` (Google)
  - `john@amazon.com` (Amazon)
- **Students**:
  - `amit@student.com` (CGPA: 8.7, CSE)
  - `priya@student.com` (CGPA: 7.9, IT)
  - `rohan@student.com` (CGPA: 9.3, Electronics)
  - `sneha@student.com` (CGPA: 6.8, CSE)
