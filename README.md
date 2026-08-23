# ⚡ TaskManager Pro — Futuristic Cyber HUD Work & Schedule Platform

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel_App-00f5ff?style=for-the-badge&logo=vercel&logoColor=white)](https://task-management-app-lyart-nu.vercel.app/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase_11-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Passing_41/41-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

> **🌐 Production Live App:** [https://task-management-app-lyart-nu.vercel.app/](https://task-management-app-lyart-nu.vercel.app/)

---

## 🌟 Overview & Highlights

**TaskManager Pro** is an enterprise-grade, high-performance task management and project scheduling application engineered with a **Sci-Fi Cyberpunk HUD Interface**. It empowers teams and individuals to organize, visualize, and track workflows across multiple dynamic views with **real-time cloud synchronization**, **task dependency mapping**, and **robust cybersecurity protection**.

---

## 🚀 Key Features

### 1. 📊 Interactive Multi-View Workspace
- **⚡ Overview Dashboard (Command Telemetry Deck)**: Real-time KPIs, progress completion rings, active node counters, priority spectrum distribution, and upcoming deadline queues.
- **📋 Kanban Board**: 4-stage drag-and-drop workflow (`To Do`, `In Progress`, `Review`, `Completed`) with laser drop zones, quick status toggling, and multi-criteria filters.
- **📅 Interactive Gantt Timeline & Task Dependencies**:
  - Full project timeline spanning Start Dates to Due Dates.
  - **Prerequisite Dependencies (`Blocked By`)**: Tasks linked sequentially.
  - **⚠️ Visual Delay Warnings**: Immediate visual alerts when prerequisite tasks are delayed or overdue.
  - **Mobile Gantt Deck Toggle**: Quick toggle between full-width timeline matrix and task deck.
- **🗓️ Calendar Matrix & Daily Agenda Strip**: Month, week, and interactive daily agenda views with drag-and-drop date rescheduling.
- **✅ Command Terminal To-Do Checklist**: Fast quick-entry task creator with instant subtask checklist progress.

---

### 2. 🎨 Full RGB/HEX Custom Category Manager
- **Custom RGB 3D Color Wheel**: Customize **Text**, **Stroke/Border Glow**, and **Background** colors independently for each category tag.
- **Quick Preset Palettes**: One-click Neon Cyan, Laser Rose, Plasma Purple, Matrix Emerald, Cyber Amber, Electric Indigo, and Steel Slate themes.
- **Real-Time Live Holographic Preview**: Instant visual preview before saving.

---

### 3. ☁️ Real-Time Cloud Synchronization & Offline Fallback
- **Firebase Firestore Live Sync**: Instant multi-tab and cross-device sync via `onSnapshot` real-time listeners.
- **Google OAuth Authentication**: Seamless one-click Google Sign-In with popup and redirect fallbacks.
- **Instant Demo Account Mode**: Fully functional offline workspace using `LocalStorage` and `BroadcastChannel` cross-tab synchronization.
- **JSON Backup & Restore**: One-click JSON data export and import with prototype pollution guards.

---

### 4. 🌐 Multilingual & Cyber Theme
- **Bilingual Interface**: Seamless instant switching between **ภาษาไทย (Thai)** and **English**.
- **Futuristic Sci-Fi HUD Theme**: High-contrast Dark and Light modes with neon glows, glowing progress bars, and cyber grid backdrop.
- **Ergonomic Responsive Mobile Layout**: Symmetrical bottom navigation bar + glowing Floating Action Button (FAB `+`) for effortless one-thumb task creation.

---

### 5. 🛡️ Enterprise-Grade Cybersecurity (OWASP Top 10)
- **Sliding Window Rate Limiter**: Prevents DoS and API flood attacks on imports and mutations.
- **Anti-Brute Force Lockout**: Exponential backoff lockout (30s, 60s, up to 15 mins) after 5 consecutive failed login attempts.
- **Anti-Replay Nonce Verification**: Cryptographically secure nonces (`crypto.getRandomValues`) with timestamp validation window.
- **XSS & Injection Sanitizer**: Multi-layer stripping of `<script>`, inline event handlers (`onerror=`, `onload=`), `javascript:` URIs, and null-bytes.
- **Prototype Pollution Guard**: Safe JSON parser rejecting `__proto__`, `constructor`, and `prototype` payloads.
- **Security Headers (CSP)**: Strict Content-Security-Policy, `X-Content-Type-Options: nosniff`, and `Referrer-Policy`.
- **Hardened Cloud Firestore Rules**: Type-safety assertions, strict owner isolation (`userId == request.auth.uid`), and DoS string/array bounds checking.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript 5.7](https://www.typescriptlang.org/) |
| **Build Tool & Bundler** | [Vite 6](https://vitejs.dev/) |
| **Styling & Design System** | [Tailwind CSS 3.4](https://tailwindcss.com/) + Custom Cyber Glow Engine |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Authentication & Database** | [Firebase 11](https://firebase.google.com/) (Auth + Cloud Firestore) |
| **State & Data Flow** | React Context API + BroadcastChannel API |
| **Testing Suite** | [Vitest 3.0](https://vitest.dev/) (41 Unit & Security Tests) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📁 Project Directory Structure

```text
TaskManager/
├── firestore.rules              # Hardened Enterprise Firestore Security Rules
├── index.html                   # Entry HTML with Strict CSP & Security Meta Headers
├── package.json                 # Project dependencies & scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite bundler configuration
├── src/
│   ├── main.tsx                 # App entry point
│   ├── App.tsx                  # Root layout & view controller
│   ├── index.css                # Custom CSS, Cyber glow utilities, Progress bars
│   ├── types/
│   │   └── task.ts              # TypeScript interfaces (Task, Category, User, Filters)
│   ├── services/
│   │   └── firebase.ts          # Firebase Auth, Firestore sync & connectivity diagnostics
│   ├── context/
│   │   ├── AuthContext.tsx      # Google Auth, Demo mode & Brute-force protection
│   │   ├── TaskContext.tsx      # Central task state, CRUD, Categories & Sync engine
│   │   ├── LanguageContext.tsx  # Bilingual dictionary (TH / EN)
│   │   └── ThemeContext.tsx     # Cyber Dark / Light mode controller
│   ├── utils/
│   │   ├── security.ts          # Rate limiters, Nonce verification, Prototype pollution guard
│   │   ├── sanitizer.ts         # XSS sanitization, Schema bounds & Payload validators
│   │   ├── dependencies.ts      # Task dependency resolution & circular reference detector
│   │   ├── category.ts          # Dynamic RGB/HEX category badge styling helper
│   │   └── date.ts              # Date calculation, Gantt duration & formatting helpers
│   ├── components/
│   │   ├── dashboard/           # Overview Dashboard telemetry deck
│   │   ├── board/               # Kanban Board & Task Cards
│   │   ├── timeline/            # Interactive Gantt Timeline & Dependency lines
│   │   ├── calendar/            # Calendar Matrix & Daily Agenda Strip
│   │   ├── todo/                # Command Terminal To-Do Checklist
│   │   ├── tasks/               # Task Form Modal (Create / Edit / Prerequisites)
│   │   ├── settings/            # Settings Modal & Database Ping Test
│   │   └── common/              # Modals, Navbar, Sidebar, BottomNav, CategoryManager
│   └── __tests__/               # Vitest automated test suite (41/41 Passing)
│       ├── security.test.ts
│       ├── sanitizer.test.ts
│       ├── dependencies.test.ts
│       ├── date.test.ts
│       ├── firebase.test.ts
│       └── CategoryAndLanguage.test.ts
```

---

## 💻 Getting Started Locally

### 1. Clone the Repository
```bash
git clone https://github.com/Nopphon-k23251/TaskManagementApp.git
cd TaskManagementApp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and add your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
*(Note: If `.env` is omitted, the app automatically runs in **Offline Demo Mode** with complete feature support).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Running Automated Tests

Run the full Vitest suite (Unit, Integration, and Cybersecurity tests):
```bash
npm test
```

Build the application for production:
```bash
npm run build
```

---

## 🚀 Deployment to Vercel

1. Push your code to GitHub.
2. Import your repository in [Vercel Dashboard](https://vercel.com/dashboard).
3. Under **Environment Variables**, add the `VITE_FIREBASE_*` keys from your `.env`.
4. Deploy! 🚀

---

## 📄 License & Credits

Developed with ❤️ by **Nopphon-k23251**  
Licensed under the **MIT License**.
