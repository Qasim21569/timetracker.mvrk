import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Edit, FileText } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
  tier: 'Admin' | 'User';
  hoursPerDay: number;
}

const dummyUsers: User[] = [
  { id: '1', name: 'Vuk Stajic', email: 'vuk@mvrk.ca', active: true, tier: 'Admin', hoursPerDay: 8 },
  { id: '2', name: 'Diego Oviedo', email: 'diego@mvrk.ca', active: true, tier: 'User', hoursPerDay: 8 },
  { id: '3', name: 'Pretend Person', email: 'pretend@mvrk.ca', active: false, tier: 'User', hoursPerDay: 8 },
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
    <Card>
      <div className="overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs md:text-sm">Name</TableHead>
              <TableHead className="text-xs md:text-sm">Email</TableHead>
              <TableHead className="text-xs md:text-sm">Status</TableHead>
              <TableHead className="text-xs md:text-sm">Tier</TableHead>
              <TableHead className="text-center text-xs md:text-sm">Hours Per Day</TableHead>
              <TableHead className="text-right text-xs md:text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium text-xs md:text-sm">
                  <div className="truncate max-w-[120px] md:max-w-none" title={user.name}>
                    {user.name}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs md:text-sm">
                  <div className="truncate max-w-[150px] md:max-w-none" title={user.email}>
                    {user.email}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.active ? "default" : "secondary"} className="text-xs">
                    {user.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.tier === 'Admin' ? "destructive" : "outline"} className="text-xs">
                    {user.tier}
                  </Badge>
                </TableCell>
                <TableCell className="text-center text-xs md:text-sm">{user.hoursPerDay}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 md:gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEditUser(user)}
                      className="h-8 w-8 p-0 md:h-9 md:w-9"
                    >
                      <Edit className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewReports(user)}
                      className="h-8 w-8 p-0 md:h-9 md:w-9"
                    >
                      <FileText className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default UserManagementTable;
