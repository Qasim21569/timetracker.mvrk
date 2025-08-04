import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, BarChart3, Users, Folder, FileText, Trash2 } from 'lucide-react';
import { ProjectService, UserService, ApiError } from '@/services/api';
import { Project, User } from '@/data/dummyData';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ProjectManagementTableProps {
  onEditProject: (project: Project) => void;
  refreshTrigger?: number;
  onProjectDeleted?: () => void; // Callback to notify parent when project is deleted
}

const ProjectManagementTable = ({ onEditProject, refreshTrigger, onProjectDeleted }: ProjectManagementTableProps) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load projects and users from API
  useEffect(() => {
    loadProjectsAndUsers();
  }, [refreshTrigger]);

  const loadProjectsAndUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allProjects, allUsers] = await Promise.all([
        ProjectService.getAllProjects(),
        UserService.getAllUsers({ is_active: true })
      ]);
    setProjects(allProjects);
    setUsers(allUsers);
    } catch (error) {
      console.error('Error loading data:', error);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to load projects and users');
      }
    } finally {
      setLoading(false);
    }
  };

  // Sort projects alphabetically
  const sortedProjects = [...projects].sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  const handleViewReports = (project: Project) => {
    const params = new URLSearchParams({
      project: project.name,
      user: 'All Users',
      month: 'January 2025'
    });
    navigate(`/reports?${params.toString()}`);
  };

  const handleDeleteProject = async (projectId: string) => {
    setIsDeleting(projectId);
    try {
      await ProjectService.deleteProject(projectId);
        loadProjectsAndUsers(); // Refresh the list
      onProjectDeleted?.(); // Notify parent to update statistics
    } catch (error) {
      console.error('Error deleting project:', error);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Failed to delete project');
      }
    } finally {
      setIsDeleting(null);
    }
  };

  const getUserNameById = (userId: string): string => {
    // Handle both string and number ID formats
    const user = users.find(u => u.id === userId || u.id === String(userId) || String(u.id) === String(userId));
    return user ? user.name : 'Unknown User';
  };

  const getProjectIcon = (projectName: string) => {
    if (projectName.toLowerCase().includes('meeting')) return '🗣️';
    if (projectName.toLowerCase().includes('x')) return '🚀';
    if (projectName.toLowerCase().includes('y')) return '⚡';
    return '📁';
  };

  const getProjectStatusDisplay = (project: any) => {
    const status = project.status || 'no_dates';
    
    switch (status) {
      case 'active':
        return {
          label: 'Active',
          className: 'status-active bg-emerald-50 text-emerald-700 border-emerald-200',
          dotColor: 'bg-emerald-500'
        };
      case 'inactive':
        return {
          label: 'Inactive',
          className: 'status-inactive bg-gray-50 text-gray-600 border-gray-200',
          dotColor: 'bg-gray-400'
        };
      case 'not_started':
        return {
          label: 'Not Started',
          className: 'status-not-started bg-blue-50 text-blue-700 border-blue-200',
          dotColor: 'bg-blue-500'
        };
      case 'no_dates':
      default:
        return {
          label: 'No Dates Set',
          className: 'status-no-dates bg-yellow-50 text-yellow-700 border-yellow-200',
          dotColor: 'bg-yellow-500'
        };
    }
  };

  return (
    <div className="table-enhanced">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-emerald-50">
              <TableHead className="text-xs md:text-sm min-w-[160px] font-semibold text-slate-700 py-4">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  Project Name
                </div>
              </TableHead>
              <TableHead className="text-xs md:text-sm min-w-[100px] font-semibold text-slate-700">
                Status
              </TableHead>
              <TableHead className="text-xs md:text-sm min-w-[200px] font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Assigned Users
                </div>
              </TableHead>
              <TableHead className="text-right text-xs md:text-sm min-w-[140px] font-semibold text-slate-700">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProjects.map((project, index) => {
              const assignedUserNames = ((project as any).assigned_user_ids || []).map((userId: any) => getUserNameById(String(userId)));
              const statusDisplay = getProjectStatusDisplay(project);
              const isInactive = project.status === 'inactive';
              
              return (
                <TableRow 
                  key={project.id}
                  className={`
                    table-row-enhanced border-b border-slate-100 group
                    ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                    ${isInactive ? 'opacity-60' : ''}
                  `}
                >
                  <TableCell className="font-medium text-xs md:text-sm py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-semibold bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                        <span className="text-white text-sm">
                          {getProjectIcon(project.name)}
                        </span>
                      </div>
                      <div>
                        <div className={`font-semibold ${isInactive ? 'text-slate-500' : 'text-slate-800'}`} title={project.name}>
                          {project.name}
                          {isInactive && <span className="ml-2 text-xs text-slate-400">(Inactive)</span>}
                        </div>
                        <div className={`text-xs ${isInactive ? 'text-slate-400' : 'text-slate-500'}`}>
                          {project.client}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                          <span>{assignedUserNames.length} member{assignedUserNames.length !== 1 ? 's' : ''}</span>
                          {((project as any).start_date || (project as any).end_date) && (
                            <span className="text-slate-400">•</span>
                          )}
                          {(project as any).start_date && (project as any).end_date ? (
                            <span className="text-slate-600 font-medium">
                              {new Date((project as any).start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date((project as any).end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          ) : (project as any).start_date ? (
                            <span className="text-slate-600 font-medium">
                              Starts {new Date((project as any).start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          ) : (project as any).end_date ? (
                            <span className="text-slate-600 font-medium">
                              Ends {new Date((project as any).end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`status-indicator text-xs font-medium border ${statusDisplay.className}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${statusDisplay.dotColor}`}></div>
                      {statusDisplay.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap gap-1 max-w-[200px] md:max-w-none">
                        {assignedUserNames.map((userName, userIndex) => (
                          <Badge 
                            key={userIndex} 
                            variant="outline"
                            className={`
                              text-xs px-2 py-1 rounded-lg border bg-blue-50 text-blue-700 border-blue-200
                              ${userIndex > 1 ? 'hidden md:inline-flex' : ''}
                            `}
                            title={userName}
                          >
                            <div className="w-2 h-2 rounded-full mr-1 bg-blue-500"></div>
                            <span className="max-w-[80px] truncate">
                              {userName.split(' ')[0]}
                            </span>
                          </Badge>
                        ))}
                        {assignedUserNames.length > 2 && (
                          <Badge variant="outline" className="md:hidden text-xs bg-slate-100 text-slate-600">
                            +{assignedUserNames.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 md:gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onEditProject(project)}
                        className="h-9 w-9 p-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-soft transition-all duration-200 rounded-lg"
                        title="Edit Project"
                      >
                        <Edit className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewReports(project)}
                        className="h-9 w-9 p-0 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:shadow-soft transition-all duration-200 rounded-lg"
                        title="View Reports"
                      >
                        <BarChart3 className="h-4 w-4 text-slate-600" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:shadow-soft transition-all duration-200 rounded-lg"
                            title="Delete Project"
                            disabled={isDeleting === project.id}
                          >
                            <Trash2 className="h-4 w-4 text-slate-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Project</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete <strong>{project.name}</strong>? This action cannot be undone and will also remove all time entries for this project.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteProject(project.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProjectManagementTable;
