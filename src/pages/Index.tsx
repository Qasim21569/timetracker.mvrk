
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import DailyTrackTime from '@/components/DailyTrackTime';
import WeeklyTrackTime from '@/components/WeeklyTrackTime';
import MonthlyTrackTime from '@/components/MonthlyTrackTime';

type ViewType = 'daily' | 'weekly' | 'monthly';

const TrackTimePage = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ViewType>('daily');

  useEffect(() => {
    // Redirect admin users to User Management as default
    if (userRole === 'admin') {
      navigate('/users', { replace: true });
    }
  }, [userRole, navigate]);

  // Only render for non-admin users
  if (userRole === 'admin') {
    return null;
  }

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

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        {renderCurrentView()}
      </div>
    </MainLayout>
  );
};

export default TrackTimePage;
