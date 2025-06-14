import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AdminTabs from '@/components/layout/AdminTabs';
import UserManagementTable from '@/components/UserManagementTable';
import AddUserForm from '@/components/AddUserForm';
import EditUserForm from '@/components/EditUserForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
  tier: 'Admin' | 'User';
  hoursPerDay: number;
}

const UserManagementPage = () => {
  const [currentView, setCurrentView] = useState<'table' | 'add' | 'edit'>('table');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleAddUser = () => {
    setCurrentView('add');
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setCurrentView('edit');
  };

  const handleCloseForm = () => {
    setCurrentView('table');
    setSelectedUser(null);
  };

  return (
    <MainLayout>
      <div className="space-y-4 md:space-y-6">
        <AdminTabs />
        
        {currentView === 'table' && (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
                <p className="text-sm md:text-base text-muted-foreground">Manage user accounts and permissions</p>
              </div>
              <Button onClick={handleAddUser} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
            <UserManagementTable onEditUser={handleEditUser} />
          </>
        )}

        {currentView === 'add' && (
          <AddUserForm onClose={handleCloseForm} />
        )}

        {currentView === 'edit' && selectedUser && (
          <EditUserForm user={selectedUser} onClose={handleCloseForm} />
        )}
      </div>
    </MainLayout>
  );
};

export default UserManagementPage;
