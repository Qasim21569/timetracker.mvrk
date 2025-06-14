
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AdminTabs from '@/components/layout/AdminTabs';
import UserManagementTable from '@/components/UserManagementTable';
import AddUserForm from '@/components/AddUserForm';
import EditUserForm from '@/components/EditUserForm';
import { Button } from '@/components/ui/button';

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
        
        {currentView === 'table' && (
          <>
            <div className="flex justify-start">
              <Button
                onClick={handleAddUser}
                className="bg-gray-300 text-black border-2 border-gray-800 hover:bg-gray-400 font-medium"
              >
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
