
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
      <div className="space-y-6">
        <AdminTabs />
        
        <div className="bg-card rounded-xl border border-border shadow-sm">
          {currentView === 'table' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                  <p className="text-muted-foreground mt-1">Manage user accounts and permissions</p>
                </div>
                <Button onClick={handleAddUser} className="bg-primary hover:bg-primary/90 shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
              <UserManagementTable onEditUser={handleEditUser} />
            </div>
          )}

          {currentView === 'add' && (
            <div className="p-6">
              <AddUserForm onClose={handleCloseForm} />
            </div>
          )}

          {currentView === 'edit' && selectedUser && (
            <div className="p-6">
              <EditUserForm user={selectedUser} onClose={handleCloseForm} />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default UserManagementPage;
