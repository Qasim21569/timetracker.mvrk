import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AdminTabs from '@/components/layout/AdminTabs';
import { useAuth } from '@/contexts/AuthContext';
import DailyTrackTime from '@/components/DailyTrackTime';
import WeeklyTrackTime from '@/components/WeeklyTrackTime';
import MonthlyTrackTime from '@/components/MonthlyTrackTime';

type ViewType = 'daily' | 'weekly' | 'monthly';

const TimeTrackingPage = () => {
  const { userRole, currentUser } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('daily');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'daily':
        return <DailyTrackTime onViewChange={setCurrentView} />;
      case 'weekly':
        return <WeeklyTrackTime onViewChange={setCurrentView} />;
      case 'monthly':
        return <MonthlyTrackTime onViewChange={setCurrentView} />;
      default:
        return <DailyTrackTime onViewChange={setCurrentView} />;
    }
  };

  // For admin users, use the same layout structure as other admin pages
  if (userRole === 'admin') {
    return (
      <MainLayout>
        <div className="space-y-6 md:space-y-8">
          <AdminTabs />
          
          <div className="card-enhanced rounded-2xl p-6 md:p-8">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold gradient-text">MVRK Time Tracker</h1>
              <p className="text-base md:text-lg text-slate-600 max-w-2xl">
                Track your personal work hours, {currentUser?.name}
              </p>
            </div>
          </div>

          {/* Time tracking component - same view as regular users */}
          <div className="max-w-7xl mx-auto">
            {renderCurrentView()}
          </div>
        </div>
      </MainLayout>
    );
  }

  // For regular users, use the original simpler layout
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header indicating this is personal time tracking */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
MVRK Time Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your work hours, {currentUser?.name}
          </p>
        </div>
        
        {renderCurrentView()}
      </div>
    </MainLayout>
  );
};

export default TimeTrackingPage;
