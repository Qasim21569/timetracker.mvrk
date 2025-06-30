import React, { useState } from 'react';
import { Calendar, BarChart3, TrendingUp, Users, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MainLayout from '@/components/layout/MainLayout';
import AdminTabs from '@/components/layout/AdminTabs';
import ReportsInterface from '@/components/ReportsInterface';

const ReportsPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6 md:space-y-8">
        <AdminTabs />
        
        <div className="card-enhanced rounded-2xl overflow-hidden shadow-soft">
          <ReportsInterface />
        </div>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
