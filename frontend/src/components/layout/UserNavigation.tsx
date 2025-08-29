import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const UserNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    {
      href: '/',
      label: 'Track Time',
      icon: Clock,
      description: 'Log your daily work hours'
    },
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'View your time tracking analytics'
    }
  ];

  return (
    <div className="bg-white border-b border-slate-200 mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200",
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default UserNavigation;
