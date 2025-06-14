
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Edit, FileText, Users } from 'lucide-react';

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

interface ProjectManagementTableProps {
  onEditProject: (project: Project) => void;
}

const ProjectManagementTable = ({ onEditProject }: ProjectManagementTableProps) => {
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
          {dummyProjects.map((project) => (
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
                    {project.assignedUsers.map((user, index) => (
                      <span key={index} className={!project.active && user === 'Pretend Person' ? 'italic text-muted-foreground' : ''}>
                        {user}{index < project.assignedUsers.length - 1 ? ', ' : ''}
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ProjectManagementTable;
