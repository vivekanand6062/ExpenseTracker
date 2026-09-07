import { useEffect, useRef, useState } from 'react';
import { sidebarStyles, cn } from '../assets/dummyStyles';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, LayoutDashboard, User, LogOut, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/useAuth';

const MENU_ITEMS = [
  { text: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
  { text: 'Income', path: '/income', icon: <ArrowUp size={20} /> },
  { text: 'Expenses', path: '/expense', icon: <ArrowDown size={20} /> },
  { text: 'Profile', path: '/profile', icon: <User size={20} /> },
];

const Sidebar = ({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
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

  const renderDesktopMenuItem = ({ text, path, icon }) => {
    const isActive = pathname === path;
    return (
      <motion.li key={text} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link
          to={path}
          className={cn(
            sidebarStyles.menuItem.base,
            isActive ? sidebarStyles.menuItem.active : sidebarStyles.menuItem.inactive,
            isCollapsed ? sidebarStyles.menuItem.collapsed : sidebarStyles.menuItem.expanded
          )}
          onMouseEnter={() => setActiveHover(text)}
          onMouseLeave={() => setActiveHover(null)}
          title={isCollapsed ? text : undefined}
        >
          <span className={isActive ? sidebarStyles.menuIcon.active : sidebarStyles.menuIcon.inactive}>
            {icon}
          </span>
          {!isCollapsed && (
            <span className="truncate">{text}</span>
          )}
          {activeHover === text && !isActive && !isCollapsed && (
            <span className={sidebarStyles.activeIndicator}></span>
          )}
        </Link>
      </motion.li>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        ref={sidebarRef}
        className={sidebarStyles.sidebarContainer.base}
        initial={{ x: -60, opacity: 0 }}
        animate={{
          x: 0,
          opacity: 1,
          width: isCollapsed ? 80 : 256,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className={sidebarStyles.sidebarInner.base}>
          {/* Collapse/Expand Toggle Button */}
          <button
            onClick={toggleSidebar}
            className={sidebarStyles.toggleButton.base}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* User Profile Header in Sidebar */}
          <div
            className={cn(
              sidebarStyles.userProfileContainer.base,
              isCollapsed
                ? sidebarStyles.userProfileContainer.collapsed
                : sidebarStyles.userProfileContainer.expanded
            )}
          >
            <div className="flex items-center gap-3">
              <div className={sidebarStyles.userInitials.base}>{initial}</div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">{username}</h3>
                  <p className="text-xs text-gray-500 truncate">{email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className={sidebarStyles.menuList.base}>
              {MENU_ITEMS.map(renderDesktopMenuItem)}
            </ul>
          </nav>

          {/* Footer Section with Logout */}
          <div
            className={cn(
              sidebarStyles.footerContainer.base,
              isCollapsed
                ? sidebarStyles.footerContainer.collapsed
                : sidebarStyles.footerContainer.expanded
            )}
          >
            <button
              onClick={handleLogout}
              className={cn(
                sidebarStyles.logoutButton.base,
                isCollapsed && sidebarStyles.logoutButton.collapsed
              )}
              title={isCollapsed ? 'Logout' : undefined}
            >
              <LogOut size={18} />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <div className={sidebarStyles.mobileOverlay}>
            <motion.div
              className={sidebarStyles.mobileBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className={sidebarStyles.mobileSidebar.base}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            >
              {/* Mobile Drawer Header */}
              <div className="p-5 flex justify-between items-center border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={sidebarStyles.userInitials.base}>{initial}</div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm truncate">{username}</h3>
                    <p className="text-xs text-gray-500 truncate">{email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="p-4 space-y-1 overflow-y-auto">
                {MENU_ITEMS.map(({ text, path, icon }) => {
                  const isActive = pathname === path;
                  return (
                    <Link
                      key={text}
                      to={path}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors',
                        isActive
                          ? 'text-teal-600 bg-teal-50'
                          : 'text-gray-600 hover:bg-gray-50'
                      )}
                    >
                      <span className={isActive ? 'text-teal-600' : 'text-gray-500'}>
                        {icon}
                      </span>
                      <span>{text}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;