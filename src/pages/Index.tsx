
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import DailyTrackTime from '@/components/DailyTrackTime';

const TrackTimePage = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();

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

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <DailyTrackTime />
      </div>
    </MainLayout>
  );
};

export default TrackTimePage;
