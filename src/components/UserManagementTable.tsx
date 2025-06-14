
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

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
  return (
    <div className="border-2 border-gray-800 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-teal-700">
            <TableHead className="text-white font-bold border-r border-gray-300">Name</TableHead>
            <TableHead className="text-white font-bold border-r border-gray-300">Email</TableHead>
            <TableHead className="text-white font-bold border-r border-gray-300">Active</TableHead>
            <TableHead className="text-white font-bold border-r border-gray-300">Tier</TableHead>
            <TableHead className="text-white font-bold border-r border-gray-300">Hours Per Day</TableHead>
            <TableHead className="text-white font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dummyUsers.map((user, index) => (
            <TableRow key={user.id} className={index % 2 === 0 ? 'bg-gray-200' : 'bg-gray-300'}>
              <TableCell className="border-r border-gray-400 font-medium">{user.name}</TableCell>
              <TableCell className="border-r border-gray-400">{user.email}</TableCell>
              <TableCell className="border-r border-gray-400">
                <div className="flex justify-center">
                  <div className="w-6 h-6 border-2 border-black flex items-center justify-center bg-white">
                    {user.active ? '✓' : '✗'}
                  </div>
                </div>
              </TableCell>
              <TableCell className="border-r border-gray-400">{user.tier}</TableCell>
              <TableCell className="border-r border-gray-400 text-center">{user.hoursPerDay}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Button 
                    variant="link" 
                    className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                    onClick={() => onEditUser(user)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="link" 
                    className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                  >
                    View Reports
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagementTable;
