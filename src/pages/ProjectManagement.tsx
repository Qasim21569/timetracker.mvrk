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
      <div className="space-y-4 md:space-y-6">
        <AdminTabs />
        
        {currentView === 'table' && (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Project Management</h1>
                <p className="text-sm md:text-base text-muted-foreground">Manage projects and assignments</p>
              </div>
              <Button onClick={handleAddProject} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>
            <ProjectManagementTable onEditProject={handleEditProject} />
          </>
        )}

        {currentView === 'add' && (
          <AddProjectForm onClose={handleCloseForm} />
        )}

        {currentView === 'edit' && selectedProject && (
          <EditProjectForm project={selectedProject} onClose={handleCloseForm} />
        )}
      </div>
    </MainLayout>
  );
};

export default ProjectManagementPage;
