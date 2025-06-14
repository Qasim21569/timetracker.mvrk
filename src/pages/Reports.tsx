
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AdminTabs from '@/components/layout/AdminTabs';
import ReportsInterface from '@/components/ReportsInterface';

const ReportsPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <AdminTabs />
        <div className="bg-card rounded-xl border border-border shadow-sm">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Reports</h1>
              <p className="text-muted-foreground mt-1">View comprehensive time tracking reports</p>
            </div>
            <ReportsInterface />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
