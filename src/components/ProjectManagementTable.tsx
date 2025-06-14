import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, BarChart3, Users, Folder, FileText } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  active: boolean;
  assignedUsers: string[];
}

const dummyProjects: Project[] = [
  { id: '1', name: 'Internal Meetings', active: true, assignedUsers: ['Vuk Stajic', 'Diego Oviedo', 'Pretend Person'] },
  { id: '2', name: 'Project X', active: true, assignedUsers: ['Vuk Stajic', 'Diego Oviedo'] },
  { id: '3', name: 'Project Y', active: false, assignedUsers: ['Vuk Stajic', 'Diego Oviedo'] },
];

// Mock inactive users for demonstration
const inactiveUsers = ['Pretend Person'];

interface ProjectManagementTableProps {
  onEditProject: (project: Project) => void;
}

const ProjectManagementTable = ({ onEditProject }: ProjectManagementTableProps) => {
  const navigate = useNavigate();

  // Sort projects: active first (alphabetically), then inactive (alphabetically)
  const sortedProjects = [...dummyProjects].sort((a, b) => {
    if (a.active !== b.active) {
      return a.active ? -1 : 1; // Active projects first
    }
    return a.name.localeCompare(b.name); // Alphabetical within each group
  });

  const handleViewReports = (project: Project) => {
    const params = new URLSearchParams({
      project: project.name,
      user: 'All Users',
      month: 'January 2025'
    });
    navigate(`/reports?${params.toString()}`);
  };

  const sortUsersWithInactiveAtEnd = (users: string[]) => {
    const activeUsers = users.filter(user => !inactiveUsers.includes(user)).sort();
    const inactiveProjectUsers = users.filter(user => inactiveUsers.includes(user)).sort();
    return [...activeUsers, ...inactiveProjectUsers];
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
              const sortedUsers = sortUsersWithInactiveAtEnd(project.assignedUsers);
              
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
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center text-lg font-semibold
                        ${project.active 
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg' 
                          : 'bg-gradient-to-br from-slate-400 to-slate-500'
                        }
                      `}>
                        <span className="text-white text-sm">
                          {getProjectIcon(project.name)}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800" title={project.name}>
                          {project.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {project.assignedUsers.length} member{project.assignedUsers.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`
                        status-indicator text-xs font-medium
                        ${project.active ? 'status-active' : 'status-inactive'}
                      `}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${project.active ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                      {project.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap gap-1 max-w-[200px] md:max-w-none">
                        {sortedUsers.map((user, userIndex) => (
                          <Badge 
                            key={userIndex} 
                            variant="outline"
                            className={`
                              text-xs px-2 py-1 rounded-lg border
                              ${inactiveUsers.includes(user) 
                                ? 'bg-slate-100 text-slate-500 border-slate-300 italic' 
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                              }
                              ${userIndex > 1 ? 'hidden md:inline-flex' : ''}
                            `}
                            title={user}
                          >
                            <div className={`
                              w-2 h-2 rounded-full mr-1
                              ${inactiveUsers.includes(user) ? 'bg-slate-400' : 'bg-blue-500'}
                            `}></div>
                            <span className="max-w-[80px] truncate">
                              {user.split(' ')[0]}
                            </span>
                          </Badge>
                        ))}
                        {sortedUsers.length > 2 && (
                          <Badge variant="outline" className="md:hidden text-xs bg-slate-100 text-slate-600">
                            +{sortedUsers.length - 2}
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
                        className="h-9 w-9 p-0 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:shadow-soft transition-all duration-200 rounded-lg"
                        title="Project Details"
                      >
                        <FileText className="h-4 w-4 text-slate-600" />
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
