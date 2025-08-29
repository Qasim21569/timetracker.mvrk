// Optimized Dashboard Implementation Example

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

// Optimized Service Layer
class OptimizedDashboardService {
  static async getStats(month?: string): Promise<DashboardStats> {
    const params = month ? `?month=${month}` : '';
    return apiClient.get(`/dashboard/stats/${params}`);
  }

  static async getChartData(type: 'daily' | 'projects', month?: string) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (month) params.append('month', month);
    
    return apiClient.get(`/dashboard/chart-data/?${params.toString()}`);
  }
}

// Optimized Dashboard Component
const OptimizedDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  // Optimized data fetching with caching
  const { 
    data: stats, 
    isLoading: statsLoading,
    error: statsError 
  } = useQuery({
    queryKey: ['dashboard-stats', currentUser?.id, selectedMonth],
    queryFn: () => OptimizedDashboardService.getStats(selectedMonth),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!currentUser
  });

  const { 
    data: dailyChartData, 
    isLoading: dailyLoading 
  } = useQuery({
    queryKey: ['dashboard-daily-chart', currentUser?.id, selectedMonth],
    queryFn: () => OptimizedDashboardService.getChartData('daily', selectedMonth),
    staleTime: 5 * 60 * 1000,
    enabled: !!currentUser
  });

  const { 
    data: projectChartData, 
    isLoading: projectLoading 
  } = useQuery({
    queryKey: ['dashboard-project-chart', currentUser?.id, selectedMonth],
    queryFn: () => OptimizedDashboardService.getChartData('projects', selectedMonth),
    staleTime: 5 * 60 * 1000,
    enabled: !!currentUser
  });

  // Loading skeleton
  if (statsLoading) {
    return (
      <MainLayout>
        <UserNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <DashboardSkeleton />
        </div>
      </MainLayout>
    );
  }

  // Error handling
  if (statsError) {
    return (
      <MainLayout>
        <UserNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ErrorBoundary error="Failed to load dashboard data" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <UserNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold gradient-text">
            Welcome back, {(currentUser as any)?.first_name || currentUser?.email}! 👋
          </h1>
          <p className="text-slate-600">
            Here's an overview of your time tracking activity
          </p>
        </div>

        {/* Stats Cards - Always show with data */}
        <StatsCards stats={stats} />

        {/* Charts Section with individual loading states */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Chart */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Daily Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dailyLoading ? (
                <ChartSkeleton />
              ) : (
                <OptimizedDailyChart 
                  data={dailyChartData} 
                  selectedMonth={selectedMonth}
                  onMonthChange={setSelectedMonth}
                />
              )}
            </CardContent>
          </Card>

          {/* Project Chart */}
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                Project Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projectLoading ? (
                <ChartSkeleton />
              ) : (
                <OptimizedProjectChart 
                  data={projectChartData}
                  selectedMonth={selectedMonth}
                  onMonthChange={setSelectedMonth}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

// Loading Skeleton Components
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="h-8 bg-gray-200 rounded animate-pulse" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-96 bg-gray-200 rounded animate-pulse" />
      <div className="h-96 bg-gray-200 rounded animate-pulse" />
    </div>
  </div>
);

const ChartSkeleton = () => (
  <div className="h-80 bg-gray-100 rounded animate-pulse" />
);

// Error Boundary Component
const ErrorBoundary = ({ error }: { error: string }) => (
  <div className="text-center py-12">
    <div className="text-6xl mb-4">⚠️</div>
    <h2 className="text-xl font-semibold text-gray-900 mb-2">
      Something went wrong
    </h2>
    <p className="text-gray-600 mb-4">{error}</p>
    <button 
      onClick={() => window.location.reload()} 
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Retry
    </button>
  </div>
);

export default OptimizedDashboard;
