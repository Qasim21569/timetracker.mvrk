
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AdminTabs from '@/components/layout/AdminTabs';
import ProjectManagementTable from '@/components/ProjectManagementTable';
import AddProjectForm from '@/components/AddProjectForm';
import EditProjectForm from '@/components/EditProjectForm';
import { Button } from '@/components/ui/button';

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
        
        {currentView === 'table' && (
          <>
            <div className="flex justify-start">
              <Button
                onClick={handleAddProject}
                className="bg-gray-300 text-black border-2 border-gray-800 hover:bg-gray-400 font-medium"
              >
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
