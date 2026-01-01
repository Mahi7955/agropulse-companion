import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Calculator, 
  Settings, 
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import Logo from './Logo';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardNavProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const DashboardNav: React.FC<DashboardNavProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/markets', icon: TrendingUp, label: 'Markets' },
    { path: '/expenses', icon: Calculator, label: 'Expenses' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <Logo size="sm" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-sidebar z-40 transform transition-transform duration-300
        lg:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8 hidden lg:block">
            <Logo size="md" />
          </div>
          <div className="mb-8 lg:hidden pt-16">
            <Logo size="md" />
          </div>

          {/* User Info */}
          <div className="bg-sidebar-accent rounded-xl p-4 mb-6">
            <p className="text-sidebar-foreground font-semibold truncate">{user?.name}</p>
            <p className="text-sidebar-foreground/60 text-sm truncate">{user?.email}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive(item.path) 
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    }
                  `}
                >
                  <Icon size={22} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-danger mt-4"
            onClick={logout}
          >
            <LogOut size={22} />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default DashboardNav;
