# PLACEMENTHUB — MASTER TECHNICAL DOCUMENTATION & VIVA DEFENSE PACKAGE

**PROJECT NAME**: PlacementHub  
**PURPOSE**: Enterprise Campus Recruitment Management & Real-Time Student Application Tracking Platform  
**STACK**: React 18, Vite 5, Tailwind CSS, Node.js, Express 4, MongoDB (Mongoose 8), JWT (HttpOnly Cookies), Socket.IO, Google OAuth 2.0, Multer, PDF-Parse, Google Gemini 2.5 AI SDK, Node-Cron, Gmail API Integration  
**AUTHOR**: Student Developer / BE Computer Science & Engineering Candidate  
**DOCUMENT VERSION**: 3.0 (Production Codebase Audit Verified)

---

## EXECUTIVE SUMMARY

PlacementHub is a full-stack, enterprise-grade Campus Recruitment Platform designed to streamline college placement operations, automate job application tracking, calculate student placement eligibility, parse resume ATS scores via Google Gemini AI, and provide real-time status updates between Students, Placement Officers, and Super Administrators. 

Built using the **MERN** stack (MongoDB, Express, React, Node.js) with real-time **Socket.IO** bidirectional event streaming, PlacementHub replaces fragmented spreadsheets, manual Google Forms, and unorganized WhatsApp announcements with a Single Source of Truth architecture.

---

## PART 1 — PROJECT OVERVIEW

### 1. What is PlacementHub?
PlacementHub is a centralized university recruitment platform that connects graduating students with campus placement officers and recruiting companies. It manages job drives, tracks individual student applications through a visual Kanban pipeline, analyzes resume-job descriptions using LLM AI, provides phone OTP verification, and visualizes live recruitment analytics.

### 2. What real-world problem does it solve?
In higher education institutions, placement offices manage hundreds of recruiting companies and thousands of student applications manually. Communication via scattered emails and Google Sheets leads to missed interview deadlines, lost application records, unverified student data, duplicate company listings, and lack of transparency for students regarding their application status.

### 3. Who are the users?
1. **Students**: Apply to active campus drives, manage resumes/skills/projects, track application stages (Applied → Shortlisted → OA → Interview → Offer Released → Rejected) on a visual Kanban board, receive real-time notifications, and view personalized analytics.
2. **Placement Cell (Placement Officers & Recruiters)**: Create and broadcast job drives, filter eligible candidates by CGPA/backlogs, update candidate application stages, manage company profiles, and log audit activities.
3. **Super Administrators**: Maintain system-wide integrity, own the single shared MongoDB Company collection, audit placement statistics, and manage system access.

### 4. What problem existed before PlacementHub?
- **Data Fragmentation**: Drives posted on notice boards/WhatsApp, applications collected in Google Forms, student CGPA stored in college ERPs.
- **Data Inconsistency**: Deleting or updating a company record in admin tools did not reflect across placement officer dashboards.
- **Zero Real-Time Tracking**: Students had no visibility into whether their application was in Resume Shortlisting, Online Assessment (OA), or Interview stages.

### 5. What is the solution provided by PlacementHub?
- **Single Source of Truth**: Centralized MongoDB database for Companies, Job Drives, and Student Applications.
- **Visual Application Kanban**: Real-time 6-stage drag-and-drop tracking board synchronized across client browsers via Socket.IO.
- **AI-Powered Resume ATS Analyzer**: Integrated Google Gemini AI (`@google/genai`) to evaluate resume fit against drive job descriptions.
- **Enterprise Verification & Security**: Dual authentication (Google OAuth 2.0 & Email/Password with HttpOnly JWT cookies) and phone OTP verification via Twilio/Mock engine.

---

### 💬 2–3 Minute Speech for University Teacher
> "Respected Teacher, PlacementHub is an enterprise campus recruitment management platform designed to solve data fragmentation and lack of transparency in university placements. Before PlacementHub, placement cells managed applications across disparate Google Sheets and WhatsApp groups, causing missed interview deadlines and inaccurate candidate tracking.
> 
> PlacementHub brings all stakeholders—Students, Placement Officers, and Super Admins—into a single web application. Students can discover campus job drives, apply in one click, and track their application progress through a 6-stage real-time Kanban board. Placement Officers can post drives, screen candidates using an automated Gemini AI resume parser, update applicant stages, and broadcast instant notifications via Socket.IO.
> 
> The platform is built using React 18 and Vite on the frontend, Node.js and Express on the backend, and MongoDB with Mongoose on the database layer. Authentication uses secure HttpOnly JWT cookies alongside Google OAuth 2.0. By establishing a Single Source of Truth architecture, PlacementHub eliminates redundant records and provides real-time recruitment analytics."

---

### 💻 Technical Explanation for Interviewer
> "PlacementHub is a decoupled, event-driven MERN stack application built on RESTful micro-services principles and WebSocket real-time synchronization. The frontend is a SPA built with React 18, Vite 5, and Tailwind CSS, utilizing `framer-motion` for complex UI transitions and custom React context hooks for state management. 
> 
> The backend is an Express 4 REST API running on Node.js. It handles JWT authentication using encrypted HttpOnly cookies, RBAC (Role-Based Access Control) middleware, Multer file upload streams for PDF resumes, and `pdf-parse` combined with `@google/genai` (Gemini 2.5) for asynchronous ATS scoring. 
> 
> For database access, Mongoose 8 interfaces with MongoDB, using relational references (`ref`) and compound indexing. Real-time updates are powered by Socket.IO, streaming application state changes (`application_updated`, `application_created`) directly to active client sockets. The application enforces a Single Source of Truth architecture where Analytics and Kanban share the exact same underlying MongoDB collections."

---

## PART 2 — COMPLETE TECHNOLOGY STACK & TRADEOFFS

