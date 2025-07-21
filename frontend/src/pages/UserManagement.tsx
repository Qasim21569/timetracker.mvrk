import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AdminTabs from '@/components/layout/AdminTabs';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import UserManagementTable from '@/components/UserManagementTable';
import AddUserForm from '@/components/AddUserForm';
import EditUserForm from '@/components/EditUserForm';
import { UserService, ApiError } from '@/services/api';
import { User } from '@/data/dummyData';

const UserManagementPage = () => {
  const [currentView, setCurrentView] = useState<'table' | 'add' | 'edit'>('table');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userStats, setUserStats] = useState({ active: 0, total: 0 });

  // Load user statistics
  useEffect(() => {
    const loadUserStats = async () => {
      try {
        // Only count active users
        const users = await UserService.getAllUsers({ is_active: true });
    const adminUsers = users.filter(user => user.role === 'admin');
    setUserStats({
      active: users.length,
      total: adminUsers.length
    });
      } catch (error) {
        console.error('Error loading user stats:', error);
        // Set default stats on error
        setUserStats({ active: 0, total: 0 });
      }
    };

    loadUserStats();
  }, [refreshTrigger]);

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

  const handleUserAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('table');
  };

  const handleUserUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('table');
  };

  return (
    <MainLayout>
      <div className="space-y-6 md:space-y-8">
        <AdminTabs />
        
        <div className="card-enhanced rounded-2xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold gradient-text">User Management</h1>
              </div>
              <p className="text-base md:text-lg text-slate-600 max-w-2xl">
                Manage user accounts, permissions, and access controls for your team members.
              </p>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">{userStats.active} Total Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">{userStats.total} Admin Users</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleAddUser} 
              className="btn-gradient w-full sm:w-auto px-6 py-3 text-base font-medium"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New User
            </Button>
          </div>
        </div>

        {currentView === 'table' && (
          <>
            {/* Enhanced Table Container */}
            <div className="card-enhanced rounded-2xl overflow-hidden shadow-soft">
              <UserManagementTable 
                onEditUser={handleEditUser} 
                refreshTrigger={refreshTrigger}
              />
            </div>
          </>
        )}

        {currentView === 'add' && (
          <div className="card-enhanced rounded-2xl p-6 md:p-8">
            <AddUserForm 
              onClose={handleCloseForm}
              onUserAdded={handleUserAdded}
            />
          </div>
        )}

        {currentView === 'edit' && selectedUser && (
          <div className="card-enhanced rounded-2xl p-6 md:p-8">
            <EditUserForm 
              user={selectedUser} 
              onClose={handleCloseForm}
              onUserUpdated={handleUserUpdated}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default UserManagementPage;
