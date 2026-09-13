# 🌉 ArthSetu AI — Financial Intelligence Platform

> **“Understand your money. Build your future.”**

**ArthSetu AI** is a state-of-the-art, AI-powered personal finance and wealth management platform. Named after **“Arth”** (wealth / financial prosperity) and **“Setu”** (bridge), ArthSetu AI bridges raw cashflow transactions with actionable financial intelligence, automated advisory, and intelligent budgeting.

---

## 🏛️ Brand Concept & Architecture

```
Raw Financial Data (Income, Expenses, Budgets)
                     │
                     ▼
          ┌─────────────────────┐
          │     ArthSetu AI     │  <-- Intelligent Financial Bridge
          │   (Gemini 3.6 Flash)│
          └─────────────────────┘
                     │
                     ▼
  • Health Score (0-100)
  • 4 Ranked Savings Tips (₹ Identified)
  • Automated Budget Verdicts & Creep Alerts
  • Long-Term Wealth Planning & Insights
```

---

## ✨ Core Features

### 🔐 1. Authentication & Security
- **Stateless JWT Sessions**: Secure token-based authentication with expiration handling.
- **bcrypt.js Password Encryption**: Industrial-grade salted hashing.
- **Demo Mode**: Instant 1-click access via `demo@arthsetu.ai` (`demoPassword123`).
- **Profile & Credentials Management**: Update display identity and change passwords securely.

### 💳 2. Transaction Hub & Cashflow Management
- **Unified Transaction Ledger**: Real-time tracking of all income and expense streams.
- **Dynamic Search & Filtering**: Instant search across descriptions, category selectors, type toggles, and custom date ranges (`From` - `To`).
- **Server-Side Pagination**: Efficient, paginated view for high-volume ledgers.
- **Excel Spreadsheet Export**: Formatted `.xlsx` report downloads powered by SheetJS.

### 🏷️ 3. Category System
- **17 Auto-Seeded Categories**: Preloaded default categories covering essential living, utilities, dining, investments, and discretionary spending.
- **Personalized Custom Categories**: Create and edit personal tags with custom Lucide icons and tailored color swatches.

### 🎯 4. Live Budget Tracking & Overdraft Guard
- **Monthly & Weekly Limits**: Configure spending caps for specific expense categories.
- **Real-Time Spent Aggregation**: Backend joins live transaction outflows against budget limits.
- **Threshold Warnings**: Visual alerts and status indicators (On Track, Warning, Over Budget) when spending crosses 80% or 100%.

### 📊 5. Financial Command Center (Dashboard)
- **KPI Metrics**: Total Income, Total Expenses, Net Savings, and Savings Rate percentage.
- **Visual Analytics**: Interactive Recharts AreaCharts for monthly cashflow trends and donut charts for category distributions.
- **Quick Action Center**: Fast modals for logging transactions and launching AI audits.

### 🧠 6. AI Financial Intelligence (Gemini 3.6 Flash)
- **Executive Monthly Summary**: Evaluates cashflow surplus/deficit, calculates an objective **Financial Health Score (0–100)**, and outputs key strengths and risks.
- **4 Ranked Savings Recommendations**: Algorithmically sorted by impact with exact monthly rupee savings estimates.
- **Automated Budget Verdicts**: Live audit comparing allocated limits with actual expenses to catch lifestyle creep early.
- **Persistent MongoDB Archive**: AI audits are permanently archived for historical trend analysis.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons, Recharts, React Hot Toast |
| **Backend** | Node.js, Express 5 (ES Modules), Mongoose 9 |
| **Database** | MongoDB Atlas (stateless document store) |
| **Artificial Intelligence** | Google Gemini 3.6 Flash API (`@google/genai`) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| **Export Engine** | SheetJS (`xlsx`) |

---

## 📁 Repository Structure

