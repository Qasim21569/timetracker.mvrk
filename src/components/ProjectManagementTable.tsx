import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, BarChart3, Users, Folder, FileText, Trash2 } from 'lucide-react';
import { projectService, userService } from '@/services/dataService';
import { Project, User } from '@/data/dummyData';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ProjectManagementTableProps {
  onEditProject: (project: Project) => void;
  refreshTrigger?: number;
}

const ProjectManagementTable = ({ onEditProject, refreshTrigger }: ProjectManagementTableProps) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Load projects and users from localStorage
  useEffect(() => {
    loadProjectsAndUsers();
  }, [refreshTrigger]);

  const loadProjectsAndUsers = () => {
    const allProjects = projectService.getAll();
    const allUsers = userService.getAll();
    setProjects(allProjects);
    setUsers(allUsers);
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
      const success = projectService.delete(projectId);
      if (success) {
        loadProjectsAndUsers(); // Refresh the list
      } else {
        console.error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const getUserNameById = (userId: string): string => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const getProjectIcon = (projectName: string) => {
    if (projectName.toLowerCase().includes('meeting')) return '🗣️';
    if (projectName.toLowerCase().includes('x')) return '🚀';
    if (projectName.toLowerCase().includes('y')) return '⚡';
    return '📁';
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
              const assignedUserNames = project.assignedUserIds.map(getUserNameById);
              
              return (
                <TableRow 
                  key={project.id}
                  className={`
                    table-row-enhanced border-b border-slate-100 group
                    ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
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
                        <div className="font-semibold text-slate-800" title={project.name}>
                          {project.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {assignedUserNames.length} member{assignedUserNames.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="status-indicator text-xs font-medium status-active">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      Active
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
