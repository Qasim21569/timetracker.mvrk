import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Users, Briefcase, BarChart3, Clock } from 'lucide-react';

const AdminTabs = () => {
  const location = useLocation();

  const tabs = [
    { name: 'User Management', path: '/users', icon: Users, gradient: 'from-blue-500 to-purple-500' },
    { name: 'Project Management', path: '/projects', icon: Briefcase, gradient: 'from-emerald-500 to-teal-500' },
    { name: 'Reports', path: '/reports', icon: BarChart3, gradient: 'from-purple-500 to-pink-500' },
    { name: 'Track Time', path: '/', icon: Clock, gradient: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="card-enhanced rounded-2xl p-4 md:p-6 mb-6">
      <nav className="flex flex-wrap gap-2 md:gap-4">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 border",
                isActive
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg shadow-blue-500/25 border-transparent transform scale-105`
                  : "bg-white/60 text-slate-600 border-slate-200 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 hover:border-blue-200 hover:text-slate-800 hover:shadow-soft"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-lg transition-colors duration-300",
                isActive 
                  ? "bg-white/20" 
                  : "bg-slate-100 group-hover:bg-blue-100"
              )}>
                <Icon className={cn(
                  "h-4 w-4 transition-colors duration-300",
                  isActive 
                    ? "text-white" 
                    : "text-slate-500 group-hover:text-blue-600"
                )} />
              </div>
              <span className="hidden sm:inline font-semibold">
                {tab.name}
              </span>
              <span className="sm:hidden font-semibold">
                {tab.name.split(' ')[0]}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminTabs; 