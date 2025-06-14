
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const ProjectManagementPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Project Management</h2>
           <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Project
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Project List</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">A table displaying all projects will appear here.</p>
             <div className="mt-4 border rounded-lg p-8 text-center">
              <p className="text-lg">Project Table Area</p>
              <p className="text-sm text-muted-foreground">Coming soon: Manage projects, assign users.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ProjectManagementPage;