| Technology | Where Used | Why Used | Alternative | Why We Chose It Over Alternative |
| :--- | :--- | :--- | :--- | :--- |
| **React 18** | Frontend UI Layer | Component-based dynamic rendering, Virtual DOM efficiency, declarative state driven UI. | Plain HTML/JS or Angular | React's component reusability and hook ecosystem simplify dynamic updates for Kanban and Dashboard widgets without full page reloads. |
| **Vite 5** | Frontend Build Tool | ESM-based fast Hot Module Replacement (HMR) and optimized Rollup production bundling. | Create React App (CRA) / Webpack | CRA is deprecated and slow; Vite offers sub-second cold starts and instantaneous HMR development speed. |
| **Tailwind CSS** | Styling System | Utility-first CSS framework allowing rapid layout building with dark-theme consistency. | Vanilla CSS / Bootstrap | Eliminates CSS specificity issues and standardizes design tokens (`bg-[#0B0F17]`, `#111622`, `#2E5AF0`). |
| **Framer Motion** | UI Animation Engine | Declarative layout animations for modal popups, tab switching, and Kanban card transitions. | CSS Keyframes / React-Spring | Simple API (`<motion.div>`) for layout transitions and smooth mount/unmount animations (`AnimatePresence`). |
| **Lucide React** | Icon Library | Lightweight vector SVG icon components used throughout navigation and cards. | FontAwesome / Material Icons | Tree-shakeable SVG icons resulting in significantly smaller bundle sizes. |
| **Node.js** | Backend Runtime | Asynchronous, event-driven JavaScript runtime executing server-side logic. | Python (Django/FastAPI) or Java | Single language across full stack (JavaScript/Node), high I/O performance for concurrent API and WebSocket requests. |
| **Express 4** | Web Framework | Minimalist routing framework handling HTTP endpoints, request parsing, and middleware. | NestJS / Koa | Lightweight, robust middleware chaining (`authenticateUser`, `authorizeStudent`), minimal boilerplate. |
| **MongoDB** | Primary Database | Flexible NoSQL document database storing users, drives, applications, and logs. | PostgreSQL / MySQL | Document model naturally fits nested schemas (resume JSON, application timelines, ATS analysis subdocuments). |
| **Mongoose 8** | ODM Library | Schema validation, type casting, middleware hooks, and model methods for MongoDB. | Native MongoDB Driver | Enforces strict backend validation schemas (`enum`, `required`), automatic timestamps, and Population (`ref`). |
| **JWT (jsonwebtoken)** | Authentication | Stateless session authentication token signed with server secret (`JWT_SECRET`). | Session-in-Memory / Redis Sessions | Stateless authentication allows effortless server scaling without database session lookups on every route request. |
| **Cookie-Parser** | Security Middleware | Parses HTTP cookies to retrieve `token` securely stored as `HttpOnly`. | LocalStorage | Storing tokens in `HttpOnly` cookies prevents Cross-Site Scripting (XSS) token theft. |
| **Google OAuth 2.0** | SSO Auth Provider | Enterprise single sign-on enabling students/admins to log in via Google credentials. | Passport.js | Native `google-auth-library` provides direct ID token verification without Passport overhead. |
| **Socket.IO 4** | WebSockets Engine | Full-duplex real-time communication for live notifications and Kanban updates. | Polling / SSE | Bidirectional real-time event emission (`join_rooms`, `application_updated`) with automatic HTTP long-polling fallback. |
| **Multer 2** | File Upload Stream | Buffer-based multipart/form-data middleware handling PDF resume uploads. | Formidable | Native Express middleware for memory buffer processing without writing temporary files to disk. |
| **PDF-Parse 2** | Document Extraction | Converts uploaded PDF resume binary buffers into raw text strings for LLM inspection. | PDF.js | Fast Node.js server-side text extractor requiring zero browser DOM dependencies. |
| **@google/genai** | AI Intelligence | Official Google SDK invoking Gemini LLM models for ATS resume-to-job matching. | OpenAI API | Gemini 2.5 Flash offers superior speed, large context windows, and structural JSON parsing. |
| **Node-Cron 4** | Scheduled Jobs | Background cron scheduler for periodic Gmail application sync and deadline audits. | BullMQ / Redis | Simple in-process background task runner requiring no extra Redis infrastructure setup. |

---

## PART 3 — SYSTEM ARCHITECTURE

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT BROWSER (React 18)                               │
│  [ Student Dashboard ]   [ Application Kanban ]   [ Analytics ]   [ Placement Drives ]   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTP API Requests (Axios / Cookie)
                                            │ WebSockets (Socket.IO Client)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              EXPRESS 4 BACKEND ROUTER                                  │
│   /api/auth    │    /api/student    │    /api/placement    │    /api/ai    │  /api/email │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Middleware Chain:
                                            │ 1. cookieParser()
                                            │ 2. authenticateUser (JWT verify)
                                            │ 3. authorizeStudent / authorizePlacementCell / authorizeAdmin
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               CONTROLLER & SERVICE LAYER                               │
│   authController  │  studentController  │  placementController  │  aiController/Gemini  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Mongoose ODM Operations
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                MONGOOSE MODELS LAYER                                   │
│   User  │  Profile  │  JobDrive  │  Company  │  Application  │  Notification  │ Logs    │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ MongoDB Driver Wire Protocol
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              MONGODB DOCUMENT DATABASE                                 │
│   Collections: users, profiles, jobdrives, companies, applications, notifications...   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### File-to-Layer Architectural Responsibility Mapping
1. **Frontend Entry Point**: `frontend/src/main.jsx` → mounts `<App />` with `BrowserRouter`, `AuthProvider`, and `SocketProvider`.
2. **Frontend Router**: `frontend/src/App.jsx` → handles `/login`, `/register`, `/student/dashboard`, `/placement/dashboard`, `/admin/dashboard`, `/admin/login`.
3. **Frontend API Layer**: `frontend/src/services/api.js` → Axios instance configured with `withCredentials: true` and baseURL `/api`.
4. **Backend Entry Point**: `backend/src/server.js` → initializes HTTP server, connects MongoDB (`connectDB()`), starts Socket.IO engine, and attaches listener port `5001`.
5. **Express App Setup**: `backend/src/app.js` → mounts `cors()`, `express.json()`, `cookieParser()`, `express-rate-limit`, and API routes under `/api/`.
6. **Authentication Middleware**: `backend/src/middleware/authMiddleware.js` → `authenticateUser`, `authorizeStudent`, `authorizePlacementCell`, `authorizeAdmin`.
7. **Database Connection**: `backend/src/config/db.js` → connects to `process.env.MONGO_URI` via `mongoose.connect()`.

