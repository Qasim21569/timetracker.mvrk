import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, BarChart3, Mail, Clock, Shield, User, Trash2 } from 'lucide-react';
import { userService } from '@/services/dataService';
import { User as UserType } from '@/data/dummyData';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface UserManagementTableProps {
  onEditUser: (user: UserType) => void;
  refreshTrigger?: number; // To trigger refresh from parent
}

const UserManagementTable = ({ onEditUser, refreshTrigger }: UserManagementTableProps) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Load users from localStorage
  useEffect(() => {
    loadUsers();
  }, [refreshTrigger]);

  const loadUsers = () => {
    const allUsers = userService.getAll();
    setUsers(allUsers);
  };

  // Sort users: Active users first (alphabetically), then Inactive users (alphabetically)
  const sortedUsers = [...users].sort((a, b) => {
    // First sort by role (admin first), then alphabetically by name
    if (a.role !== b.role) {
      return a.role === 'admin' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  const handleViewReports = (user: UserType) => {
    // Navigate to reports with specific user filter, all projects, current month
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const params = new URLSearchParams({
      user: user.name,
      project: 'All Projects',
      month: currentMonth
    });
    navigate(`/reports?${params.toString()}`);
  };

  const handleDeleteUser = async (userId: string) => {
    setIsDeleting(userId);
    try {
      const success = userService.delete(userId);
      if (success) {
        loadUsers(); // Refresh the list
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsDeleting(null);
    }
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
                      {user.title && (
                        <div className="text-xs text-slate-500 font-medium">{user.title}</div>
                      )}
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
                      status-indicator text-xs font-medium status-active
                    `}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    Active
                  </Badge>
                </TableCell>
                <TableCell className="text-xs md:text-sm">
                  <Badge 
                    variant={user.role === 'admin' ? 'default' : 'secondary'} 
                    className={`
                      ${user.role === 'admin' 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }
                    `}
                  >
                    {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-sm font-medium">
                      8h
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-9 w-9 p-0 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:shadow-soft transition-all duration-200 rounded-lg"
                          title="Delete User"
                          disabled={isDeleting === user.id}
                        >
                          <Trash2 className="h-4 w-4 text-slate-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete <strong>{user.name}</strong>? This action cannot be undone and will also remove all their time entries.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
