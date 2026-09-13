import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/useAuth.js';
import AuthHero from '../components/AuthHero.jsx';
import Spinner from '../components/Spinner.jsx';
import BrandLogo from '../components/BrandLogo.jsx';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    agreeTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      toast.error('All fields are required.');
      return;
    }

    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    if (!form.agreeTerms) {
      toast.error('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(form.name.trim(), form.email.trim(), form.password);
      if (res && res.success === false) {
        toast.error(res.message || 'Registration failed.');
        return;
      }
      toast.success('Welcome to ArthSetu AI! Account initialized with 17 default categories.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          'Unable to complete registration. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#fcfbf9] font-sans selection:bg-teal-500/20 selection:text-teal-900">
      {/* Left Column - Register Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex-1 flex flex-col justify-between px-6 sm:px-10 lg:px-14 py-8 order-1 min-h-screen overflow-y-auto"
      >
        {/* Brand Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-start items-center"
        >
          <BrandLogo size="md" variant="full" showTagline={false} linkTo="/landing" />
        </motion.div>

        {/* Center Card Content */}
        <div className="flex-1 flex items-center justify-center py-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-1.5">
              Create Account
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mb-7">
              Start your journey toward financial clarity and smart wealth building.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/15 rounded-2xl px-4 py-3 text-slate-900 text-sm focus:outline-none transition placeholder:text-slate-400 shadow-2xs"
                  placeholder="Nitesh Prajapati"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/15 rounded-2xl px-4 py-3 text-slate-900 text-sm focus:outline-none transition placeholder:text-slate-400 shadow-2xs"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">Min. 8 characters</span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-white hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/15 rounded-2xl px-4 py-3 pr-12 text-slate-900 text-sm focus:outline-none transition placeholder:text-slate-400 shadow-2xs"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1 cursor-pointer focus:outline-none"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  id="agree-terms"
                  type="checkbox"
                  required
                  checked={form.agreeTerms}
                  onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500 accent-teal-700 cursor-pointer"
                />
                <label
                  htmlFor="agree-terms"
                  className="text-xs text-slate-600 cursor-pointer select-none leading-relaxed"
                >
                  I agree to the{' '}
                  <span className="text-teal-700 font-bold hover:underline">Terms of Service</span>{' '}
                  and{' '}
                  <span className="text-teal-700 font-bold hover:underline">Privacy Policy</span>.
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-bold py-3.5 rounded-2xl transition shadow-md shadow-teal-900/15 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2 text-sm"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create ArthSetu AI Account</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </motion.button>
            </form>

            <p className="text-center mt-6 text-xs text-slate-500 font-medium">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-teal-700 font-bold hover:text-teal-800 transition underline-offset-4 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 pt-4 border-t border-slate-200/60 gap-2"
        >
          <span>© {new Date().getFullYear()} ArthSetu AI</span>
          <span className="font-semibold text-teal-800">Understand your money. Build your future.</span>
        </motion.div>
      </motion.div>

      {/* Right Column - Hero Showcase */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] order-2">
        <AuthHero headline="Understand your money." subheadline="Build your future." />
      </div>
    </div>
  );
};

export default Register;