---

## PART 4 — PROJECT FOLDER STRUCTURE

```
Placement Hub/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB Connection setup via Mongoose
│   │   ├── controllers/
│   │   │   ├── aiController.js        # Gemini AI ATS Resume scoring & analysis controller
│   │   │   ├── authController.js      # Register, Login, Google OAuth 2.0, Logout, Me handlers
│   │   │   ├── emailController.js     # Gmail OAuth connection, sync, and status endpoints
│   │   │   ├── notificationController.js # Student & Officer notification CRUD
│   │   │   ├── placementController.js # Drives, Applications, Company management for Officer/Admin
│   │   │   └── studentController.js   # Student Profile, Education, Projects, Skills, Applications, Analytics
│   │   ├── jobs/
│   │   │   └── gmailSyncJob.js        # Cron background worker executing periodic email sync
│   │   ├── middleware/
│   │   │   ├── aiRateLimiter.js       # Express rate limiter guarding AI endpoints
│   │   │   ├── authMiddleware.js     # JWT extraction, user validation & RBAC authorization
│   │   │   ├── errorMiddleware.js    # Global Express error handling middleware
│   │   │   └── uploadMiddleware.js   # Multer memory storage configuration for PDF uploads
│   │   ├── models/
│   │   │   ├── ActivityLog.js        # System audit trail logs schema
│   │   │   ├── Application.js        # Single Source of Truth for Student Applications & Timeline
│   │   │   ├── Company.js            # Shared MongoDB collection for Recruiting Companies
│   │   │   ├── JobDrive.js           # Placement Drives schema with eligibility criteria
│   │   │   ├── Notification.js       # Real-time and persistent notification logs schema
│   │   │   ├── Profile.js            # Comprehensive student portfolio & academic metadata
│   │   │   └── User.js               # Central User authentication schema (Student/Placement/Admin)
│   │   ├── routes/                   # Router definitions forwarding endpoints to Controllers
│   │   ├── services/
│   │   │   ├── geminiService.js      # @google/genai integration executing ATS prompt evaluations
│   │   │   ├── gmailSyncService.js   # Google OAuth Gmail API parser for automated application status updates
│   │   │   ├── heuristicAtsService.js# Rule-based fallback ATS parser when AI key is absent
│   │   │   └── notificationService.js# Helper forwarding database notifications to Socket.IO channels
│   │   ├── utils/
│   │   │   ├── generateToken.js      # Creates JWT & signs HttpOnly security cookie
│   │   │   └── seed.js               # Database seeding script for development testing
│   │   ├── app.js                    # Express application instantiation & middleware registration
│   │   └── server.js                 # HTTP Server bootstrapping & Socket.IO server initialization
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── admin/                # Super Admin Management portals (Companies, Users, Settings)
    │   │   ├── placement/            # Placement Cell portals (Drive Creation, Candidate Screening)
    │   │   ├── student/
    │   │   │   ├── ApplicationKanban.jsx # 6-stage drag-and-drop interactive application board
    │   │   │   ├── StudentAnalytics.jsx  # Dynamic recruitment analytics & conversion metrics
    │   │   │   └── Modals.jsx            # Application creation and detail view modals
    │   │   ├── Navbar.jsx            # Top application header featuring geometric PH logo mark
    │   │   └── Sidebar.jsx           # Role-based sidebar navigation
    │   ├── context/
    │   │   ├── AuthContext.jsx       # Global Auth state management (User, Login, Google Auth, Logout)
    │   │   └── SocketContext.jsx     # Global Socket.IO client instance & live notification counts
    │   ├── layouts/                  # Student, Placement, and Admin Layout wrapper components
    │   ├── pages/                    # Main route view containers (StudentDashboard, AdminLoginPage, etc.)
    │   ├── services/                 # Axios HTTP client service abstractions (`studentApi.js`, etc.)
    │   ├── App.jsx                   # React Router route registry & protected route guards
    │   └── main.jsx                  # Client entry point mounting React root DOM
    ├── package.json
    └── vite.config.js
```

---

## PART 5 — AUTHENTICATION DEEP DIVE

### Complete Authentication Execution Sequence
1. **User Request**: User opens `/login` or `/admin/login` and submits Credentials or clicks "Sign in with Google".
2. **Local Auth Flow**:
   - `LoginPage.jsx` calls `loginUser(credentials)` in `authApi.js`.
   - POST request dispatched to `/api/auth/login`.
   - Backend `authController.js` handles request: finds user via `User.findOne({ email }).select('+password')`.
   - Executes `user.matchPassword(password)` using `bcrypt.compare`.
   - On match, invokes `sendTokenResponse(user, 200, res)`.
3. **Google OAuth 2.0 Flow**:
   - Client initializes `@react-oauth/google` `<GoogleLogin />`.
   - Upon authorization, Google returns a JWT Credential string to the client.
   - Client sends token to `/api/auth/google`.
   - Backend verifies ID token via `google-auth-library`:
     ```js
     const ticket = await client.verifyIdToken({
       idToken: token,
       audience: process.env.GOOGLE_CLIENT_ID,
     });
     ```
   - Checks if user exists by email; if not, creates new `User` with `authProvider: 'google'`.
   - Invokes `sendTokenResponse(user, 200, res)`.
4. **Token Generation & Cookie Signing**:
   - `generateToken.js` signs JWT containing payload `{ id: user._id }` with `process.env.JWT_SECRET` expiring in `30d`.
   - Cookie attached to HTTP response:
     ```js
     res.cookie('token', token, {
       expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'lax',
     });
     ```
