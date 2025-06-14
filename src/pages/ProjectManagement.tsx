import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase, Zap, Pause, FolderOpen } from 'lucide-react';
import ProjectManagementTable from '@/components/ProjectManagementTable';
import MainLayout from '@/components/layout/MainLayout';
import AddProjectForm from '@/components/AddProjectForm';
import EditProjectForm from '@/components/EditProjectForm';
import AdminTabs from '@/components/layout/AdminTabs';

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
      <div className="space-y-6 md:space-y-8">
        <AdminTabs />
        
        {currentView === 'table' && (
          <>
            {/* Enhanced Header Section */}
            <div className="card-enhanced rounded-2xl p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2 rounded-xl shadow-lg">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold gradient-text">Project Management</h1>
                  </div>
                  <p className="text-base md:text-lg text-slate-600 max-w-2xl">
                    Organize and manage your projects, assign team members, and track progress efficiently.
                  </p>
                  
                  {/* Quick Stats */}
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">2 Active Projects</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      <span className="text-sm text-slate-600">1 Inactive Project</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-3 h-3 text-amber-500" />
                      <span className="text-sm text-slate-600">8 Total Assignments</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleAddProject} 
                  className="btn-gradient w-full sm:w-auto px-6 py-3 text-base font-medium"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Project
                </Button>
              </div>
            </div>

            {/* Enhanced Table Container */}
            <div className="card-enhanced rounded-2xl overflow-hidden shadow-soft">
              <ProjectManagementTable onEditProject={handleEditProject} />
            </div>
          </>
        )}

        {currentView === 'add' && (
          <div className="card-enhanced rounded-2xl p-6 md:p-8">
            <AddProjectForm onClose={handleCloseForm} />
          </div>
        )}

        {currentView === 'edit' && selectedProject && (
          <div className="card-enhanced rounded-2xl p-6 md:p-8">
            <EditProjectForm project={selectedProject} onClose={handleCloseForm} />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProjectManagementPage;
