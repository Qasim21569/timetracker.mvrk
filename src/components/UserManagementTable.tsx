import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, BarChart3, Mail, Clock, Shield, User } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
  tier: 'Admin' | 'User';
  hoursPerDay: number;
}

const dummyUsers: User[] = [
  { id: '1', name: 'Diego Oviedo', email: 'diego@mvrk.ca', active: true, tier: 'Admin', hoursPerDay: 8 },
  { id: '2', name: 'Vuk Stajic', email: 'vuk@mvrk.ca', active: true, tier: 'User', hoursPerDay: 8 },
  { id: '3', name: 'Pretend Person', email: 'pretend@mvrk.ca', active: false, tier: 'User', hoursPerDay: 6 },
];

interface UserManagementTableProps {
  onEditUser: (user: User) => void;
}

const UserManagementTable = ({ onEditUser }: UserManagementTableProps) => {
  const navigate = useNavigate();

  // Sort users: Active users first (alphabetically), then Inactive users (alphabetically)
  const sortedUsers = [...dummyUsers].sort((a, b) => {
    // First sort by active status (active first)
    if (a.active !== b.active) {
      return a.active ? -1 : 1;
    }
    // Then sort alphabetically by name
    return a.name.localeCompare(b.name);
  });

  const handleViewReports = (user: User) => {
    // Navigate to reports with specific user filter, all projects, current month
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const params = new URLSearchParams({
      user: user.name,
      project: 'All Projects',
      month: currentMonth
    });
    navigate(`/reports?${params.toString()}`);
  };

  return (
    <div className="table-enhanced">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
              <TableHead className="text-xs md:text-sm min-w-[140px] font-semibold text-slate-700 py-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Name
                </div>
              </TableHead>
              <TableHead className="text-xs md:text-sm min-w-[180px] font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
              </TableHead>
              <TableHead className="text-xs md:text-sm min-w-[100px] font-semibold text-slate-700">
                Status
              </TableHead>
              <TableHead className="text-xs md:text-sm min-w-[80px] font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Tier
                </div>
              </TableHead>
              <TableHead className="text-xs md:text-sm min-w-[100px] font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Hours/Day
                </div>
              </TableHead>
              <TableHead className="text-right text-xs md:text-sm min-w-[120px] font-semibold text-slate-700">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map((user, index) => (
              <TableRow 
                key={user.id} 
                className={`
                  table-row-enhanced border-b border-slate-100 group
                  ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                `}
              >
                <TableCell className="font-medium text-xs md:text-sm py-4">
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm
                      ${user.active 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500' 
                        : 'bg-gradient-to-br from-slate-400 to-slate-500'
                      }
                    `}>
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{user.name}</div>
                      <div className="text-xs text-slate-500 md:hidden">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs md:text-sm hidden md:table-cell">
                  <div className="text-slate-600">{user.email}</div>
                </TableCell>
                <TableCell>
                  <Badge 
                    className={`
                      status-indicator text-xs font-medium
                      ${user.active ? 'status-active' : 'status-inactive'}
                    `}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                    {user.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs md:text-sm">
                  <Badge 
                    variant={user.tier === 'Admin' ? 'default' : 'secondary'} 
                    className={`
                      ${user.tier === 'Admin' 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }
                    `}
                  >
                    {user.tier === 'Admin' && <Shield className="w-3 h-3 mr-1" />}
                    {user.tier}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-sm font-medium">
                      {user.hoursPerDay}h
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 md:gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEditUser(user)}
                      className="h-9 w-9 p-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-soft transition-all duration-200 rounded-lg"
                      title="Edit User"
                    >
                      <Edit className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewReports(user)}
                      className="h-9 w-9 p-0 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:shadow-soft transition-all duration-200 rounded-lg"
                      title="View Reports"
                    >
                      <BarChart3 className="h-4 w-4 text-slate-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagementTable;
