import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase, FolderOpen } from 'lucide-react';
import ProjectManagementTable from '@/components/ProjectManagementTable';
import MainLayout from '@/components/layout/MainLayout';
import AddProjectForm from '@/components/AddProjectForm';
import EditProjectForm from '@/components/EditProjectForm';
import AdminTabs from '@/components/layout/AdminTabs';
import { ProjectService, UserService, ApiError } from '@/services/api';
import { Project } from '@/data/dummyData';

const ProjectManagementPage = () => {
  const [currentView, setCurrentView] = useState<'table' | 'add' | 'edit'>('table');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [projectStats, setProjectStats] = useState({ active: 0, totalAssignments: 0 });

  // Load project statistics
  useEffect(() => {
    const loadProjectStats = async () => {
      try {
        const projects = await ProjectService.getAllProjects();
        // Calculate total assignments by summing assigned user IDs across all projects
        const totalAssignments = projects.reduce((sum, project) => {
          return sum + ((project as any).assigned_user_ids?.length || 0);
        }, 0);
        
    setProjectStats({
          active: projects.length, // All projects fetched are considered active
      totalAssignments: totalAssignments
    });
      } catch (error) {
        console.error('Error loading project stats:', error);
        // Set default stats on error
        setProjectStats({ active: 0, totalAssignments: 0 });
      }
    };

    loadProjectStats();
  }, [refreshTrigger]);

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

  const handleProjectAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('table');
  };

  const handleProjectUpdated = () => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView('table');
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
                      <span className="text-sm text-slate-600">{projectStats.active} Active Projects</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-3 h-3 text-amber-500" />
                      <span className="text-sm text-slate-600">{projectStats.totalAssignments} Total Assignments</span>
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
              <ProjectManagementTable 
                onEditProject={handleEditProject} 
                refreshTrigger={refreshTrigger}
              onProjectDeleted={() => setRefreshTrigger(prev => prev + 1)}
              />
            </div>
          </>
        )}

        {currentView === 'add' && (
          <div className="card-enhanced rounded-2xl p-6 md:p-8">
            <AddProjectForm 
              onClose={handleCloseForm}
              onProjectAdded={handleProjectAdded}
            />
          </div>
        )}

        {currentView === 'edit' && selectedProject && (
          <div className="card-enhanced rounded-2xl p-6 md:p-8">
            <EditProjectForm 
              project={selectedProject} 
              onClose={handleCloseForm}
              onProjectUpdated={handleProjectUpdated}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProjectManagementPage;
