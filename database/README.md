# CodeDour Database System 🗄️

This directory contains the database architecture, SQL schema definitions, stored procedures, triggers, views, functions, seed data, and migration utility scripts for the **CodeDour** Competitive Programming platform built on **PostgreSQL (NeonDB)**.

---

## 📂 Directory & File Structure

```
database/
├── schema/
│   ├── tables.sql           # Table creation scripts for all core entities
│   ├── constraints.sql      # Foreign key relationships, unique & check constraints
│   └── indexes.sql          # B-tree performance indexes on key lookup columns
├── functions/
│   └── get_user_statistics.sql # Stored database function computing user statistics
├── procedures/
│   └── process_submission.sql  # Stored procedure executing submission processing logic
├── triggers/
│   └── update_solved_count.sql # Database triggers auto-updating submission & solve counters
├── views/
│   ├── problem_stats_view.sql  # View aggregating problem-level submission statistics
│   └── user_stats_view.sql     # View computing leaderboard user ranking statistics
├── seed/
│   ├── seed_users.sql          # Initial seed users and administrator account data
│   └── seed_problems.sql       # Initial problems, test cases, and category tags data
├── queries/
│   ├── index.js                # JavaScript query helper exporter
│   ├── problems.queries.sql    # Standard SQL queries for problem operations
│   ├── submissions.queries.sql # Standard SQL queries for submission logging
│   └── user_queries.sql        # Standard SQL queries for user authentication & profiles
└── scripts/
    ├── migrate.js              # Automated Node.js schema migration runner script
    ├── health_check.js         # Script to test database connectivity & table status
    ├── test_queries.js         # Query execution test script
    └── test_trigger.js         # Integration test script for database triggers
```

---

## 📜 File Descriptions & Purpose

### 1. `schema/` (Database Definition)
- **`tables.sql`**: Defines all core database entities:
  - `users`: User profiles, email, role (`user` / `admin`), total solved count, accuracy rating.
  - `problems`: Problem statements, difficulty, time limit, memory limit, constraints.
  - `tags`: Category tags (e.g. `Strings`, `Arrays`, `Pointers`, `Math`, `Basic C`).
  - `problem_tags`: Many-to-many relationship mapping problems to tags.
  - `test_cases`: Input/output test cases with `is_sample` flag for public samples vs hidden judge cases.
  - `submissions`: User code submissions, language, verdict (`Accepted`, `Wrong Answer`, `Time Limit Exceeded`), execution time, memory used.
  - `contests` & `contest_problems`: Scheduled programming contests and problem mappings.
  - `user_problem_progress`: Tracks user progress state per problem (`solved`, `attempted`).
- **`constraints.sql`**: Enforces relational constraints, cascading deletes, foreign keys, and unique indices (e.g., `user_id` in `user_problem_progress`).
- **`indexes.sql`**: Adds indexes on high-frequency query fields (`slug`, `user_id`, `problem_id`, `created_at`, `tag_id`) to maintain fast query speeds as data scales.

### 2. `functions/` (Database Logic)
- **`get_user_statistics.sql`**: A PostgreSQL function that accepts a `user_id` and calculates:
  - Total problems solved
  - Total submissions submitted
  - Accuracy percentage
  - Platform rating score

### 3. `procedures/` (Transactional Operations)
- **`process_submission.sql`**: Stored procedure executed when a submission is processed to atomically record execution details and maintain system integrity.

### 4. `triggers/` (Automated Event Handlers)
- **`update_solved_count.sql`**: Database triggers configured on the `submissions` table:
  - Automatically increments `total_submissions` and `accepted_submissions` on the target problem.
  - When an `Accepted` verdict occurs, updates `user_problem_progress` and increments the user's `solved_count`.

### 5. `views/` (Analytical Reporting)
- **`problem_stats_view.sql`**: Creates `problem_stats_view` providing pre-computed acceptance rates for problem listings.
- **`user_stats_view.sql`**: Creates `user_stats_view` powering the platform leaderboard and user profile rank displays.

### 6. `seed/` (Initial Data Population)
- **`seed_users.sql`**: Populates default system accounts, including `admin@codedour.com`.
- **`seed_problems.sql`**: Seeds starter competitive programming problems, sample input/outputs, and category tags.

### 7. `queries/` (Application SQL Templates)
- SQL queries used by the backend controllers for problem retrieval, user management, tag matching, and submission history.

### 8. `scripts/` (Database Administration Tools)
- **`migrate.js`**: Connects to PostgreSQL and executes all schema, trigger, function, view, and seed SQL scripts in correct dependency order.
- **`health_check.js`**: Verifies database connection and checks table row counts.

---

## 🛢️ Schema Architecture & Entity Relationships

```
 [users] 1 ──── N [submissions] N ──── 1 [problems]
    │                                       │
    │ 1                                     │ 1
    │                                       ├──── N [test_cases]
    ▼ N                                     │
 [user_problem_progress]                    └──── N [problem_tags] N ──── 1 [tags]
```

---

## 🚀 How to Run Migrations & Seed Data

### Prerequisites
- Node.js installed
- PostgreSQL Database URL (NeonDB or local PostgreSQL instance)

### Running Automated Migration Script

1. **Set your Database Environment Variable**:
   Set `DATABASE_URL` in `backend/.env` or export it in your terminal:
   ```bash
   export DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
   ```

2. **Execute Migration**:
   ```bash
   node database/scripts/migrate.js
   ```

3. **Check Database Health**:
   ```bash
   node database/scripts/health_check.js
   ```
