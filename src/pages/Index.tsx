
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AdminTabs from '@/components/layout/AdminTabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Briefcase, Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StatCard = ({ title, value, icon: IconComponent, description }: { 
  title: string, 
  value: string, 
  icon: React.ElementType, 
  description: string 
}) => (
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
  const activeProjects = "3";
  const todaysHours = "5.5h";
  const remainingToday = "2.5h";

  return (
    <MainLayout>
      <div className="space-y-6">
        <AdminTabs />
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Track Time</h1>
            <p className="text-muted-foreground">Manage your daily time entries and track project hours</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Time Entry
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard 
            title="Active Projects" 
            value={activeProjects} 
            icon={Briefcase} 
            description="Projects you are currently assigned to" 
          />
          <StatCard 
            title="Today's Hours" 
            value={todaysHours} 
            icon={Clock} 
            description="Total hours logged today" 
          />
          <StatCard 
            title="Remaining Today" 
            value={remainingToday} 
            icon={Calendar} 
            description="Estimated hours left for today" 
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="daily" className="w-full">
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
              <TabsContent value="daily" className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No time entries yet</h3>
                  <p className="text-muted-foreground mb-4">Start tracking your time by adding your first entry</p>
                  <Button>Add Time Entry</Button>
                </div>
              </TabsContent>
              <TabsContent value="weekly" className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Weekly view</h3>
                  <p className="text-muted-foreground">Weekly time tracking coming soon</p>
                </div>
              </TabsContent>
              <TabsContent value="monthly" className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Monthly view</h3>
                  <p className="text-muted-foreground">Monthly time tracking coming soon</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TrackTimePage;
