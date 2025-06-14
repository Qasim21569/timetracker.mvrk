
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const AdminTabs = () => {
  const location = useLocation();

  const tabs = [
    { name: 'User Management', path: '/users' },
    { name: 'Project Management', path: '/projects' },
    { name: 'Reports', path: '/reports' },
    { name: 'Track Time', path: '/' },
  ];

  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={cn(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              location.pathname === tab.path
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            {tab.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default AdminTabs;
