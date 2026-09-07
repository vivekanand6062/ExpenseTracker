# 💰 ExpenseTracker - Full-Stack Personal Finance Management System

A modern, full-stack personal finance and expense tracking application built with **React 19**, **Vite**, **Tailwind CSS v4**, **Node.js**, **Express**, and **MongoDB**. Manage income, track expenses, analyze spending distribution, and export financial records to Excel with a sleek, responsive interface.

---

## 🚀 Live Demo & Repository
- **GitHub Repository**: [https://github.com/vivekanand6062/ExpenseTracker](https://github.com/vivekanand6062/ExpenseTracker)

---

## ✨ Features

### 🔐 Authentication & Account Management
- **Secure Authentication**: User registration and login protected with JSON Web Tokens (JWT) and `bcryptjs` password hashing.
- **Protected Routing**: Client-side protected route wrappers preventing unauthorized access to financial data.
- **Profile Customization**: Update display name and email address with collision validation.
- **Password Security**: Dedicated modal to securely update passwords with verification of current password.
- **Session Auto-Handling**: Axios interceptors automatically attach Bearer tokens and gracefully redirect to login upon token expiration (401 Unauthorized).

### 📊 Dashboard & Financial Analytics
- **Summary Metrics**: Real-time cards displaying Total Monthly Income, Total Monthly Expenses, Net Savings, and Savings Rate percentage.
- **Expense Categorization**: Automated categorization breakdown with percentage distribution.
- **Recent Activity Stream**: Unified chronological feed of recent incomes and expenses.

### 💸 Income & Expense Management
- **Full CRUD Operations**: Create, view, update, and delete individual income and expense records.
- **Date Range Filtering**: Filter transaction overviews across **Daily**, **Weekly**, **Monthly**, and **Yearly** ranges.
- **Category Tagging**: Organize cashflows by categories (e.g., Salary, Freelance, Investment, Food, Rent, Utilities, Entertainment).
- **Interactive Modals**: Polished modal forms for seamless adding and editing without page reloads.

### 📥 Data Export & Reporting
- **Excel (.xlsx) Downloads**: Export full income or expense statements directly into formatted Excel spreadsheets via SheetJS (`xlsx`).

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) | Component-based UI library |
| **Build Tool** | [Vite 8](https://vitejs.dev/) | Fast development server & production bundler |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern utility-first styling |
| **Icons & Animation** | [Lucide React](https://lucide.dev/) & [Framer Motion](https://www.framer.com/motion/) | Iconography and fluid interface transitions |
| **Routing** | [React Router v7](https://reactrouter.com/) | Client-side routing with SPA rewrite support |
| **HTTP Client** | [Axios](https://axios-http.com/) | Promise-based HTTP requests with interceptors |
| **Backend Framework** | [Node.js](https://nodejs.org/) & [Express 5](https://expressjs.com/) | RESTful API server with ES Module syntax |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) & [Mongoose 9](https://mongoosejs.com/) | NoSQL database & object data modeling |
| **Authentication** | [jsonwebtoken (JWT)](https://jwt.io/) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Token-based auth and password hashing |
| **File Generation** | [SheetJS (xlsx)](https://sheetjs.com/) | Excel spreadsheet generation and streaming |

---

## 📁 Project Structure

```text
ExpenseTracker/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection setup
│   ├── controllers/
│   │   ├── dashboardController.js# Dashboard statistics & aggregations
│   │   ├── expenseController.js  # Expense CRUD & Excel export
│   │   ├── incomeController.js   # Income CRUD & Excel export
│   │   └── userController.js     # Auth, profile, & password logic
│   ├── middleware/
│   │   └── auth.js               # JWT verification middleware
│   ├── models/
│   │   ├── expenseModel.js       # Expense schema
│   │   ├── incomeModel.js        # Income schema
│   │   └── userModel.js          # User credentials schema
│   ├── routes/
│   │   ├── dashboardRoute.js     # /api/dashboard
│   │   ├── expenseRoute.js       # /api/expense
│   │   ├── incomeRoute.js        # /api/income
│   │   └── userRoutes.js         # /api/user
│   ├── utils/
│   │   └── dataFilter.js         # Date range filter helper
│   ├── .env.example              # Backend environment template
│   ├── package.json              # Backend dependencies & scripts
│   └── server.js                 # Express entry point
│
├── frontend/
│   ├── public/                   # Static assets & SVG icons
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js          # Configured Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── ChangePasswordModal.jsx # Secure password change modal
│   │   │   ├── Layout.jsx              # Main app shell (Sidebar + Navbar)
│   │   │   ├── Navbar.jsx              # Top header with user profile menu
│   │   │   ├── ProtectedRoute.jsx      # Auth guard for private pages
│   │   │   ├── Sidebar.jsx             # Responsive navigation sidebar
│   │   │   ├── Toast.jsx               # Feedback alert toasts
│   │   │   └── TransactionModal.jsx    # Add/Edit transaction modal
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         # Auth state provider
│   │   │   └── useAuth.js              # Custom auth hook
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx           # Financial dashboard & charts
│   │   │   ├── Expense.jsx             # Expense management view
│   │   │   ├── Income.jsx              # Income management view
│   │   │   ├── Login.jsx               # Login view
│   │   │   ├── Profile.jsx             # User profile settings view
│   │   │   └── Register.jsx            # Sign-up view
│   │   ├── App.jsx                     # Route definitions
│   │   └── main.jsx                    # React root render
│   ├── .env.example              # Frontend environment template
│   ├── package.json              # Frontend dependencies & scripts
│   ├── vercel.json               # Vercel SPA routing rewrite rules
│   └── vite.config.js            # Vite configuration
└── README.md                     # Project documentation
```

---

## 📡 API Reference

All protected endpoints require the header:  
`Authorization: Bearer <token>`

### 👤 Authentication & User Routes (`/api/user`)
| Method | Endpoint | Auth Required | Description | Request Body |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/user/register` | No | Register new user | `{ name, email, password }` |
| `POST` | `/api/user/login` | No | Log in existing user | `{ email, password }` |
| `GET` | `/api/user/me` | Yes | Get authenticated user info | - |
| `PUT` | `/api/user/profile` | Yes | Update user profile | `{ name, email }` |
| `PUT` | `/api/user/password` | Yes | Change user password | `{ currentPassword, newPassword }` |

### 💵 Income Routes (`/api/income`)
| Method | Endpoint | Auth Required | Description | Request Body / Params |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/income/add` | Yes | Add new income record | `{ description, amount, category, date }` |
| `GET` | `/api/income/get` | Yes | Fetch all income records | - |
| `PUT` | `/api/income/update/:id`| Yes | Update income record | `{ description, amount, category, date }` |
| `DELETE`| `/api/income/delete/:id`| Yes | Delete income record | Route param: `id` |
| `GET` | `/api/income/overview` | Yes | Get income metrics & recent logs | Query: `?range=daily\|weekly\|monthly\|yearly` |
| `GET` | `/api/income/downloadexcel` | Yes | Download income records as `.xlsx` | - |

### 💳 Expense Routes (`/api/expense`)
| Method | Endpoint | Auth Required | Description | Request Body / Params |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/api/expense/add` | Yes | Add new expense record | `{ description, amount, category, date }` |
| `GET` | `/api/expense/get` | Yes | Fetch all expense records | - |
| `PUT` | `/api/expense/update/:id`| Yes | Update expense record | `{ description, amount, category, date }` |
| `DELETE`| `/api/expense/delete/:id`| Yes | Delete expense record | Route param: `id` |
| `GET` | `/api/expense/overview` | Yes | Get expense metrics & recent logs | Query: `?range=daily\|weekly\|monthly\|yearly` |
| `GET` | `/api/expense/downloadexcel`| Yes | Download expense records as `.xlsx`| - |

### 📈 Dashboard Routes (`/api/dashboard`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/dashboard/` | Yes | Aggregated monthly income, expenses, savings rate, & category breakdown |

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)
Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/Expense

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=24h

# Frontend Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### Frontend Configuration (`frontend/.env`)
Create a `.env` file in the `frontend/` directory (optional for local development, required for production):

```env
# Deployed Backend URL (e.g., Render, Railway, AWS)
VITE_API_URL=https://your-backend-api.onrender.com/api
```

---

## 💻 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas connection string)

### 1. Clone the Repository
```bash
git clone https://github.com/vivekanand6062/ExpenseTracker.git
cd ExpenseTracker
```

### 2. Configure Backend
```bash
cd backend
npm install
```
- Copy `.env.example` to `.env` and fill in your MongoDB connection string and JWT secret:
```bash
cp .env.example .env
```
- Start the backend server:
```bash
npm start
```
The backend will run on **`http://localhost:4000`**.

### 3. Configure Frontend
Open a new terminal window:
```bash
cd frontend
npm install
```
- Start the Vite development server:
```bash
npm run dev
```
The frontend will run on **`http://localhost:5173`**.

---

## 🚢 Deployment Guide

### Deploying Frontend to Vercel
1. Import the repository into [Vercel](https://vercel.com/).
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. In **Settings > Environment Variables**, add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://<your-backend-app-name>.onrender.com/api`
5. Deploy! The included `frontend/vercel.json` ensures that React Router SPA routes work cleanly without 404 errors.

### Deploying Backend to Render / Railway
1. Create a new **Web Service** pointing to your repository.
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to:
   ```bash
   npm install
   ```
4. Set **Start Command** to:
   ```bash
   npm start
   ```
5. Add the environment variables:
   - `PORT`: `4000` (or leave default provided by the host)
   - `MONGO_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: A strong secret key
   - `JWT_EXPIRE`: `24h`
   - `NODE_ENV`: `production`

---

## 📄 License
This project is licensed under the [ISC License](LICENSE).