```text
ExpenceTracer/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── aiController.js       # Gemini 3.6 Flash financial advisory
│   │   ├── budgetController.js   # Budget tracking & live spending joins
│   │   ├── categoryController.js # Category manager & 17 defaults
│   │   ├── dashboardController.js# KPI metrics & Recharts aggregations
│   │   ├── expenseController.js  # Expense operations & Excel streaming
│   │   ├── incomeController.js   # Income operations & Excel streaming
│   │   ├── transactionController.js # Unified ledger & pagination
│   │   └── userController.js     # Auth, profile, & password management
│   ├── middleware/
│   │   └── auth.js               # JWT verification guard
│   ├── models/
│   │   ├── aiInsightModel.js     # Persistent AI audits schema
│   │   ├── budgetModel.js        # Category budget limit schema
│   │   ├── categoryModel.js      # System & custom categories schema
│   │   ├── expenseModel.js       # Expense schema
│   │   ├── incomeModel.js        # Income schema
│   │   └── userModel.js          # User schema
│   ├── seedDemo.js               # Demo account & sample data seeder
│   ├── server.js                 # Express application entry
│   └── tests/                    # Backend Jest test suite
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg           # Geometric A-bridge vector favicon
│   │   └── logo.png              # High-res ArthSetu AI emblem
│   ├── src/
│   │   ├── api/axios.js          # Axios interceptor for JWT auth
│   │   ├── components/
│   │   │   ├── BrandLogo.jsx     # Reusable ArthSetu AI logo lockup
│   │   │   ├── AuthHero.jsx      # Charcoal/teal authentication sidebar
│   │   │   ├── Navbar.jsx        # App header with quick actions & profile
│   │   │   ├── Sidebar.jsx       # Navigation drawer with brand badge
│   │   │   └── TransactionModal.jsx # Unified transaction modal
│   │   ├── context/AuthContext.jsx # Global user auth provider
│   │   ├── pages/
│   │   │   ├── Landing.jsx       # Public landing page with live previews
│   │   │   ├── Dashboard.jsx     # Financial Command Center
│   │   │   ├── AIInsights.jsx    # Gemini 3.6 Flash financial reports
│   │   │   ├── Transactions.jsx  # Transaction Hub (filtered, paginated)
│   │   │   ├── Budgets.jsx       # Budget tracking & threshold alerts
│   │   │   ├── Categories.jsx    # Category Manager
│   │   │   ├── Income.jsx        # Income streams & Excel export
│   │   │   ├── Expense.jsx       # Expense outflows & Excel export
│   │   │   ├── Profile.jsx       # Profile & security settings
│   │   │   ├── Login.jsx         # Login with demo auto-fill
│   │   │   └── Register.jsx      # Create account
│   │   ├── App.jsx               # Route gateway & toast configuration
│   │   └── index.css             # Tailwind v4 ivory canvas & tokens
│   └── vite.config.js
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v20+)
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster connection string
- [Google Gemini API Key](https://aistudio.google.com/) for AI intelligence features

### 1. Backend Setup
```bash
cd backend
npm install
```

Configure your `backend/.env` file:
```env
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/Expense
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=24h
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```

Seed the demo account and preloaded data:
```bash
node seedDemo.js
```

Start the API server:
```bash
npm start
```
*Backend runs on `http://localhost:4000`*

### 2. Frontend Setup
```bash
cd ../frontend
npm install
```

Start the development server:
```bash
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 🔑 Demo Account Credentials

| Field | Value |
| :--- | :--- |
| **Email** | `demo@arthsetu.ai` *(or `demo@expenseai.com`)* |
| **Password** | `demoPassword123` |

Click **“Auto-Fill Demo Credentials”** on the Login page to sign in instantly.

---

## 🧪 Testing & Validation

To run the backend test suite:
```bash
cd backend
npm test
```
All 30 automated integration test suites validate authentication, transactions, categories, budgets, and AI routes.

To validate the frontend build:
```bash
cd frontend
npm run build
```

---

## 📄 License
Licensed under the [ISC License](LICENSE).
