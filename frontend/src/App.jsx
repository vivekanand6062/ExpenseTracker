import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Categories from './pages/Categories';
import AIInsights from './pages/AIInsights';
import Income from './pages/Income';
import Expense from './pages/Expense';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

// Conditional Home Gateway: Shows Landing page if unauthenticated, or Dashboard within Layout if authenticated
const HomeGateway = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Landing />;
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '16px',
            background: '#090d12',
            color: '#fff',
            fontSize: '13px',
            padding: '12px 18px',
            boxShadow: '0 20px 30px -10px rgba(0,0,0,0.35)',
            border: '1px solid rgba(255,255,255,0.08)',
          },
          success: {
            iconTheme: {
              primary: '#0d9488',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#e11d48',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Public Marketing & Auth Routes */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/welcome" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dynamic Root Route */}
        <Route path="/" element={<HomeGateway />} />

        {/* Protected Authenticated Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/ai-insights" element={<AIInsights />} />
            <Route path="/income" element={<Income />} />
            <Route path="/expense" element={<Expense />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;