5. **Subsequent Protected Requests**:
   - Client makes requests with `withCredentials: true`. Browser automatically attaches `token` cookie.
   - Backend `authenticateUser` middleware reads `req.cookies.token` (or `Authorization: Bearer <token>`), verifies signature via `jwt.verify()`, fetches user from MongoDB (`User.findById(decoded.id).select('-password')`), and attaches user object to `req.user`.

---

## PART 6 — USER ROLES & PERMISSION MATRIX

PlacementHub implements strict Role-Based Access Control (RBAC) across Express endpoints and React frontend routes.

| Capability / Feature | Student (`student`) | Placement Officer (`placement`) | Super Admin (`admin`/`superadmin`) |
| :--- | :---: | :---: | :---: |
| **Login / Google SSO** | ✅ | ✅ | ✅ |
| **View Job Drives** | ✅ (Eligible Drives) | ✅ (All Drives) | ✅ (All Drives) |
| **Apply to Job Drive** | ✅ | ❌ | ❌ |
| **Manage Application Kanban** | ✅ (Own Applications) | ✅ (Candidate Screening) | ✅ (Full System View) |
| **Update Application Stage** | ❌ (View Only) | ✅ (Stage Transition) | ✅ (Stage Transition) |
| **Create / Edit Job Drive** | ❌ | ✅ | ✅ |
| **Manage Company Collection** | ❌ | ❌ (Read Only) | ✅ (Create, Edit, Delete) |
| **View System Audit Logs** | ❌ | ✅ (Cell Audit) | ✅ (System Audit) |
| **Trigger AI Resume ATS Scoring**| ✅ (Own Resume) | ✅ (Candidate Screening) | ✅ (Full Access) |

### RBAC Enforcement in Middleware
```js
// backend/src/middleware/authMiddleware.js
const authorizeStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') return next();
  return res.status(403).json({ success: false, message: 'Access restricted to Students.' });
};

const authorizeAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) return next();
  return res.status(403).json({ success: false, message: 'Access restricted to Super Admin.' });
};
```

---

## PART 7 — APPLICATION KANBAN DATA FLOW & IMPLEMENTATION

The Application Kanban (`frontend/src/components/student/ApplicationKanban.jsx`) provides a visual 6-stage pipeline:
1. `Applied`
2. `Resume Shortlisted`
3. `OA` (Online Assessment)
4. `Interview`
5. `Offer Released`
6. `Rejected`

```
 [ User Drag / Stage Action ] 
              │
              ▼
  React Handler: updateApplicationStage(id, newStage)
              │
              ▼
  HTTP PUT /api/placement/applications/:id/stage
              │
              ▼
  Express Router & Middleware: authenticateUser + authorizePlacementCell
              │
              ▼
  Controller: placementController.updateApplicationStage()
              │
              ▼
  MongoDB: Application.findByIdAndUpdate(id, { stage: newStage, $push: { timeline } })
              │
              ▼
  Socket.IO Server: io.emit('application_updated', { applicationId, newStage })
              │
              ▼
  React Socket Listener: SocketContext receives event → triggers fetchFreshApps()
              │
              ▼
  Kanban & Analytics React State Updates UI across all active client screens
```

---

## PART 8 — ANALYTICS ENGINE & SOURCE OF TRUTH ARCHITECTURE

PlacementHub uses a **Single Source of Truth** architecture for analytics. The Analytics dashboard (`StudentAnalytics.jsx`) does NOT use hardcoded values or a separate analytics collection. It dynamically computes metrics from real student application records fetched via `getApplications()`.

### Live Analytics Calculation Logic
1. **Cumulative Applications**: Total array length `applications.length`.
2. **Status Breakdown**: Computed by counting matching stage records:
   ```js
   const breakdown = [
     { label: 'Applied', count: stageCounts.Applied, color: '#2E5AF0' },
     { label: 'Shortlisted', count: stageCounts.Shortlisted, color: '#8B5CF6' },
     { label: 'Online Assessment (OA)', count: stageCounts.OA, color: '#06B6D4' },
     { label: 'Interview', count: stageCounts.Interview, color: '#F59E0B' },
     { label: 'Offer Received', count: stageCounts.Offer, color: '#10B981' },
     { label: 'Rejected', count: stageCounts.Rejected, color: '#EF4444' },
   ];
   ```
3. **Funnel Conversions**: Derived dynamically from stage progression hierarchy:
   - App → OA Conversion = Math.round(N_reachedOA / N_total * 100)%
   - OA → Interview Conversion = Math.round(N_reachedInterview / N_reachedOA * 100)%
   - Interview → Offer Conversion = Math.round(N_reachedOffer / N_reachedInterview * 100)%
4. **Applications Per Month**: Grouped dynamically by parsing `appliedDate` or `createdAt` timestamps into monthly buckets (March → August).

---

## PART 9 — STUDENT DASHBOARD COMPONENTS BREAKDOWN

| Component / Widget | Data Source | Real-Time Sync? | Description |
| :--- | :--- | :---: | :--- |
| **Welcome Context Card** | `AuthContext` + `Profile` API | ❌ | Displays user name, roll number, verification badge, and profile completion %. |
| **Campus Recruitment Progress** | Dynamic Calculation from Applications | ✅ (Socket.IO) | Compact horizontal step nodes + SVG flow line graph for stages. |
| **Application Status Donut** | Dynamic Calculation from Applications | ✅ (Socket.IO) | SVG ring chart and 6-stage legend breakdown (`42 Total` / Live total). |
| **Recent Applications** | `getApplications()` API | ✅ (Socket.IO) | 5 most recent submission rows showing company, role, package, and status pill. |
| **Upcoming Deadlines** | `getApplications()` + `JobDrive` API | ❌ | Urgency progress meters and time-left badges for active drives. |
| **Placement Calendar** | Dynamic Application Event Map | ❌ | 31-day month grid with dot indicators for Drives, OAs, Interviews, Deadlines. |

---

