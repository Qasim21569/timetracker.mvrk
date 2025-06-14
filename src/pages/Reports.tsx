
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AdminTabs from '@/components/layout/AdminTabs';
import ReportsInterface from '@/components/ReportsInterface';

const ReportsPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <AdminTabs />
        <ReportsInterface />
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
