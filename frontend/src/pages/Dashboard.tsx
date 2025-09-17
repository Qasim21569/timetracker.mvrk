import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import UserNavigation from '@/components/layout/UserNavigation';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { MonthlyChart } from '@/components/dashboard/MonthlyChart';
import { ProjectChart } from '@/components/dashboard/ProjectChart';
import { useAuth } from '@/contexts/AuthContext';
import { TimeTrackingService, ProjectService, ProjectAssignmentService } from '@/services/api';
import { TimeEntry, Project } from '@/data/dummyData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp } from 'lucide-react';

interface DashboardStats {
  todayHours: number;
  weekHours: number;
  monthHours: number;
  activeProjects: number;
  avgHoursPerDay: number;
  avgHoursPerWeek: number;
  workingDaysThisMonth: number;
}

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get date range for last 6 months to reduce data transfer
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const [entriesResponse, userProjectsResponse] = await Promise.all([
        TimeTrackingService.getAllTimeEntries({
          start_date: sixMonthsAgo.toISOString().split('T')[0],
          end_date: tomorrow.toISOString().split('T')[0] 
        }),
        ProjectAssignmentService.getUserProjects(currentUser.id)
      ]);

      console.log('📊 Dashboard Debug - Time Entries (last 6 months):', entriesResponse);
                    console.log('📊 Dashboard Debug - User Projects:', userProjectsResponse);
              console.log('📊 Dashboard Debug - Raw projects data:', userProjectsResponse.projects || (userProjectsResponse as any).data || []);
              
              setTimeEntries(entriesResponse);
              
              // Handle the API response structure: {success: true, data: [{project: {...}, assignment: {...}}, ...]}
              let projectsData = [];
              if (userProjectsResponse.success && userProjectsResponse.data && Array.isArray(userProjectsResponse.data)) {
                // Extract just the project objects from the assignment data
                projectsData = userProjectsResponse.data.map((item: any) => item.project);
              } else if (userProjectsResponse.projects && Array.isArray(userProjectsResponse.projects)) {
                projectsData = userProjectsResponse.projects;
              } else if (Array.isArray(userProjectsResponse)) {
                projectsData = userProjectsResponse;
              } else {
                console.error('🚨 Unexpected API response format:', userProjectsResponse);
                projectsData = [];
              }
              
              console.log('📊 Dashboard Debug - Final projects to set:', projectsData);
              setProjects(projectsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Optimized stats calculation using useMemo
  const stats = useMemo(() => {
    // Add safety checks for undefined arrays
    if (!timeEntries || !projects || timeEntries.length === 0 || projects.length === 0) {
      return {
        todayHours: 0,
        weekHours: 0,
        monthHours: 0,
        activeProjects: 0,
        avgHoursPerDay: 0,
        avgHoursPerWeek: 0,
        workingDaysThisMonth: 0
      };
    }

    console.log('🔍 calculateStats - Raw entries:', timeEntries);
    console.log('🔍 calculateStats - User assigned projects:', projects);
    
    const now = new Date();
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    //const startOfWeek = new Date(today);
    //startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Since we're already getting user-specific data from getUserProjects,
    // timeEntries should already be filtered to current user
    // Just use the entries directly
    const entriesToUse = timeEntries;
    console.log('🔍 Using entries for current user:', entriesToUse);

    // Calculate today's hours
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    const todayStr = now.getFullYear() + '-' +
                 String(now.getMonth() + 1).padStart(2, '0') + '-' +
                 String(now.getDate()).padStart(2, '0');
    
    const todayEntries = entriesToUse.filter(entry => entry.date === todayStr);
    const todayHours = todayEntries.reduce((sum, entry) => sum + entry.hours, 0);

    // Calculate this week's hours

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); 
    const startOfWeekStr = formatDate(startOfWeek);
    
    const weekEntries = entriesToUse.filter(entry => entry.date >= startOfWeekStr);
    const weekHours = weekEntries.reduce((sum, entry) => sum + entry.hours, 0);
    // Calculate this month's hours

    const startOfMonthStr = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));

    const monthEntries = entriesToUse.filter(entry => entry.date >= startOfMonthStr);
    const monthHours = monthEntries.reduce((sum, entry) => sum + entry.hours, 0);

    // Calculate active projects (projects worked on this month)
    const activeProjectIds = new Set(monthEntries.map(entry => {
      return (entry as any).project || entry.projectId;
    }));
    const activeProjects = activeProjectIds.size;

    // Calculate working days and averages
    const currentDayOfMonth = now.getDate();
    
    // Count working days (exclude weekends) in the month so far
    let workingDaysThisMonth = 0;
    for (let day = 1; day <= currentDayOfMonth; day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        workingDaysThisMonth++;
      }
    }

    // Calculate averages
    const avgHoursPerDay = currentDayOfMonth > 0 ? monthHours / currentDayOfMonth : 0;
    const avgHoursPerWeek = (currentDayOfMonth / 7) > 0 ? monthHours / (currentDayOfMonth / 7) : 0;

    
    console.log('📊 Final calculated stats:', {
      todayHours,
      weekHours,
      monthHours,
      activeProjects,
      avgHoursPerDay,
      avgHoursPerWeek,
      workingDaysThisMonth,
      totalEntries: timeEntries.length,
      entriesUsed: entriesToUse.length
    });

    return {
      todayHours,
      weekHours,
      monthHours,
      activeProjects,
      avgHoursPerDay,
      avgHoursPerWeek,
      workingDaysThisMonth
    };
  }, [timeEntries, projects]); // Only recalculate when data changes

  if (loading) {
    return (
      <MainLayout>
        <UserNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="space-y-2 mb-6">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
            
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            
            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* User Navigation */}
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

        {/* Stats Cards */}
        <StatsCards stats={stats} />

            {/* Charts Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Hours Chart */}
      <Card className="card-enhanced">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Daily Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlyChart timeEntries={timeEntries} projects={projects} />
        </CardContent>
      </Card>

      {/* Project Distribution Chart */}
      <Card className="card-enhanced">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-500" />
            Project Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectChart timeEntries={timeEntries} projects={projects} />
        </CardContent>
      </Card>
    </div>


      </div>
    </MainLayout>
  );
};

export default Dashboard;
