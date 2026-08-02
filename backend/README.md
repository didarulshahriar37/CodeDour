# CodeDour Backend

REST API server for the CodeDour competitive programming platform. Built with **Express.js**, **PostgreSQL (NeonDB)**, **Firebase Authentication**, and **Judge0 CE** for code execution.

---

## Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- A [NeonDB](https://neon.tech/) PostgreSQL database (or any PostgreSQL instance)
- A [Firebase](https://firebase.google.com/) project (for authentication)

### 1. Clone the repository

```bash
git clone https://github.com/didarulshahriar37/CodeDour.git
cd CodeDour/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
JUDGE0_API_URL=https://ce.judge0.com
```

### 4. Firebase Setup (for authentication)

1. Go to **Firebase Console** → **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key** and download the JSON file
3. Save it as `backend/src/config/serviceAccountKey.json`
4. Make sure `serviceAccountKey.json` is listed in `.gitignore`

### 5. Run the server

**Development** (with auto-restart):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

The server will start on `http://localhost:5000`

### 6. Verify

Open your browser and navigate to:
```
http://localhost:5000/health
```

You should receive:
```json
{ "status": "ok", "message": "CodeDour is running" }
```

---

## Project Structure

```
backend/
├── index.js                          # Entry point - starts the server
├── package.json                      # Dependencies & scripts
├── .env                              # Environment variables (not committed)
└── src/
    ├── app.js                        # Express app setup, middleware & route mounting
    ├── config/
    │   ├── db.js                     # PostgreSQL (NeonDB) connection pool
    │   └── firebase.js               # Firebase Admin SDK initialization
    ├── middleware/
    │   ├── authMiddleware.js          # Firebase JWT token verification
    │   └── errorHandler.js           # Global error handling middleware
    ├── controllers/
    │   ├── auth.controller.js         # User sync (Firebase → PostgreSQL)
    │   ├── user.controller.js         # User profiles & statistics
    │   ├── problem.controller.js      # Problem CRUD & listing
    │   ├── submission.controller.js   # Code submission & Judge0 integration
    │   ├── contest.controller.js      # Contest management (WIP)
    │   ├── leaderboard.controller.js  # Global & contest leaderboards
    │   ├── achievement.controller.js  # Achievement listing
    │   └── tag.controller.js          # Problem tags
    ├── routes/
    │   ├── auth.routes.js
    │   ├── user.routes.js
    │   ├── problem.routes.js
    │   ├── submission.routes.js
    │   ├── contest.routes.js
    │   ├── leaderboard.routes.js
    │   ├── achievement.routes.js
    │   └── tag.routes.js
    └── services/
        ├── judge0.service.js          # Judge0 CE API integration
        └── submission.service.js      # Test case processing & verdict mapping
```

---

## API Endpoints

### Health Check

| Method | Endpoint  | Auth | Description              |
|--------|-----------|------|--------------------------|
| GET    | `/health` | No   | Check if server is running |

---

### Authentication (`/api/auth`)

> **Status:** Requires Firebase service account setup

| Method | Endpoint         | Auth | Description                                              |
|--------|------------------|------|----------------------------------------------------------|
| POST   | `/api/auth/sync` | Yes  | Sync Firebase user to PostgreSQL (upsert on first login) |

**Request Headers:**
```
Authorization: Bearer <firebase_id_token>
```

---

### Users (`/api/users`)

| Method | Endpoint                     | Auth | Description                              |
|--------|------------------------------|------|------------------------------------------|
| GET    | `/api/users/profile`         | Yes  | Get logged-in user's own profile         |
| GET    | `/api/users/:id`             | No   | Get a user's public profile by ID        |
| GET    | `/api/users/:id/stats`       | No   | Get a user's statistics                  |
| GET    | `/api/users/:id/submissions` | No   | Get a user's submission history (paginated) |

**Query Parameters for `/api/users/:id/submissions`:**
| Parameter | Type   | Default | Description        |
|-----------|--------|---------|--------------------|
| page      | number | 1       | Page number        |
| limit     | number | 20      | Results per page   |

---

### Problems (`/api/problems`)

| Method | Endpoint            | Auth | Description                                    |
|--------|---------------------|------|------------------------------------------------|
| GET    | `/api/problems`     | No   | List all public problems (filterable, paginated) |
| GET    | `/api/problems/:id` | No   | Get problem details + sample test cases        |
| POST   | `/api/problems`     | No*  | Create a new problem with test cases & tags    |

> *Authentication will be added for problem creation (admin/setter only)

**Query Parameters for `GET /api/problems`:**
| Parameter  | Type   | Default | Description                          |
|------------|--------|---------|--------------------------------------|
| difficulty | string | —       | Filter by difficulty: Easy, Medium, Hard |
| search     | string | —       | Search by title or slug              |
| page       | number | 1       | Page number                          |
| limit      | number | 20      | Results per page                     |

**Request Body for `POST /api/problems`:**
```json
{
  "slug": "two-sum",
  "title": "Two Sum",
  "description": "Given an array of integers...",
  "input_format": "First line contains n and target...",
  "output_format": "Print the two indices...",
  "constraints": "2 <= n <= 10^4",
  "difficulty": "Easy",
  "time_limit": 1.0,
  "memory_limit": 256,
  "author_id": 1,
  "is_public": true,
  "tags": [1, 2],
  "test_cases": [
    {
      "input": "4 9\n2 7 11 15",
      "expected_output": "0 1",
      "is_sample": true,
      "explanation": "nums[0] + nums[1] = 2 + 7 = 9"
    }
  ]
}
```

---

### Submissions (`/api/submissions`)

| Method | Endpoint               | Auth | Description                                         |
|--------|------------------------|------|-----------------------------------------------------|
| POST   | `/api/submissions`     | No*  | Submit code for judging (sends to Judge0, stores result) |
| GET    | `/api/submissions/:id` | No   | Get submission details by ID                        |

> *Authentication will be added for submissions

**Request Body for `POST /api/submissions`:**
```json
{
  "problem_id": 1,
  "user_id": 1,
  "language": "Python",
  "language_id": 71,
  "code": "n, target = map(int, input().split())\nnums = list(map(int, input().split()))\nfor i in range(n):\n    for j in range(i+1, n):\n        if nums[i] + nums[j] == target:\n            print(i, j)\n            exit()",
  "contest_id": null
}
```

**Common Judge0 Language IDs:**
| Language   | ID |
|------------|----|
| Python 3   | 71 |
| C++ 17     | 54 |
| Java       | 62 |
| JavaScript | 63 |
| C          | 50 |

**Response:**
```json
{
  "message": "Submission processed",
  "submission_id": 1,
  "verdict": "Accepted",
  "execution_time": 0.015,
  "memory_used": 3200,
  "results": [
    {
      "input": "4 9\n2 7 11 15",
      "expected_output": "0 1",
      "actual_output": "0 1\n",
      "status": { "id": 3, "description": "Accepted" },
      "time": "0.015",
      "memory": 3200
    }
  ]
}
```

**Possible Verdicts:**
`Accepted`, `Wrong Answer`, `Time Limit Exceeded`, `Memory Limit Exceeded`, `Compilation Error`, `Runtime Error`

---

### Contests (`/api/contests`)

> **Status:** Work in progress

| Method | Endpoint                  | Auth | Description                         |
|--------|---------------------------|------|-------------------------------------|
| GET    | `/api/contests`           | No   | List all contests                   |
| GET    | `/api/contests/:id`       | No   | Get contest details & problems      |
| POST   | `/api/contests`           | Yes  | Create a new contest (admin only)   |
| POST   | `/api/contests/:id/join`  | Yes  | Register for a contest              |

---

### Leaderboard (`/api/leaderboard`)

| Method | Endpoint                       | Auth | Description                           |
|--------|--------------------------------|------|---------------------------------------|
| GET    | `/api/leaderboard`             | No   | Global leaderboard (ranked by rating) |
| GET    | `/api/leaderboard/contest/:id` | No   | Contest-specific leaderboard          |

**Query Parameters for `GET /api/leaderboard`:**
| Parameter | Type   | Default | Description                     |
|-----------|--------|---------|---------------------------------|
| search    | string | —       | Search by username/display name |
| page      | number | 1       | Page number                     |
| limit     | number | 20      | Results per page                |

---

### Achievements (`/api/achievements`)

| Method | Endpoint                     | Auth | Description                          |
|--------|------------------------------|------|--------------------------------------|
| GET    | `/api/achievements`          | No   | List all available achievements      |
| GET    | `/api/achievements/user/:id` | No   | Get achievements earned by a user    |

---

### Tags (`/api/tags`)

| Method | Endpoint     | Auth | Description            |
|--------|--------------|------|------------------------|
| GET    | `/api/tags`  | No   | List all problem tags  |

---

## Technologies Used

| Technology         | Version  | Purpose                         |
|--------------------|----------|---------------------------------|
| Node.js            | v22+     | JavaScript runtime              |
| Express.js         | v5.2.1   | Web framework & REST API        |
| pg (node-postgres) | v8.22.0  | PostgreSQL client               |
| Firebase Admin SDK | v14.1.0  | Server-side token verification  |
| Axios              | v1.18.0  | HTTP client (Judge0 API calls)  |
| dotenv             | v17.4.2  | Environment variable management |
| cors               | v2.8.6   | Cross-origin request handling   |
| nodemon            | v3.1.14  | Auto-restart during development |

## External Services

| Service                | Purpose                          |
|------------------------|----------------------------------|
| Judge0 CE (Public API) | Online code execution & judging  |
| Firebase Auth          | User identity & token management |
| NeonDB                 | Serverless PostgreSQL hosting    |
