import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Spinner from './Spinner';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfbf9]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" className="text-teal-700" />
          <p className="text-xs text-slate-500 font-semibold tracking-wide">
            Loading ArthSetu AI...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
