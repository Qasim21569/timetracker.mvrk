
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar'; // From shadcn/ui sidebar
import { useLocation } from 'react-router-dom';

const getPageTitle = (pathname: string): string => {
  if (pathname === '/') return 'Track Time';
  if (pathname.startsWith('/users')) return 'User Management';
  if (pathname.startsWith('/projects')) return 'Project Management';
  if (pathname.startsWith('/reports')) return 'Reports';
  if (pathname.startsWith('/settings')) return 'Settings';
  return 'Dashboard';
};

const AppHeader = () => {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <SidebarTrigger className="md:hidden" /> {/* Only show trigger on mobile for shadcn sidebar */}
      <div className="flex-1">
        <h1 className="text-xl font-semibold">{pageTitle}</h1>
      </div>
      {/* Add other header elements here, e.g., user menu, notifications */}
    </header>
  );
};

export default AppHeader;
