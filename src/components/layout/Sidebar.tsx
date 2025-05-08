import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Home,
  FileText,
  CreditCard,
  Upload,
  Bell,
  Settings,
  Menu,
  X,
  LogOut,
  MessageSquare,
  ChevronLeft,
  FileClock
} from 'lucide-react';
import { useSelector } from 'react-redux';

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  const { user } = useSelector((state: any) => state.user) || {};
  const isKycVerified = user?.kycStatus == "VERIFIED" || false;

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Define all possible navigation items
  const allNavItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: FileClock },
    { name: 'Mandates', path: '/bank-mandates/', icon: CreditCard },
    // { name: 'Notifications', path: '/notifications', icon: Bell },
    // { name: 'Settings', path: '/settings', icon: Settings },
  ];


  const getNavItems = () => {
    // If user is null, only show Home
    if (!user || user.role !== "BANK") {
      return allNavItems.filter((item) => item.name === "Home");
    }

  
    return allNavItems;

  };

  const navItems = getNavItems();



  return (
    <>
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={toggleSidebar}
      >
        {collapsed ? <Menu /> : <X />}
      </Button>

      <aside className={cn(
        "fixed top-0 left-0 z-40 h-full transition-all duration-300 bg-background border-r border-border shadow-sm",
        collapsed ? (isMobile ? "-translate-x-full" : "w-16") : (isMobile ? "w-64" : "w-64"),
        isMobile ? "lg:translate-x-0" : "",
        className
      )}>
        <div className="flex flex-col h-full">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                A
              </div>
              {!collapsed || isMobile ? <h1 className="text-xl font-bold">Autonance</h1> : null}
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors",
                    location.pathname === item.path && "bg-muted font-medium",
                    collapsed && !isMobile ? "justify-center" : ""
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {!collapsed || isMobile ? <span>{item.name}</span> : null}
                </Link>
              ))}
            </nav>
          </div>


          {/* Collapse/Expand Button (only visible on desktop) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="absolute -right-3 top-16 bg-background border border-border rounded-full shadow-sm hidden lg:flex"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed ? "rotate-180" : "")} />
          </Button>
        </div>
      </aside>
    </>
  );
}