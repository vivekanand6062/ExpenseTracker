import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/useAuth.js';
import AuthHero from '../components/AuthHero.jsx';
import Spinner from '../components/Spinner.jsx';
import BrandLogo from '../components/BrandLogo.jsx';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fillDemoCredentials = () => {
    setForm({
      email: 'demo@arthsetu.ai',
      password: 'demoPassword123',
    });
    toast.success('ArthSetu AI demo credentials loaded!');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form.email, form.password);
      if (res && res.success === false) {
        toast.error(res.message || 'Authentication failed');
        return;
      }
      toast.success('Welcome back to ArthSetu AI!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#fcfbf9] font-sans selection:bg-teal-500/20 selection:text-teal-900">
      {/* Left Column - Login Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex-1 flex flex-col justify-between px-6 sm:px-10 lg:px-14 py-8 order-1 min-h-screen"
      >
        {/* Brand Logo Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-start items-center"
        >
          <BrandLogo size="md" variant="full" showTagline={false} linkTo="/landing" />
        </motion.div>

        {/* Center Card Content */}
        <div className="flex-1 flex items-center justify-center py-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-1.5">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Sign In
              </h1>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200/80 transition cursor-pointer shadow-2xs active:scale-95"
                title="Auto-fill demo credentials"
              >
                <Sparkles size={13} className="text-teal-600" />
                <span>Fill Demo</span>
              </button>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mb-8">
              Access your financial command center & AI insights.
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
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

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-bold py-3.5 rounded-2xl transition shadow-md shadow-teal-900/15 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to ArthSetu AI</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </motion.button>

              {/* Demo Account Divider & Instant Access */}
              <div className="relative pt-2 pb-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#fcfbf9] px-3 text-slate-400 font-semibold text-[11px]">
                    Or explore instantly
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={fillDemoCredentials}
                className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-teal-50/50 active:bg-teal-100/50 text-teal-800 font-bold py-3.5 rounded-2xl transition border border-teal-300/70 shadow-2xs cursor-pointer text-xs sm:text-sm"
              >
                <Sparkles size={15} className="text-teal-600" />
                <span>Fill Demo Account Credentials</span>
              </motion.button>
            </form>

            <p className="text-center mt-7 text-xs text-slate-500 font-medium">
              New to ArthSetu AI?{' '}
              <Link
                to="/register"
                className="text-teal-700 font-bold hover:text-teal-800 transition underline-offset-4 hover:underline"
              >
                Create your account
              </Link>
            </p>
          </motion.div>
        </div>

        {/* Footer Info */}
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

      {/* Right Column - Brand Showcase Hero */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] order-2">
        <AuthHero headline="Understand your money." subheadline="Build your future." />
      </div>
    </div>
  );
};

export default Login;
