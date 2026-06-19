## PROJECT OVERVIEW
**CodeDour** is a web-based competitive programming platform designed to provide a complete environment for problem solving, contest participation, and real-time code evaluation. Users can browse programming problems, submit solutions in multiple programming languages, participate in contests, and receive instant verdicts through an integrated online judging system.

## ROLE OF RELATIONAL DATABASE
**CodeDour** leverages PostgreSQL as its primary data management and processing engine, storing and managing problems, test cases, submissions, contests, rankings, achievements, and user-related data. By combining real-time code execution with a robust relational database architecture, **CodeDour** aims to deliver a scalable and efficient competitive programming experience while demonstrating the practical application of advanced database concepts in a real-world system.

## FOLDER STRUTURE
```
CodeDour/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── editor/
│   │   │   ├── leaderboard/
│   │   │   ├── problems/
│   │   │   ├── contests/
│   │   │   └── submissions/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Problems.jsx
│   │   │   ├── ProblemDetail.jsx
│   │   │   ├── Contests.jsx
│   │   │   ├── ContestDetail.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   └── Submissions.jsx
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── problemService.js
│   │   │   ├── submissionService.js
│   │   │   └── contestService.js
│   │   ├── firebase/
│   │   │   └── config.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── firebase.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── problem.routes.js
│   │   │   ├── submission.routes.js
│   │   │   ├── contest.routes.js
│   │   │   └── leaderboard.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── problem.controller.js
│   │   │   ├── submission.controller.js
│   │   │   ├── contest.controller.js
│   │   │   └── leaderboard.controller.js
│   │   ├── services/
│   │   │   ├── judge0.service.js
│   │   │   └── submission.service.js
│   │   └── app.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── database/
│   ├── schema/
│   │   ├── 01_tables.sql
│   │   ├── 02_indexes.sql
│   │   └── 03_constraints.sql
│   ├── views/
│   │   ├── problem_stats_view.sql
│   │   ├── user_stats_view.sql
│   │   └── contest_leaderboard_matview.sql
│   ├── functions/
│   │   ├── get_user_statistics.sql
│   │   ├── recommend_problems.sql
│   │   ├── generate_leaderboard.sql
│   │   └── update_contest_ratings.sql
│   ├── procedures/
│   │   └── process_submission.sql
│   ├── triggers/
│   │   ├── update_solved_count.sql
│   │   └── award_achievements.sql
│   ├── seed/
│   │   ├── seed_users.sql
│   │   ├── seed_problems.sql
│   │   └── seed_contests.sql
│   └── migrations/
│       └── init.sql
│
└── README.md
```

## TECHNOLOGIES USED

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React.js | v19.2.7 | UI framework |
| React Router | v7.18.0 | Client-side routing |
| Tailwind CSS | v4.3.1 | Utility-first styling |
| Firebase JS SDK | v12.15.0 | Client-side authentication |
| Axios | v1.18.0 | HTTP client for API calls |
| Lucide React | v1.21.0 | Icon library |
| Vite | v8.0.12 | Build tool & dev server |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | — | JavaScript runtime |
| Express.js | v5.2.1 | Web framework & REST API |
| pg (node-postgres) | — | PostgreSQL client for Node.js |
| Firebase Admin SDK | — | Server-side token verification |
| Axios | v1.18.0 | HTTP client to call Judge0 API |
| dotenv | v17.4.2 | Environment variable management |
| cors | v2.8.6 | Cross-origin request handling |
| nodemon | — | Auto-restart during development |

### Database
| Technology | Version | Purpose |
|---|---|---|
| PostgreSQL | 18.1 | Primary relational database |
| PL/pgSQL | — | Stored procedures, functions & triggers |

### External Services
| Service | Purpose |
|---|---|
| Judge0 CE (Public API) | Online code execution & judging |
| Firebase Authentication | User identity & token management |