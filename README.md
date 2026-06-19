## PROJECT OVERVIEW
**CodeDour** is a web-based competitive programming platform designed to provide a complete environment for problem solving, contest participation, and real-time code evaluation. Users can browse programming problems, submit solutions in multiple programming languages, participate in contests, and receive instant verdicts through an integrated online judging system.

## ROLE OF RELATIONAL DATABASE
**CodeDour** leverages PostgreSQL as its primary data management and processing engine, storing and managing problems, test cases, submissions, contests, rankings, achievements, and user-related data. By combining real-time code execution with a robust relational database architecture, **CodeDour** aims to deliver a scalable and efficient competitive programming experience while demonstrating the practical application of advanced database concepts in a real-world system.

## FOLDER STRUTURE
CodeDour/ <br>
├── frontend/ <br>                         
│   ├── public/ <br>
│   ├── src/ <br>
│   │   ├── assets/ <br>
│   │   ├── components/ <br>
│   │   │   ├── common/     <br>           
│   │   │   ├── editor/         <br>       
│   │   │   ├── leaderboard/<br>
│   │   │   ├── problems/<br>
│   │   │   ├── contests/<br>
│   │   │   └── submissions/<br>
│   │   ├── pages/<br>
│   │   │   ├── Home.jsx<br>
│   │   │   ├── Login.jsx<br>
│   │   │   ├── Register.jsx<br>
│   │   │   ├── Profile.jsx<br>
│   │   │   ├── Problems.jsx<br>
│   │   │   ├── ProblemDetail.jsx<br>
│   │   │   ├── Contests.jsx<br>
│   │   │   ├── ContestDetail.jsx<br>
│   │   │   ├── Leaderboard.jsx<br>
│   │   │   └── Submissions.jsx<br>
│   │   ├── context/               <br>    
│   │   ├── hooks/                     <br>
│   │   ├── services/                  <br>
│   │   │   ├── api.js                 <br>
│   │   │   ├── authService.js<br>
│   │   │   ├── problemService.js<br>
│   │   │   ├── submissionService.js<br>
│   │   │   └── contestService.js<br>
│   │   ├── firebase/<br>
│   │   │   └── config.js<br>              
│   │   ├── App.jsx<br>
│   │   └── main.jsx<br>
│   ├── .env<br>
│   └── package.json<br>
│<br>
├── backend/<br>                           
│   ├── src/<br>
│   │   ├── config/<br>
│   │   │   ├── db.js  <br>                
│   │   │   └── firebase.js<br>            
│   │   ├── middleware/<br>
│   │   │   ├── authMiddleware.js<br>      
│   │   │   └── errorHandler.js<br>
│   │   ├── routes/<br>
│   │   │   ├── auth.routes.js<br>
│   │   │   ├── user.routes.js<br>
│   │   │   ├── problem.routes.js<br>
│   │   │   ├── submission.routes.js<br>
│   │   │   ├── contest.routes.js<br>
│   │   │   └── leaderboard.routes.js<br>
│   │   ├── controllers/<br>
│   │   │   ├── auth.controller.js<br>
│   │   │   ├── user.controller.js<br>
│   │   │   ├── problem.controller.js<br>
│   │   │   ├── submission.controller.js<br>
│   │   │   ├── contest.controller.js<br>
│   │   │   └── leaderboard.controller.js<br>
│   │   ├── services/<br>
│   │   │   ├── judge0.service.js<br>      
│   │   │   └── submission.service.js<br>  
│   │   └── app.js                     <br>
│   ├── server.js                      <br>
│   ├── .env<br>
│   └── package.json<br>
│<br>
├── database/<br>                          
│   ├── schema/<br>
│   │   ├── 01_tables.sql<br>              
│   │   ├── 02_indexes.sql   <br>          
│   │   └── 03_constraints.sql   <br>      
│   ├── views/<br>
│   │   ├── problem_stats_view.sql<br>
│   │   ├── user_stats_view.sql<br>
│   │   └── contest_leaderboard_matview.sql<br>  
│   ├── functions/<br>
│   │   ├── get_user_statistics.sql<br>
│   │   ├── recommend_problems.sql<br>
│   │   ├── generate_leaderboard.sql<br>
│   │   └── update_contest_ratings.sql<br>
│   ├── procedures/<br>
│   │   └── process_submission.sql<br>
│   ├── triggers/<br>
│   │   ├── update_solved_count.sql<br>
│   │   └── award_achievements.sql<br>
│   ├── seed/<br>
│   │   ├── seed_users.sql<br>
│   │   ├── seed_problems.sql<br>
│   │   └── seed_contests.sql<br>
│   └── migrations/<br>
│       └── init.sql   <br>                
│<br>
└── README.md<br>

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