## PART 10 — PLACEMENT READINESS INDEX (PRI)

The Placement Readiness Index (PRI) measures a student's preparedness for upcoming recruitment drives based on academic and portfolio completeness.

### Algorithmic Formula & Weightage
PRI Score = W_cgpa + W_resume + W_skills + W_projects + W_verification

- **CGPA Score (W_cgpa)**: Max 30 Points → (CGPA / 10) * 30 (Deduction of 5 points per active backlog).
- **Resume Score (W_resume)**: Max 25 Points → 25 points if verified PDF resume uploaded; 0 if missing.
- **Skills Portfolio (W_skills)**: Max 20 Points → 5 points per verified skill (Capped at 20 points).
- **Projects Showcase (W_projects)**: Max 15 Points → 7.5 points per project repository added (Capped at 15 points).
- **Phone Verification (W_verification)**: Max 10 Points → 10 points if `phoneVerified === true`.

---

## PART 11 — PROFILE, RESUME VAULT, SKILLS & PROJECTS

1. **Student Profile**: Managed in `Profile.js`. Stores registration/roll number, branch, department, CGPA, backlogs, semester, date of birth, phone verification status, and coding handles (LeetCode, GitHub, LinkedIn).
2. **Resume Vault**: Handled by Multer buffer stream and stored in `Resume.js`. PDF resumes are parsed via `pdf-parse` into text buffers, evaluated against job drive requirements via `@google/genai` (Gemini 2.5 LLM), and scored across Technical Skills, Project Depth, and Structure.
3. **Skills & Projects CRUD**: Dedicated endpoints under `/api/student/skills` and `/api/student/projects`. Allows students to maintain interactive proficiency meters and GitHub showcase links.

---

## PART 12 — PLACEMENT DRIVES ARCHITECTURE

Placement Drives (`JobDrive.js`) represent recruiting events posted by the Placement Cell.

### Key Fields & Eligibility Validation
- **Drive Fields**: `companyName`, `companyLogo`, `roleTitle`, `jobDescription`, `packageLPA`, `location`, `driveDate`, `deadline`, `eligibility` (`minCGPA`, `maxBacklogs`, `allowedBranches`).
- **Eligibility Engine**: When a student attempts to apply (`POST /api/student/applications`), `studentController.js` validates student profile attributes against drive eligibility rules:
  ```js
  if (profile.cgpa < drive.eligibility.minCGPA) {
    return res.status(400).json({ message: 'Ineligible: Your CGPA is below the minimum requirement.' });
  }
  if (profile.backlogs > drive.eligibility.maxBacklogs) {
    return res.status(400).json({ message: 'Ineligible: Active backlogs exceed the permitted threshold.' });
  }
  ```

---

## PART 13 — NOTIFICATIONS SYSTEM

PlacementHub implements a dual-layer notification delivery architecture:
1. **Persistent Layer**: Mongoose model `Notification.js` stores target `user`, `role`, `title`, `message`, `type` (`Offer`, `Interview`, `Application`, `Warning`), `isRead`, and `actionUrl`.
2. **Real-Time Streaming Layer**: Socket.IO server emits instant push notifications to client room channels (`userId` room or `role` room).

```js
// backend/src/services/notificationService.js
const sendNotification = async ({ user, role, title, message, type, actionUrl }) => {
  const notif = await Notification.create({ user, role, title, message, type, actionUrl });
  if (user && io) {
    io.to(user.toString()).emit('notification_received', notif);
  } else if (role && io) {
    io.to(role).emit('role_notification_received', notif);
  }
  return notif;
};
```

---

## PART 14 — EMAIL & AUTOMATION

1. **Gmail OAuth Integration**: Implemented in `services/gmailSyncService.js`. Allows students to connect read-only Gmail access (`googleapis`) to automatically detect job application emails from external portals (Greenhouse, Lever, Workday).
2. **Automated Cron Sync Worker**: Configured in `jobs/gmailSyncJob.js` using `node-cron`. Runs background email sync tasks periodically every 15 minutes (`*/15 * * * *`).
3. **Nodemailer System Mailer**: Utility in `utils/sendEmail.js` handling system emails (welcome notifications, password resets).

---

## PART 15 — EXTERNAL PLATFORM INTEGRATION LIMITATIONS

### Why Direct LinkedIn / Indeed / Naukri Automated Sync Cannot Be Built via Standard APIs
During technical interviews, candidates are often asked: *"Why didn't you build direct automated API sync for a student's private LinkedIn or Naukri application history?"*

### Technical Defense Explanation
1. **Private OAuth Scopes & Zero Public Endpoints**: Public API platforms like LinkedIn, Indeed, and Naukri do **not** provide public REST API endpoints to read a user's private "Jobs Applied" history due to strict user privacy policies (GDPR/CCPA) and proprietary candidate data protection.
2. **Anti-Scraping & Bot Defenses**: Automated web scraping of these portals violates their Terms of Service and triggers IP rate-limiting, Cloudflare bot protection, and CAPTCHA challenges.
3. **PlacementHub's Engineering Solution**: PlacementHub implements **Gmail Application Email Tracking** (`gmailSyncService.js`). Since external portals always send application confirmation emails to the student's inbox, PlacementHub reads confirmation emails securely via Google OAuth 2.0 and parses them using heuristic NLP and AI classifiers.

---

## PART 16 — COMPLETE API DOCUMENTATION TABLE

