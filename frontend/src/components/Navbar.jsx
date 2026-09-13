import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, User, LogOut, Menu, Sparkles, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/useAuth';
import BrandLogo from './BrandLogo';

const Navbar = ({ onToggleMobileSidebar, sidebarCollapsed }) => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:left-20' : 'lg:left-64'
      } left-0 px-4 sm:px-6 lg:px-8`}
    >
      <div className="h-full w-full flex items-center justify-between">
        {/* Left: Mobile Toggle & Desktop Date Display */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu size={22} />
          </button>

          {/* Mobile Brand Logo */}
          <div className="lg:hidden">
            <BrandLogo size="sm" variant="compact" linkTo="/dashboard" />
          </div>

          {/* Desktop Date badge - Cleanly offset from sidebar */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-500">
            <Calendar size={14} className="text-teal-700" />
            <span>Today is</span>
            <span className="font-bold text-slate-800">{todayFormatted}</span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Quick AI Advisor shortcut */}
          <button
            onClick={() => navigate('/ai-insights')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 text-xs font-bold border border-teal-200/70 transition shadow-2xs cursor-pointer"
          >
            <Sparkles size={14} className="text-teal-600" />
            <span>AI Advisor</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={toggleMenu}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl hover:bg-slate-100 transition cursor-pointer border border-transparent hover:border-slate-200/60"
            >
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-teal-700 to-slate-900 text-white text-xs font-extrabold flex items-center justify-center shadow-xs">
                {userInitial}
              </div>
              <span className="hidden md:inline text-xs font-bold text-slate-700 max-w-[120px] truncate">
                {user?.name || 'Account'}
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 overflow-hidden"
                >
                  <div className="px-3 py-2.5 mb-1 rounded-xl bg-[#fcfbf9] border border-slate-200/70">
                    <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>

                  <div className="space-y-0.5">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition cursor-pointer"
                    >
                      <User size={15} className="text-slate-400" />
                      <span>Profile & Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate('/ai-insights');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-teal-800 hover:bg-teal-50 rounded-xl transition cursor-pointer"
                    >
                      <Sparkles size={15} className="text-teal-600" />
                      <span>ArthSetu AI Insights</span>
                    </button>
                    <div className="my-1 border-t border-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;