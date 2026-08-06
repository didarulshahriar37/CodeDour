# CodeDour Frontend 🚀

CodeDour is a modern, high-performance Competitive Programming and Online Judge web application built with React, Vite, and Tailwind CSS. It provides an intuitive interface for coders to solve programming problems, submit code, track performance statistics, and for administrators to manage problems and users.

---

## 🌟 Key Features

- **Problem Catalog & Filtering**: Browse problems by difficulty, category tags, search keywords, and popularity.
- **Interactive Code IDE**: Built-in code editor supporting multiple programming languages (C, C++, Java, Python) with syntax highlighting, custom test case execution, and dynamic verdict results.
- **Tag-Based Recommendations**: Smart problem recommendations generated dynamically based on problem tags on load and after submission verdicts.
- **Admin Dashboard**:
  - Full-screen, responsive interface with a fixed, non-scrollable sidebar.
  - **User Management**: View user list, promote/demote user roles (`user` vs `admin`), and delete accounts.
  - **Problems Management**: Create, edit, and delete problems. Supports inputting Time Limit (seconds), Memory Limit (MB), category tag multi-selection, and adding sample & hidden test cases.
- **User Authentication**: Integrated with Firebase Auth and backend sync for seamless login, profile statistics, and submission tracking.

---

## 🛠️ Technology Stack

- **Framework**: React 18
- **Routing**: React Router v7 (`react-router-dom`)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS, Vanilla CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Authentication**: Firebase Authentication SDK

---

## 📁 Folder Structure

```
frontend/
├── public/                # Static public assets
├── src/
│   ├── assets/            # Images, logos, and global static media
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Navbar, Footer, Buttons, Loader, Modals
│   │   ├── problems/      # Problem list cards, filters, search bar
│   │   └── editor/        # Code editor component & result console
│   ├── context/           # React Context state (AuthContext, ThemeContext)
│   ├── firebase/          # Firebase client SDK setup & configuration
│   ├── layouts/           # Page layout wrappers (MainLayout, AdminLayout)
│   ├── pages/             # Application route views
│   │   ├── Home.jsx       # Landing page & feature showcase
│   │   ├── Problems.jsx   # Problem list & catalog
│   │   ├── ProblemDetail.jsx # Problem statement, IDE & recommendations
│   │   ├── Profile.jsx    # User statistics & submission history
│   │   ├── AdminDashboard.jsx # Admin User & Problem management
│   │   ├── Login.jsx      # User authentication login
│   │   └── Register.jsx   # User account creation
│   ├── services/          # API service modules
│   │   ├── api.js         # Centralized Axios instance with auth interceptor
│   │   ├── adminService.js # Admin API endpoints wrapper
│   │   ├── problemService.js # Problems & submissions API calls
│   │   └── userService.js # Profile & user stats API calls
│   ├── App.jsx            # Main app router setup & route guard
│   ├── main.jsx           # React DOM application entrypoint
│   └── index.css          # Tailwind CSS directives & custom styling
├── index.html             # HTML template
├── package.json           # Frontend dependencies & scripts
├── vite.config.js         # Vite configuration & dev server proxy
└── vercel.json            # Vercel deployment rewrites
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `frontend/` root directory:

```env
VITE_API_URL=https://codedour-backend.vercel.app/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 📥 Installation & Setup Guide

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

### Steps

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` (or create `.env`) and add your Firebase credentials and backend API URL.

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```
   The compiled static files will be placed in the `dist/` directory.

---

## 📜 Scripts Reference

| Script | Command | Description |
| :--- | :--- | :--- |
| `dev` | `vite` | Starts local development server on port 5173 |
| `build` | `vite build` | Compiles production build into `dist/` |
| `preview` | `vite preview` | Previews production build locally |
| `lint` | `eslint .` | Runs ESLint code check |
