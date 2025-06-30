import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { Building, Home, Users, Briefcase, BarChart3, LogOut, Settings, ChevronDown, Clock } from 'lucide-react';

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
  const navigate = useNavigate();
  const { currentUser, logout, userRole } = useAuth();
  const pageTitle = getPageTitle(location.pathname);

  const handleSignOut = () => {
    logout();
  };

  if (!currentUser) return null;

  const navItems = [
    { href: '/', icon: Home, label: 'Track Time' },
    ...(userRole === 'admin' ? [
      { href: '/projects', icon: Briefcase, label: 'Projects' },
      { href: '/users', icon: Users, label: 'User Management' },
      { href: '/reports', icon: BarChart3, label: 'Reports' },
    ] : [])
  ];

  return (
    <header className="sticky top-0 z-50 w-full header-glass shadow-soft">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo and Company Name - Enhanced */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg blur-md opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg shadow-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold gradient-text">TimeTracker</span>
          </Link>
        </div>

        {/* User Menu - Enhanced */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 h-12 px-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 rounded-xl">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
                  <Avatar className="h-9 w-9 ring-2 ring-blue-200 ring-offset-2">
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                      {currentUser.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-slate-700">{currentUser.name}</span>
                  <span className="text-xs text-slate-500 capitalize font-medium">{currentUser.role}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 glass-card p-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 mb-2">
                <Avatar className="h-10 w-10 ring-2 ring-blue-200">
                  <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                    {currentUser.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-700">{currentUser.name}</span>
                  <span className="text-xs text-slate-500">{currentUser.email}</span>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-slate-200" />
              
              {/* Mobile Navigation */}
              <div className="md:hidden">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.label} asChild className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg my-1">
                    <Link to={item.href} className="flex items-center gap-3 p-2">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-slate-200 my-2" />
              </div>

              <DropdownMenuItem 
                onClick={() => navigate('/settings')} 
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg my-1 p-2"
              >
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-200 my-2" />
              <DropdownMenuItem 
                onClick={handleSignOut} 
                className="text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 rounded-lg my-1 p-2"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
