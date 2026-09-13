import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Tags,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  User,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import BrandLogo from './BrandLogo';

const MENU_ITEMS = [
  { text: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { text: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { text: 'Budgets', path: '/budgets', icon: Target },
  { text: 'Categories', path: '/categories', icon: Tags },
  { text: 'AI Advisor', path: '/ai-insights', icon: Sparkles, badge: 'AI' },
  { text: 'Income', path: '/income', icon: ArrowDownLeft },
  { text: 'Expenses', path: '/expense', icon: ArrowUpRight },
  { text: 'Profile', path: '/profile', icon: User },
];

const Sidebar = ({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [activeHover, setActiveHover] = useState(null);
  const { user, logout } = useAuth();

  const username = user?.name || 'User';
  const email = user?.email || 'user@example.com';
  const initial = username.charAt(0).toUpperCase();

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    if (setMobileOpen) setMobileOpen(false);
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => setIsCollapsed((c) => !c);

  const renderMenuItem = ({ text, path, icon: Icon, badge }) => {
    const isActive = pathname === path || (path === '/dashboard' && pathname === '/');
    return (
      <li key={text}>
        <Link
          to={path}
          onClick={() => setMobileOpen && setMobileOpen(false)}
          onMouseEnter={() => setActiveHover(text)}
          onMouseLeave={() => setActiveHover(null)}
          className={`relative group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl transition-all duration-200 text-xs sm:text-sm font-semibold ${
            isActive
              ? 'bg-teal-700 text-white shadow-md shadow-teal-900/15'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
          } ${isCollapsed ? 'justify-center px-2.5' : ''}`}
          title={isCollapsed ? text : undefined}
        >
          <Icon
            size={18}
            className={`shrink-0 transition-transform group-hover:scale-105 ${
              isActive ? 'text-white' : 'text-slate-500 group-hover:text-teal-700'
            }`}
          />
          {!isCollapsed && <span className="truncate">{text}</span>}

          {!isCollapsed && badge && (
            <span
              className={`ml-auto text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md ${
                isActive ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'
              }`}
            >
              {badge}
            </span>
          )}

          {activeHover === text && !isActive && !isCollapsed && (
            <motion.div
              layoutId="sidebarActiveIndicator"
              className="absolute left-0 top-2 bottom-2 w-1 bg-teal-600 rounded-r-full"
              transition={{ duration: 0.15 }}
            />
          )}
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-72 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between shadow-2xl lg:hidden"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-5 mb-4 border-b border-slate-100">
                <BrandLogo size="sm" variant="compact" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation */}
              <ul className="space-y-1.5">{MENU_ITEMS.map(renderMenuItem)}</ul>
            </div>

            {/* User Footer */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center gap-3 mb-3 p-2 rounded-2xl bg-[#fcfbf9] border border-slate-200/70">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-700 to-slate-900 text-white font-bold flex items-center justify-center shadow-xs text-sm">
                  {initial}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-800 truncate">{username}</p>
                  <p className="text-[11px] text-slate-400 truncate">{email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col justify-between fixed top-0 left-0 bottom-0 z-30 bg-white/95 backdrop-blur-xl border-r border-slate-200/80 transition-all duration-300 p-4 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div
            className={`flex items-center pb-5 pt-2 border-b border-slate-100 ${
              isCollapsed ? 'justify-center' : 'justify-start px-2'
            }`}
          >
            <BrandLogo
              size="sm"
              variant={isCollapsed ? 'icon' : 'compact'}
              linkTo="/dashboard"
            />
          </div>

          {/* Nav items */}
          <ul className="space-y-1 mt-4">{MENU_ITEMS.map(renderMenuItem)}</ul>
        </div>

        {/* Footer info & Collapse toggle */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          {/* User Profile Card */}
          <div
            className={`flex items-center gap-2.5 p-2 rounded-2xl bg-[#fcfbf9] border border-slate-200/70 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-teal-700 to-slate-900 text-white font-bold flex items-center justify-center shadow-xs shrink-0 text-xs">
              {initial}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">{username}</p>
                <p className="text-[10px] text-slate-400 truncate">{email}</p>
              </div>
            )}
          </div>

          {/* Controls: Logout & Collapse */}
          <div className={`flex items-center gap-1.5 ${isCollapsed ? 'flex-col' : 'justify-between'}`}>
            <button
              onClick={handleLogout}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer ${
                isCollapsed ? 'w-full justify-center' : ''
              }`}
              title="Sign Out"
            >
              <LogOut size={15} />
              {!isCollapsed && <span>Sign Out</span>}
            </button>

            <button
              onClick={toggleSidebar}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;