| Method | Endpoint | Auth Required | Authorized Roles | Purpose |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/auth/register` | ❌ | Public | Register new Student account |
| `POST` | `/api/auth/login` | ❌ | Public | Login with Email & Password (returns HttpOnly JWT) |
| `POST` | `/api/auth/google` | ❌ | Public | Authenticate / Register via Google OAuth 2.0 |
| `POST` | `/api/auth/logout` | ✅ | All Roles | Clear HttpOnly JWT cookie |
| `GET` | `/api/auth/me` | ✅ | All Roles | Fetch current authenticated user session |
| `GET` | `/api/student/profile` | ✅ | Student | Retrieve student academic profile & verification data |
| `PUT` | `/api/student/profile` | ✅ | Student | Update student profile details & CGPA |
| `POST` | `/api/student/send-phone-otp` | ✅ | Student | Dispatch 6-digit phone OTP verification code |
| `POST` | `/api/student/verify-phone-otp` | ✅ | Student | Verify 6-digit phone OTP code |
| `GET` | `/api/student/applications` | ✅ | Student | Fetch all student application records for Kanban & Analytics |
| `POST` | `/api/student/applications` | ✅ | Student | Submit application to active Placement Drive |
| `DELETE`| `/api/student/applications/:id`| ✅ | Student | Delete student application record |
| `GET` | `/api/student/analytics` | ✅ | Student | Fetch aggregated student placement analytics |
| `POST` | `/api/student/resume` | ✅ | Student | Upload PDF resume buffer (Multer) |
| `GET` | `/api/placement/drives` | ✅ | Officer/Admin | Fetch all placement job drives |
| `POST` | `/api/placement/drives` | ✅ | Officer/Admin | Create new campus placement drive |
| `PUT` | `/api/placement/applications/:id/stage` | ✅ | Officer/Admin | Update candidate application stage in Kanban |
| `GET` | `/api/placement/companies` | ✅ | All Roles | Fetch single shared Company collection |
| `POST` | `/api/placement/companies` | ✅ | Admin | Create new Company entry (Super Admin owner) |
| `DELETE`| `/api/placement/companies/:id`| ✅ | Admin | Permanently delete Company from MongoDB |
| `POST` | `/api/ai/analyze-resume` | ✅ | All Roles | Trigger Gemini AI LLM ATS resume parsing & scoring |

---

## PART 17 — DATABASE DESIGN & SCHEMAS

```
┌─────────────────┐         1:1         ┌─────────────────┐
│     User        ├────────────────────►│    Profile      │
│ (Auth & Role)   │                     │ (Academic/CGPA) │
└────────┬────────┘                     └─────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐         N:1         ┌─────────────────┐
│   Application   ├────────────────────►│    JobDrive     │
│(Kanban & Stage) │                     │ (Drive Details) │
└─────────────────┘                     └────────┬────────┘
                                                 │
                                                 │ N:1
                                                 ▼
                                        ┌─────────────────┐
                                        │    Company      │
                                        │(Single Source)  │
                                        └─────────────────┘
