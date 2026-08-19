# CodeDour - Competitive Programming & Online Judge Platform 🏆

**CodeDour** is a full-stack, production-grade Competitive Programming and Online Judge platform built with React 18, Node.js, Express, PostgreSQL (NeonDB), Firebase Authentication, and the Judge0 Remote Code Execution Engine. It empowers developers to solve algorithmic challenges, test custom code, participate in timed contests, track ratings and standings, and earn achievement badges.

---

## 🌟 Key Features & Capabilities

- **Problem Catalog & Smart Filtering**:
  - Filter problems by difficulty (`Easy`, `Medium`, `Hard`), category tags (`Strings`, `Arrays`, `Pointers`, `Math`, `Basic C`), search keywords, and acceptance rate.
  - Smart **tag-based recommendation engine** generating relevant problem recommendations on page load and post-submission verdict.

- **Interactive Code Editor & Judge0 Execution**:
  - Code editor supporting C, C++, Java, and Python.
  - Multi-testcase evaluation against standard input (`stdin`) and expected output (`expected_output`).
  - Real-time execution metrics: execution time (s), memory usage (MB), compiler errors, and stack trace outputs.

- **Contests & Participant Standings**:
  - Custom contest hosting: Any signed-in user can create and host private or public contests.
  - Host problem management: Contest creators can assign problems with custom point values and problem order (`A`, `B`, `C`, ...).
  - Real-time leaderboard standings derived from PostgreSQL materialized view `contest_leaderboard_matview`.
  - Automated Elo-style rating updates via `update_contest_ratings` stored PL/pgSQL function.

- **Admin Control Dashboard**:
  - Full-screen dashboard with a fixed, non-scrollable sidebar layout.
  - User management: View users, update roles (`user` ↔ `admin`), and delete accounts.
  - Problem management: Create, edit, and delete problems. Set custom Time Limits, Memory Limits, category tags, and sample vs hidden judge test cases.
  - Materialized view refresh controls.

---

## 📁 System Architecture & Directory Structure

```
CodeDour/
├── frontend/                  # React 18 + Vite + Tailwind CSS Client
│   ├── src/
│   │   ├── components/        # Common UI, Navbar, Code Editor, Modals
│   │   ├── context/           # React Auth & Theme Contexts
│   │   ├── firebase/          # Firebase client SDK configuration
│   │   ├── layouts/           # Main Layout & Admin Layout wrappers
│   │   ├── pages/             # Home, Problems, ProblemDetail, Contests, ContestDetail, Leaderboard, AdminDashboard, Profile
│   │   └── services/          # Axios API service handlers (adminService, contestService, problemService, userService)
│   ├── package.json
│   └── vite.config.js
│
├── backend/                   # Node.js + Express REST API Server
│   ├── src/
│   │   ├── config/            # PostgreSQL Pool & Firebase Admin SDK setups
│   │   ├── controllers/       # Business logic (admin, auth, contest, leaderboard, problem, submission, tag, user)
│   │   ├── middleware/        # verifyToken, optionalVerifyToken & verifyAdmin guards
│   │   ├── routes/            # API endpoints mapping (/api/*)
│   │   ├── services/          # Judge0 Code Execution API integration
│   │   └── app.js             # Express application setup
│   ├── index.js               # Local server startup entrypoint
│   └── package.json
│
├── database/                  # PostgreSQL Database Schema & Utilities
│   ├── schema/                # Tables (14 entities), constraints, & indexes
│   ├── functions/             # update_contest_ratings, get_user_statistics, recommended_problems, generate_leaderboard
│   ├── procedures/            # process_submission transaction procedure
│   ├── triggers/              # update_solved_count & award_achievements triggers
│   ├── views/                 # user_stats_view & contest_leaderboard_matview
│   ├── seed/                  # seed_users, seed_problems, & seed_contests scripts
│   └── scripts/               # migrate.js & health_check.js automation scripts
│
└── README.md                  # Root project documentation
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
| :--- | :--- |
| **React 18** | UI component library |
| **Vite** | Lightning-fast build tool & dev server |
| **React Router v7** | Client-side page routing & route guards |
| **Tailwind CSS v4** | Modern utility-first styling & responsiveness |
| **Firebase JS SDK** | User authentication state management |
| **Axios** | Promised-based HTTP client |
| **Lucide React** | Icon system |

### Backend
| Technology | Purpose |
| :--- | :--- |
| **Node.js** | Server-side JavaScript runtime |
| **Express.js** | RESTful HTTP API framework |
| **pg (node-postgres)** | High-performance PostgreSQL client |
| **Firebase Admin SDK** | Server-side JWT authentication verification |
| **Judge0 API** | Remote code execution and compilation engine |

### Database
| Technology | Purpose |
| :--- | :--- |
| **PostgreSQL (NeonDB)** | Relational database engine |
| **PL/pgSQL** | Stored functions, procedures, & automated triggers |
| **Materialized Views** | Fast cached leaderboard queries (`contest_leaderboard_matview`) |

---

## 📥 Installation & Quick Start

### 1. Database Setup
```bash
# Set your NeonDB PostgreSQL connection string
export DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"

# Run migrations and seed data
node database/scripts/migrate.js
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
# Backend running on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend running on http://localhost:5173
```

---

## 🌐 Live Production Deployments
- **Frontend App**: [https://codedour-web.vercel.app](https://codedour-web.vercel.app)
- **Backend API**: [https://codedour-backend.vercel.app](https://codedour-backend.vercel.app)