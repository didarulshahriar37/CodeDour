# CodeDour Backend Server ⚙️

The backend service for CodeDour is an Express.js RESTful API server connected to PostgreSQL (hosted on NeonDB), Firebase Authentication, and Judge0 Remote Code Execution API.

---

## 🛠️ Architecture & Services

- **Database**: PostgreSQL (NeonDB) managed via `pg` connection pool.
- **Authentication**: Firebase Admin SDK token validation & Database Role verification (`user` vs `admin`).
- **Code Execution Engine**: Judge0 API integration for executing C, C++, Java, and Python code against standard test cases.
- **Deployment**: Vercel Serverless Functions (`api/index.js` rewrite).

---

## 📁 Folder Structure

```
backend/
├── api/
│   └── index.js           # Serverless entrypoint for Vercel deployment
├── src/
│   ├── config/
│   │   ├── db.js          # PostgreSQL Pool connection configuration
│   │   └── firebase.js    # Firebase Admin SDK initialization
│   ├── controllers/
│   │   ├── admin.controller.js   # User management & problem admin actions
│   │   ├── auth.controller.js    # User registration, login & token verify
│   │   ├── problem.controller.js # Problem CRUD & tag recommendations
│   │   ├── submission.controller.js # Code submission & Judge0 execution
│   │   └── tag.controller.js     # Tag management
│   ├── middleware/
│   │   └── authMiddleware.js     # verifyToken & verifyAdmin middleware
│   ├── routes/
│   │   ├── admin.routes.js       # Admin routes (/api/admin)
│   │   ├── auth.routes.js        # Auth routes (/api/auth)
│   │   ├── problem.routes.js     # Problem routes (/api/problems)
│   │   ├── submission.routes.js  # Submission routes (/api/submissions)
│   │   └── tag.routes.js         # Tag routes (/api/tags)
│   ├── services/
│   │   └── judge0.service.js     # Remote code evaluation via Judge0 API
│   └── app.js             # Express app setup, CORS, JSON parser & route definitions
├── index.js               # Local server startup entrypoint
├── package.json           # Backend dependencies & start scripts
└── vercel.json            # Vercel function routing rules
```

---

## 📡 API Routes Reference

### Auth Routes (`/api/auth`)

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/register` | `POST` | Public | Register a new user and sync profile with PostgreSQL |
| `/api/auth/login` | `POST` | Public | Authenticate user credentials with Firebase & return user profile |
| `/api/auth/me` | `GET` | Authenticated | Fetch current authenticated user profile and stats |

---

### Problem Routes (`/api/problems`)

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/problems` | `GET` | Public | List all public problems with pagination, difficulty & search filters |
| `/api/problems/:id` | `GET` | Public | Get problem statement, constraints, time/memory limits & sample test cases |
| `/api/problems/:id/recommendations` | `GET` | Public | Get tag-matched problem recommendations based on problem tags |
| `/api/problems` | `POST` | Admin | Create a new problem with tags and test cases |
| `/api/problems/:id/submissions` | `GET` | Authenticated | Get user's submission history for a specific problem |

---

### Submission Routes (`/api/submissions`)

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/submissions` | `POST` | Authenticated | Submit code for execution against Judge0 and record submission result |
| `/api/submissions` | `GET` | Public | Retrieve global or user submission logs with verdicts |
| `/api/submissions/:id` | `GET` | Public | Get detailed verdict breakdown for a specific submission |

---

### Tag Routes (`/api/tags`)

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/tags` | `GET` | Public | Fetch all available problem category tags (e.g. Strings, Arrays, Math) |
| `/api/tags` | `POST` | Admin | Add a new problem category tag |

---

### Admin Routes (`/api/admin`)

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/admin/users` | `GET` | Admin | List all registered platform users with roles and solve stats |
| `/api/admin/users/:id/role` | `PUT` | Admin | Update user role (`user` ↔ `admin`) |
| `/api/admin/users/:id` | `DELETE` | Admin | Permanently delete a user account |
| `/api/admin/problems/:id` | `PUT` | Admin | Update problem details, time/memory limits, tags & test cases |
| `/api/admin/problems/:id` | `DELETE` | Admin | Delete a problem along with related submissions, test cases & tags |

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

### Steps

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create `.env` using the template above with your NeonDB credentials, Firebase service account, and RapidAPI key.

4. **Start Local Development Server**:
   ```bash
   npm run dev
   ```
   The API server will listen on `http://localhost:5000`.

5. **Start Production Server**:
   ```bash
   npm start
   ```