```

### Mongoose Schema Definitions Summary
1. **User Schema (`User.js`)**: `name`, `email` (unique), `password` (select: false), `googleId` (sparse), `role` (`student`, `placement`, `admin`, `superadmin`), `authProvider` (`local`, `google`), `rollNumber`, `phone`, `phoneVerified`.
2. **Profile Schema (`Profile.js`)**: `user` (`ref: User`), `registrationNumber`, `department`, `cgpa`, `backlogs`, `semester`, `dob`, `skills`, `codingHandles`.
3. **Company Schema (`Company.js`)**: Shared collection owned by Super Admin. Fields: `name` (unique), `logoUrl`, `website`, `industry`, `tier`, `isActive`.
4. **JobDrive Schema (`JobDrive.js`)**: `company` (`ref: Company`), `companyName`, `roleTitle`, `packageLPA`, `location`, `eligibility` (`minCGPA`, `maxBacklogs`, `allowedBranches`), `deadline`.
5. **Application Schema (`Application.js`)**: `user` (`ref: User`), `jobDrive` (`ref: JobDrive`), `companyName`, `roleTitle`, `packageLPA`, `appliedDate`, `stage` (`Applied`, `Resume Shortlisted`, `OA`, `Interview`, `Offer Released`, `Rejected`), `timeline` array, `atsAnalysis` subdocument.

---

## PART 18 — SECURITY AUDIT

### Implemented Security Controls
- ✅ **HttpOnly Cookies**: JWT tokens are stored in `HttpOnly` cookies to prevent XSS script access.
- ✅ **Bcrypt Password Hashing**: Passwords salted and hashed with `bcryptjs` (10 rounds).
- ✅ **RBAC Guards**: Server-side middleware (`authorizeStudent`, `authorizeAdmin`) enforcing role permissions.
- ✅ **Rate Limiting**: `express-rate-limit` guarding AI and Auth endpoints against Brute-Force/DDoS.
- ✅ **CORS Configuration**: Configured with explicit `origin` and `credentials: true`.
- ✅ **Google ID Token Verification**: Server verifies Google OAuth ID tokens via `google-auth-library`.

### Recommended Future Security Upgrades
- ⚠️ **CSRF Tokens**: Implement SameSite=Strict cookies or anti-CSRF double-submit tokens.
- ⚠️ **Input Sanitization**: Add `express-mongo-sanitize` to prevent NoSQL Injection attacks.

---

## PART 19 — ERROR HANDLING & RESILIENCE

PlacementHub implements a global centralized error handling pipeline:
1. **Express Global Error Middleware**: Defined in `backend/src/middleware/errorMiddleware.js`. Catches unhandled errors, formats stack trace in development, and returns standardized JSON response `{ success: false, message }`.
2. **Mongoose Duplicate Key Handler**: Intercepts E11000 duplicate email/company errors and returns friendly 400 status messages.
3. **AI Fallback Mechanism**: If `process.env.GEMINI_API_KEY` is missing or fails, `aiController.js` gracefully invokes `heuristicAtsService.js` to compute rule-based ATS keyword matching without throwing a server crash.

---

## PART 20 — PRODUCTION DEPLOYMENT ARCHITECTURE

- **Frontend Deployment**: Deployed on Vercel / Netlify static hosting with single-page rewrite rules (`_redirects` or `vercel.json`).
- **Backend Deployment**: Deployed on Node.js container environments (Render / Railway / AWS EC2) listening on PORT 5001.
- **Database Deployment**: Hosted on MongoDB Atlas cloud cluster with TLS/SSL encryption and IP whitelist.
- **Environment Variables**: Managed via server environment keys (`MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GEMINI_API_KEY`).

---

## PART 21 — MAJOR TECHNICAL DESIGN DECISIONS

1. **Why Vite instead of Create React App?**
   Create React App is unmaintained and relies on slow Webpack bundling. Vite uses native browser ES modules during development for sub-second HMR and Rollup for fast production builds.
2. **Why MongoDB instead of SQL (MySQL/PostgreSQL)?**
   PlacementHub deals with dynamic, evolving student portfolio schemas (JSON skills, nested resume ATS scores, application stage timelines). MongoDB's flexible BSON document model avoids complex multi-table JOIN SQL migrations.
3. **Why HttpOnly Cookies instead of LocalStorage for JWT?**
   Tokens stored in `localStorage` can be read by malicious third-party scripts via XSS. `HttpOnly` cookies are inaccessible to JavaScript, protecting user session integrity.
4. **Why Socket.IO instead of HTTP Polling?**
   HTTP polling wastes bandwidth and server resources. Socket.IO provides low-latency, bidirectional WebSocket events for instant Kanban stage transitions and live notification alerts.

---

## PART 22 — FEATURE IMPLEMENTATION MATRIX

| Feature | UI Exists? | Backend API Exists? | DB Schema Exists? | Fully Functional? |
| :--- | :---: | :---: | :---: | :---: |
| **Google OAuth 2.0 Single Sign-On** | ✅ | ✅ | ✅ | **100% Functional** |
| **Email/Password Registration & Login** | ✅ | ✅ | ✅ | **100% Functional** |
| **Application Kanban Board** | ✅ | ✅ | ✅ | **100% Functional** |
| **Placement Analytics Engine** | ✅ | ✅ | ✅ | **100% Functional** |
| **Shared Company Database (Single Source)** | ✅ | ✅ | ✅ | **100% Functional** |
| **Gemini AI ATS Resume Analyzer** | ✅ | ✅ | ✅ | **100% Functional** |
| **Phone OTP Verification** | ✅ | ✅ | ✅ | **100% Functional** |
| **Socket.IO Real-Time Notifications** | ✅ | ✅ | ✅ | **100% Functional** |
| **Gmail Automated Application Sync** | ✅ | ✅ | ✅ | **100% Functional** |
| **Placement Drives Creation & Filtering** | ✅ | ✅ | ✅ | **100% Functional** |
| **Direct LinkedIn API Auto-Fetch** | ❌ | ❌ | ❌ | *Not Feasible via Public API (See Part 15)* |

---

## PART 23 — COMPLETE REAL-WORLD END-TO-END DATA FLOWS

### Flow 1: Student Applies to a Placement Drive
`Student UI (PlacementDrives.jsx)` → Clicks "Apply Now" → `studentApi.applyToJob(driveId)` → POST `/api/student/applications` → `authMiddleware.authenticateUser` → `studentController.createApplication()` → Checks drive eligibility in `JobDrive` model → Creates document in `Application` collection → `notificationService.sendNotification()` → Socket.IO emits `application_created` → `ApplicationKanban.jsx` receives socket event → Updates UI in real-time.

### Flow 2: Officer Updates Candidate Stage in Kanban
`Officer UI (ApplicationKanban.jsx)` → Drag-and-drops application card to "Interview" stage → `placementApi.updateApplicationStage(appId, 'Interview')` → PUT `/api/placement/applications/:id/stage` → `authMiddleware.authorizePlacementCell` → `placementController.updateApplicationStage()` → Updates `Application` document stage & pushes timeline entry → Socket.IO emits `application_updated` → Student `StudentAnalytics.jsx` receives socket event → Recalculates status breakdown & funnel charts live.

---

## PART 24 — STACK JUSTIFICATION INTERVIEW Q&A

**Q: Why Node.js and Express for the backend?**  
*Answer*: Node.js provides an asynchronous, non-blocking I/O event loop ideal for handling high-concurrency real-time WebSocket connections and API traffic. Express simplifies route handler middleware chaining and error handling.

**Q: Why JWT instead of session-based authentication?**  
*Answer*: JWT is stateless and self-contained. The server doesn't need to perform database lookups to verify session state on every incoming request, simplifying horizontal scaling across multi-core server instances.

---

## PART 25 — VIVA PREPARATION (TOP QUESTIONS & ANSWERS)

### Level 1: Basic Project Questions
**Q: What is the main objective of PlacementHub?**  
*Answer*: To establish a Single Source of Truth platform for university recruitment, giving students real-time visibility into their application stages while enabling placement officers to automate candidate screening and job drive management.

### Level 2: Technical & Architectural Questions
**Q: How does PlacementHub handle real-time updates across browsers?**  
*Answer*: PlacementHub uses Socket.IO. When a placement officer updates an application stage in the database, the backend emits a WebSocket event (`application_updated`). Client browsers listening to this channel execute a background state update, reflecting changes instantly without manual page reloads.

**Q: How does the AI Resume ATS scoring work?**  
*Answer*: When a PDF resume is uploaded, Multer buffers the file in memory, and `pdf-parse` extracts the raw text. The text is passed alongside job description requirements to the Google Gemini 2.5 LLM (`@google/genai`). Gemini evaluates keyword alignment, structural quality, and project depth, returning a structured JSON ATS score object stored in MongoDB.

---

## PART 26 — 5-MINUTE STUDENT PRESENTATION SCRIPT

> "Hello everyone. My name is [Your Name], and today I am presenting **PlacementHub**, an enterprise campus recruitment management platform.
> 
> **The Problem**: In most universities, placement offices coordinate recruitment using spreadsheets, forms, and chat groups. Students have no live visibility into whether their application is in screening, online testing, or interview rounds. Furthermore, managing company data across disparate tools leads to duplicate and inconsistent records.
> 
> **The Solution**: PlacementHub solves this by providing a unified web platform powered by a Single Source of Truth architecture. 
> 
> **Key Features**:
> 1. **Visual Application Kanban**: A 6-stage drag-and-drop tracking pipeline where students can view their live progress.
> 2. **Dynamic Recruitment Analytics**: Live conversion charts and status distribution metrics derived directly from actual application records.
> 3. **AI ATS Resume Analyzer**: Powered by Google Gemini 2.5 LLM, which parses uploaded PDF resumes and scores match accuracy against job descriptions.
> 4. **Enterprise Authentication & Verification**: Dual auth via Google OAuth 2.0 and HttpOnly JWT cookies, alongside phone OTP verification.
> 
> **Tech Stack**: Built with React 18 and Vite on the frontend, Node.js and Express on the backend, and MongoDB with Mongoose ODM for data storage. Socket.IO powers real-time updates across user sessions.
> 
> Thank you! I am now open to your questions."

---

## PART 27 — 10-MINUTE TECHNICAL INTERVIEW SCRIPT

*(Covers architecture, middleware chains, MongoDB indexing, Socket.IO channels, JWT cookie security, and Gemini LLM prompt execution as detailed in Parts 3, 5, 7, 8, and 17 above.)*

---

## PART 28 — ENGINEERING CHALLENGES & SOLUTIONS

1. **Challenge**: Preventing UI layout congestion when displaying complex Kanban pipelines and Analytics charts.  
   *Solution*: Re-architected `StudentDashboard.jsx` and `StudentAnalytics.jsx` into an 8:4 two-column responsive CSS grid with `self-start` alignment, eliminating stretched card containers and blank vertical gaps.
2. **Challenge**: Ensuring Analytics updates in real-time when Kanban stages change.  
   *Solution*: Bound `StudentAnalytics.jsx` to the core `getApplications()` API and attached Socket.IO listeners (`application_updated`), establishing a single underlying data model across modules.

---

## PART 29 — HONEST TECHNICAL WEAKNESSES & REMEDIATION

1. **Current Weakness**: In-memory background cron execution (`node-cron`).  
   *Remediation Plan*: Migrate to Redis-backed message queues (`BullMQ`) for distributed multi-instance server deployments.
2. **Current Weakness**: Client-side chunk size warning in Vite (>500KB bundle).  
   *Remediation Plan*: Implement code-splitting using `React.lazy()` and dynamic `import()` statements for heavy route components.

---

## PART 30 — FUTURE ROADMAP

1. **Redis Caching Layer**: Cache active job drive listings and company collections to reduce MongoDB read IOPS.
2. **Automated WhatsApp Notification Gateway**: Integrate Twilio Business API for instant SMS/WhatsApp interview alerts.
3. **Advanced AI Mock Interview Evaluator**: Utilize Gemini multimodal audio/video APIs for virtual candidate interview practice.

---

## 🚫 THINGS I MUST NOT CLAIM IN MY VIVA

- ❌ **Do NOT claim direct public API integration with LinkedIn / Indeed / Naukri** for private user application histories. (Explain the Gmail OAuth confirmation parsing approach instead).
- ❌ **Do NOT claim that Analytics uses a separate database collection.** (Explain that Analytics is a dynamic calculated view of the single Application collection).

---

## 📌 TOP 30 THINGS I MUST MEMORIZE FOR VIVA

1. **Single Source of Truth**: The Company collection is owned by Super Admin and shared across all portals.
2. **JWT Storage**: Tokens are stored in **HttpOnly** cookies to prevent XSS script access.
3. **Socket.IO Events**: Client listens to `application_updated` and `application_created` events for real-time board sync.
4. **AI SDK**: Powered by `@google/genai` using the Gemini 2.5 Flash model with heuristic fallback.
5. **PDF Extractor**: `pdf-parse` extracts text buffers from Multer multipart form streams.
6. **Backend Port**: Default server listens on port `5001`.
7. **Database ODM**: Mongoose 8.
8. **Frontend Build Tool**: Vite 5 utilizing Rollup for bundling.
9. **Password Hashing**: `bcryptjs` with 10 salt rounds.
10. **Kanban Stages**: 6 stages (`Applied`, `Resume Shortlisted`, `OA`, `Interview`, `Offer Released`, `Rejected`).
11. **Phone Verification**: Enterprise 6-digit OTP verification.
12. **RBAC Roles**: `student`, `placement`, `admin`, `superadmin`.
13. **Cron Scheduler**: `node-cron` running 15-minute background sync jobs.
14. **Gmail Integration**: Google APIs (`googleapis`) reading application confirmation emails via OAuth 2.0.
15. **Dashboard Grid**: 12-column responsive layout (`grid-cols-12`).
16. **Placement Readiness Index Formula**: Weighted sum of CGPA (30), Resume (25), Skills (20), Projects (15), and Phone Verification (10).
17. **CORS Setting**: Configured with explicit `credentials: true`.
18. **Mongoose Models**: `User`, `Profile`, `Company`, `JobDrive`, `Application`, `Notification`, `ActivityLog`.
19. **Express Middleware Chain**: `cookieParser` → `authenticateUser` → `authorize<Role>` → Controller.
20. **Analytics Source**: Computed dynamically from `getApplications()`.
21. **Donut SVG Calculation**: Uses `strokeDasharray` and `strokeDashoffset` based on 2*pi*r.
22. **Google OAuth Library**: Server uses `google-auth-library` (`OAuth2Client.verifyIdToken`).
23. **Rate Limiting**: `express-rate-limit` guards AI and authentication endpoints.
24. **File Upload Limit**: Multer memory storage configured with buffer streaming.
25. **Client Routing**: `react-router-dom` v6 with protected layout wrappers.
26. **State Management**: React Context API (`AuthContext`, `SocketContext`).
27. **CSS Framework**: Tailwind CSS with custom color palette (`#0B0F17`, `#111622`, `#1E2E4A`, `#2E5AF0`).
28. **Motion Library**: `framer-motion` handling layout animations and `AnimatePresence`.
29. **Auditing**: `ActivityLog` model records administrative actions.
30. **Project Vision**: Enterprise campus recruitment management platform unifying Students, Placement Officers, and Admins.
