
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AdminTabs from '@/components/layout/AdminTabs';
import ProjectManagementTable from '@/components/ProjectManagementTable';
import AddProjectForm from '@/components/AddProjectForm';
import EditProjectForm from '@/components/EditProjectForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  active: boolean;
  assignedUsers: string[];
}

const ProjectManagementPage = () => {
  const [currentView, setCurrentView] = useState<'table' | 'add' | 'edit'>('table');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleAddProject = () => {
    setCurrentView('add');
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('edit');
  };

  const handleCloseForm = () => {
    setCurrentView('table');
    setSelectedProject(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <AdminTabs />
        
        <div className="bg-card rounded-xl border border-border shadow-sm">
          {currentView === 'table' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Project Management</h1>
                  <p className="text-muted-foreground mt-1">Manage projects and assignments</p>
                </div>
                <Button onClick={handleAddProject} className="bg-primary hover:bg-primary/90 shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </div>
              <ProjectManagementTable onEditProject={handleEditProject} />
            </div>
          )}

          {currentView === 'add' && (
            <div className="p-6">
              <AddProjectForm onClose={handleCloseForm} />
            </div>
          )}

          {currentView === 'edit' && selectedProject && (
            <div className="p-6">
              <EditProjectForm project={selectedProject} onClose={handleCloseForm} />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ProjectManagementPage;
