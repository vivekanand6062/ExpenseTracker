import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { styles } from '../assets/dummyStyles';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className={styles.layout.root}>
      {/* Top Navbar */}
      <Navbar
        onToggleMobileSidebar={() => setMobileSidebarOpen((prev) => !prev)}
      />

      {/* Responsive Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <main className={styles.layout.mainContainer(sidebarCollapsed)}>
        <div className="max-w-7xl mx-auto pb-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;