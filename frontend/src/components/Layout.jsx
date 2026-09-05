import React, { useState } from 'react';
import {styles} from '../assets/dummyStyles';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({onLogout,user}) => {
  const [sidebarCollapsed, setSidebarCollapsed]=useState(false);
  return (
    <div className={styles.layout.root}>
        <Navbar user={user} onLogout={onLogout}/>
        <Sidebar user={user} isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed}/>
        
    </div>
  )
}

export default Layout