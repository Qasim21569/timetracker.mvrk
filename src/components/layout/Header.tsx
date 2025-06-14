
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { Building, Home, Users, Briefcase, BarChart3, LogOut, Settings, ChevronDown } from 'lucide-react';

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
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md supports-[backdrop-filter]:bg-card/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo and Company Name */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 transition-smooth hover:opacity-80">
            <div className="relative">
              <Building className="h-8 w-8 text-primary" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary/20 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              TimeTracker
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant={location.pathname === item.href ? "default" : "ghost"}
              asChild
              className={`transition-smooth ${
                location.pathname === item.href 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "hover:bg-accent"
              }`}
            >
              <Link to={item.href} className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 h-12 px-3 transition-smooth hover:bg-accent rounded-xl">
                <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                  <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {currentUser.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-foreground">{currentUser.name}</span>
                  <span className="text-xs text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded-full">
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-card border-border shadow-lg rounded-xl p-2">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {currentUser.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-foreground truncate">{currentUser.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{currentUser.email}</span>
                </div>
              </div>
              <DropdownMenuSeparator className="my-2" />
              
              {/* Mobile Navigation */}
              <div className="md:hidden space-y-1">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.label} asChild className="rounded-lg">
                    <Link to={item.href} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="my-2" />
              </div>

              <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-lg">
                <Settings className="mr-3 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem 
                onClick={handleSignOut} 
                className="text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg"
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
