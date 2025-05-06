
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toaster } from '@/components/ui/sonner';

export function MainLayout() {
  const [isMounted, setIsMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if screen is mobile on mount and set sidebar state accordingly
    const checkIfMobile = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    
    checkIfMobile();
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Header />
        <main className="content-area p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
