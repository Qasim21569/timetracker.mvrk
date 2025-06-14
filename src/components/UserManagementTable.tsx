
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead className="text-center">Hours Per Day</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="text-muted-foreground">{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.active ? "default" : "secondary"}>
                  {user.active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.tier === 'Admin' ? "destructive" : "outline"}>
                  {user.tier}
                </Badge>
              </TableCell>
              <TableCell className="text-center">{user.hoursPerDay}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEditUser(user)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewReports(user)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default UserManagementTable;
