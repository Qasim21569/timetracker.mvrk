
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sidebar as ShadSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" // Assuming Avatar component exists
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Users, Briefcase, BarChart3, LogOut, Settings, Building } from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: '/', icon: Home, label: 'Track Time' },
  { href: '/projects', icon: Briefcase, label: 'Projects', adminOnly: true },
  { href: '/users', icon: Users, label: 'User Management', adminOnly: true },
  { href: '/reports', icon: BarChart3, label: 'Reports', adminOnly: true },
];

const AppSidebar = () => {
  const { currentUser, logout, userRole } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
  };

  if (!currentUser) return null;

  const filteredNavItems = navItems.filter(item => !item.adminOnly || userRole === 'admin');

  return (
    <ShadSidebar
      className="border-r bg-sidebar text-sidebar-foreground"
      collapsible="icon" // Or "offcanvas" or "none" based on preference
    >
      <SidebarHeader className="p-4">
        {/* Placeholder for Company Logo */}
        <Link to="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <Building className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary group-data-[collapsible=icon]:hidden">TimeTracker</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton asChild isActive={location.pathname === item.href} tooltip={item.label}>
                <Link to={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator />
      
      <SidebarFooter className="p-4 space-y-2">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium text-sidebar-foreground">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground">{currentUser.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{currentUser.role} Role</p>
          </div>
        </div>
        <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <LogOut className="mr-2 h-5 w-5 group-data-[collapsible=icon]:mr-0" />
          <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
        </Button>
         <Button variant="ghost" onClick={() => navigate('/settings')} className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <Settings className="mr-2 h-5 w-5 group-data-[collapsible=icon]:mr-0" />
          <span className="group-data-[collapsible=icon]:hidden">Settings</span>
        </Button>
      </SidebarFooter>
    </ShadSidebar>
  );
};

export default AppSidebar;
