import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, Wallet } from 'lucide-react';
import { signupStyles } from '../assets/dummyStyles';
import { useAuth } from '../context/useAuth';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('All fields are required.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the terms and privacy policy.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password);
      if (res?.success) {
        navigate('/', { replace: true });
      } else {
        setError(res?.message || 'Registration failed.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Unable to complete registration. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={signupStyles.pageContainer}>
      <div className={signupStyles.cardContainer}>
        {/* Header */}
        <div className={signupStyles.header}>
          <div className={signupStyles.avatar}>
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className={signupStyles.headerTitle}>Create Account</h1>
          <p className={signupStyles.headerSubtitle}>
            Start tracking and growing your wealth today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={signupStyles.formContainer}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center text-sm">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div className="mb-4">
            <label className={signupStyles.label}>Full Name</label>
            <div className={signupStyles.inputContainer}>
              <User className={signupStyles.inputIcon} size={18} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className={signupStyles.input}
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className={signupStyles.label}>Email Address</label>
            <div className={signupStyles.inputContainer}>
              <Mail className={signupStyles.inputIcon} size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={signupStyles.input}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className={signupStyles.label}>Password (min 8 chars)</label>
            <div className={signupStyles.inputContainer}>
              <Lock className={signupStyles.inputIcon} size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={signupStyles.passwordInput}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={signupStyles.passwordToggle}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className={signupStyles.checkboxContainer}>
            <input
              id="agree-terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className={signupStyles.checkbox}
            />
            <label htmlFor="agree-terms" className={signupStyles.checkboxLabel}>
              I agree to the Terms of Service & Privacy Policy
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`${signupStyles.button} ${
              loading ? signupStyles.buttonDisabled : ''
            }`}
          >
            {loading && (
              <svg
                className={signupStyles.spinner}
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
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          {/* Sign In Link */}
          <div className={signupStyles.signInContainer}>
            <p className={signupStyles.signInText}>
              Already have an account?{' '}
              <Link to="/login" className={signupStyles.signInLink}>
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
