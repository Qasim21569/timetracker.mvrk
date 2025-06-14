
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

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
    <div className="border-2 border-gray-800 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-teal-700">
            <TableHead className="text-white font-bold border-r border-gray-300">Name</TableHead>
            <TableHead className="text-white font-bold border-r border-gray-300">Active</TableHead>
            <TableHead className="text-white font-bold border-r border-gray-300">Assigned Users</TableHead>
            <TableHead className="text-white font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dummyProjects.map((project, index) => (
            <TableRow key={project.id} className={index % 2 === 0 ? 'bg-gray-200' : 'bg-gray-300'}>
              <TableCell className="border-r border-gray-400 font-medium">{project.name}</TableCell>
              <TableCell className="border-r border-gray-400">
                <div className="flex justify-center">
                  <div className="w-6 h-6 border-2 border-black flex items-center justify-center bg-white">
                    {project.active ? '✓' : '✗'}
                  </div>
                </div>
              </TableCell>
              <TableCell className="border-r border-gray-400">
                {project.assignedUsers.map((user, userIndex) => (
                  <span key={userIndex} className={!project.active && user === 'Pretend Person' ? 'italic text-gray-500' : ''}>
                    {user}{userIndex < project.assignedUsers.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Button 
                    variant="link" 
                    className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                    onClick={() => onEditProject(project)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="link" 
                    className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                  >
                    View Reports
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProjectManagementTable;
