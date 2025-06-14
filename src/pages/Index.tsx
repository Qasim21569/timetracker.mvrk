
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AdminTabs from '@/components/layout/AdminTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Briefcase, CalendarDays } from 'lucide-react';

// Placeholder StatCard component structure (will be moved to its own file later)
const StatCard = ({ title, value, icon: IconComponent, description }: { title: string, value: string, icon: React.ElementType, description: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <IconComponent className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const TrackTimePage = () => {
  // Dummy data for stat cards
  const activeProjects = "3";
  const todaysHours = "5.5h";
  const remainingToday = "2.5h";

  return (
    <MainLayout>
      <div className="space-y-6">
        <AdminTabs />
        
        <div className="border-4 border-blue-400 rounded-lg p-8 bg-blue-50">
          <div className="text-center">
            <p className="text-lg font-medium mb-4">
              NOTE: This interface will look identical to what is defined in the User Features section.
            </p>
            <p className="text-gray-600">
              The Track Time interface for admin will be the same as for regular users, 
              allowing admins to also track their time on projects.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Active Projects" value={activeProjects} icon={Briefcase} description="Projects you are currently assigned to" />
          <StatCard title="Today's Hours" value={todaysHours} icon={Clock} description="Total hours logged today" />
          <StatCard title="Remaining Today" value={remainingToday} icon={CalendarDays} description="Estimated hours left for today" />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Daily Time Entries</CardTitle>
            {/* Tabs for Daily/Weekly/Monthly will go here */}
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Time entry table and input form will be here.</p>
            {/* Placeholder for the time entry table */}
            <div className="mt-4 border rounded-lg p-8 text-center">
              <p className="text-lg">Time Entry Table Area</p>
              <p className="text-sm text-muted-foreground">Coming soon: Add and view your daily time logs.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TrackTimePage;
