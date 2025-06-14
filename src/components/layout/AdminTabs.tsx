
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const AdminTabs = () => {
  const location = useLocation();

  const tabs = [
    { name: 'User Management', path: '/users', color: 'bg-blue-200' },
    { name: 'Project Management', path: '/projects', color: 'bg-blue-200' },
    { name: 'Reports', path: '/reports', color: 'bg-green-200' },
    { name: 'Track Time', path: '/', color: 'bg-green-200' },
  ];

  const getActiveColor = (path: string) => {
    if (location.pathname === path) {
      return path === '/reports' || path === '/' ? 'bg-green-400' : 'bg-green-400';
    }
    return path === '/reports' || path === '/' ? 'bg-green-200' : 'bg-blue-200';
  };

  return (
    <div className="flex gap-4 mb-6">
      {tabs.map((tab) => (
        <Link
          key={tab.path}
          to={tab.path}
          className={cn(
            "px-6 py-3 rounded-lg border-2 border-gray-800 font-medium text-gray-800 transition-colors",
            getActiveColor(tab.path)
          )}
        >
          {tab.name}
        </Link>
      ))}
    </div>
  );
};

export default AdminTabs;
