
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Users, Briefcase, BarChart3, Clock } from 'lucide-react';

const AdminTabs = () => {
  const location = useLocation();

  const tabs = [
    { name: 'User Management', path: '/users', icon: Users },
    { name: 'Project Management', path: '/projects', icon: Briefcase },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Track Time', path: '/', icon: Clock },
  ];

  return (
    <div className="border-b border-border bg-card rounded-t-xl">
      <nav className="flex space-x-1 px-6">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-all duration-200 rounded-t-lg",
              location.pathname === tab.path
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground hover:bg-muted/50"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default AdminTabs;
