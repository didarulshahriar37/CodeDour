# CodeDour Backend Server ⚙️

The backend service for CodeDour is a high-performance Express.js RESTful API server connected to PostgreSQL (hosted on NeonDB), Firebase Authentication, and the Judge0 Remote Code Execution API. It handles problem management, interactive code judging, contest hosting, participant rating calculations, leaderboards, and user administration.

---

## 🛠️ Architecture & Core Services

- **Database**: PostgreSQL (NeonDB) managed via `pg` connection pool with support for materialized views and stored procedures.
- **Authentication & Security**: Firebase Admin SDK token validation & Database Role verification (`user` vs `admin`).
- **Code Execution Engine**: Judge0 API integration for compiling and executing C, C++, Java, and Python code against sample and hidden test cases.
- **Contest Engine**: Custom contest hosting, real-time leaderboard matview refresh, and Elo-style rating calculation procedure (`update_contest_ratings`).
- **Deployment**: Vercel Serverless Functions (`api/index.js` rewrite).

---

## 📁 Folder Structure

```
backend/
├── api/
│   └── index.js                 # Serverless entrypoint for Vercel deployment
├── src/
│   ├── config/
│   │   ├── db.js                # PostgreSQL Pool connection configuration
│   │   └── firebase.js          # Firebase Admin SDK initialization
│   ├── controllers/
│   │   ├── admin.controller.js   # User management, problem & contest admin actions
│   │   ├── achievement.controller.js # Badges & user achievements
│   │   ├── auth.controller.js    # User registration, login & profile sync
│   │   ├── contest.controller.js # Contest lifecycle, registration, & host problem management
│   │   ├── leaderboard.controller.js # Global & Contest standings querying
│   │   ├── problem.controller.js # Problem catalog CRUD & tag recommendations
│   │   ├── submission.controller.js # Code submission & Judge0 execution
│   │   ├── tag.controller.js     # Problem category tags CRUD
│   │   └── user.controller.js    # User profile, statistics & submission logs
│   ├── middleware/
│   │   ├── authMiddleware.js     # verifyToken, optionalVerifyToken & verifyAdmin guards
│   │   └── errorHandler.js       # Centralized Express error handler
│   ├── routes/
│   │   ├── achievement.routes.js # Achievement routes (/api/achievements)
│   │   ├── admin.routes.js       # Admin routes (/api/admin)
│   │   ├── auth.routes.js        # Authentication routes (/api/auth)
│   │   ├── contest.routes.js     # Contest routes (/api/contests)
│   │   ├── leaderboard.routes.js # Standings routes (/api/leaderboard)
│   │   ├── problem.routes.js     # Problem routes (/api/problems)
│   │   ├── submission.routes.js  # Code submission routes (/api/submissions)
│   │   ├── tag.routes.js         # Category tag routes (/api/tags)
│   │   └── user.routes.js        # User profile routes (/api/users)
│   ├── services/
│   │   ├── judge0.service.js     # Remote code execution via Judge0 API
│   │   └── submission.service.js # Test case execution & verdict mapping
│   └── app.js                   # Express application setup & middleware mounting
├── index.js                     # Local server startup entrypoint
├── package.json                 # Backend dependencies & start scripts
└── vercel.json                  # Vercel function routing rules
```

---

## 📡 Complete API Routes Reference

### Auth Routes (`/api/auth`)

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/register` | `POST` | Public | Register a new user and sync profile with PostgreSQL |
| `/api/auth/login` | `POST` | Public | Authenticate user credentials with Firebase & return user profile |
| `/api/auth/sync` | `POST` | Authenticated | Sync Firebase Google/Email login user to NeonDB |
| `/api/auth/me` | `GET` | Authenticated | Fetch current authenticated user profile and stats |

---

### User Routes (`/api/users`)

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/users/profile` | `GET` | Authenticated | Get currently signed-in user's profile |
| `/api/users/profile` | `PUT` | Authenticated | Update user's `display_name` and `avatar_url` |
| `/api/users/:id` | `GET` | Public | Get public profile of any user by ID |
| `/api/users/:id/stats` | `GET` | Public | Get user statistics via `get_user_statistics($1)` function |
| `/api/users/:id/submissions` | `GET` | Public | Get user's submission history with pagination |

---

### Problem Routes (`/api/problems`)

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/problems` | `GET` | Public (Optional Token) | List problems with search, difficulty, tag filters, & pagination |
| `/api/problems/:id` | `GET` | Public | Get problem statement, time/memory limits, constraints & sample test cases |
| `/api/problems/:id/recommendations` | `GET` | Public | Get tag-matched problem recommendations |
| `/api/problems` | `POST` | Authenticated | Create a new problem with tags, time/memory limits & test cases |
| `/api/problems/:id/submissions` | `GET` | Authenticated | Get user's submissions for a specific problem |

---

### Submission Routes (`/api/submissions`)

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/submissions` | `POST` | Authenticated | Submit code for Judge0 execution & record verdict in database |
| `/api/submissions` | `GET` | Authenticated | List user's submissions with status & language filters |
| `/api/submissions/:id` | `GET` | Public | Get detailed verdict & execution metrics for a specific submission |

---

### Contest Routes (`/api/contests`)

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/contests` | `GET` | Public | List all contests with calculated status (`upcoming`, `running`, `ended`) |
| `/api/contests/:id` | `GET` | Public | Get contest details, duration, & assigned problem list |
| `/api/contests` | `POST` | Authenticated | Host a new custom contest with title, description, time window, & problems |
| `/api/contests/:id/join` | `POST` | Authenticated | Register current user for a contest |
| `/api/contests/:id/problems` | `POST` | Host / Admin | Add or update problems in the contest problem set |
| `/api/contests/:id/recalculate-ratings` | `POST` | Host / Admin | Calculate participant rating changes & refresh leaderboard matview |

---

### Leaderboard Routes (`/api/leaderboard`)

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/leaderboard` | `GET` | Public | Get global platform standings from `user_stats_view` |
| `/api/leaderboard/:id` | `GET` | Public | Get contest-specific standings from `contest_leaderboard_matview` |

---

### Tag & Achievement Routes (`/api/tags` & `/api/achievements`)

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/tags` | `GET` | Public | Fetch all problem category tags |
| `/api/tags` | `POST` | Admin | Create a new category tag |
| `/api/achievements` | `GET` | Public | List all platform achievements |
| `/api/achievements/:id` | `GET` | Public | Get earned achievements for a user |

---

### Admin Routes (`/api/admin`)

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/admin/users` | `GET` | Admin | List all registered platform users |
| `/api/admin/users/:id/role` | `PUT` | Admin | Change user role (`user` ↔ `admin`) |
| `/api/admin/users/:id` | `DELETE` | Admin | Delete a user account |
| `/api/admin/problems/:id` | `PUT` | Admin | Edit problem statement, limits, tags, & test cases |
| `/api/admin/problems/:id` | `DELETE` | Admin | Permanently delete a problem |
| `/api/admin/contests/:id` | `DELETE` | Admin | Delete a contest record |
| `/api/admin/refresh-views` | `POST` | Admin | Refresh `contest_leaderboard_matview` materialized view |

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the `backend/` root directory:

```env
PORT=5000
DATABASE_URL=postgresql://neondb_owner:your_password@ep-example.eastus2.azure.neon.tech/neondb?sslmode=require
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your_project_id",...}
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_judge0_key
```

---

## 📥 Installation & Running Guide

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Start production server
npm start
```
