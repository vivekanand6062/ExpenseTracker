import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Wallet } from 'lucide-react';
import { loginStyles } from '../assets/dummyStyles';
import { useAuth } from '../context/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res?.success) {
        navigate('/', { replace: true });
      } else {
        setError(res?.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Unable to connect to server. Please try again later.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={loginStyles.pageContainer}>
      <div className={loginStyles.cardContainer}>
        {/* Header */}
        <div className={loginStyles.header}>
          <div className={loginStyles.avatar}>
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className={loginStyles.headerTitle}>Welcome Back</h1>
          <p className={loginStyles.headerSubtitle}>
            Sign in to manage your finances & expenses
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={loginStyles.formContainer}>
          {error && (
            <div className={loginStyles.errorContainer}>
              <div className={loginStyles.errorIcon}>
                <AlertCircle className="w-4 h-4" />
              </div>
              <p className={loginStyles.errorText}>{error}</p>
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label className={loginStyles.label}>Email Address</label>
            <div className={loginStyles.inputContainer}>
              <Mail className={loginStyles.inputIcon} size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={loginStyles.input}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className={loginStyles.label}>Password</label>
            <div className={loginStyles.inputContainer}>
              <Lock className={loginStyles.inputIcon} size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={loginStyles.passwordInput}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={loginStyles.passwordToggle}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className={loginStyles.checkboxContainer}>
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className={loginStyles.checkbox}
            />
            <label htmlFor="remember-me" className={loginStyles.checkboxLabel}>
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`${loginStyles.button} ${
              loading ? loginStyles.buttonDisabled : ''
            }`}
          >
            {loading && (
              <svg
                className={loginStyles.spinner}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Sign Up Link */}
          <div className={loginStyles.signUpContainer}>
            <p className={loginStyles.signUpText}>
              Don't have an account?{' '}
              <Link to="/register" className={loginStyles.signUpLink}>
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
