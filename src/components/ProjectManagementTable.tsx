
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Edit, FileText, Users, BarChart3 } from 'lucide-react';

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

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned Users</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProjects.map((project) => {
            const sortedUsers = sortUsersWithInactiveAtEnd(project.assignedUsers);
            
            return (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>
                  <Badge variant={project.active ? "default" : "secondary"}>
                    {project.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {sortedUsers.map((user, index) => (
                        <span 
                          key={index} 
                          className={inactiveUsers.includes(user) ? 'italic text-muted-foreground' : ''}
                        >
                          {user}{index < sortedUsers.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEditProject(project)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewReports(project)}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ProjectManagementTable;
