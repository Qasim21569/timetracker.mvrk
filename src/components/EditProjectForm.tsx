
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface Project {
  id: string;
  name: string;
  active: boolean;
  assignedUsers: string[];
}

interface EditProjectFormProps {
  project: Project;
  onClose: () => void;
}

const allUsers = ['Vuk Stajic', 'Diego Oviedo', 'Pretend Person'];

const EditProjectForm = ({ project, onClose }: EditProjectFormProps) => {
  const [projectName, setProjectName] = useState(project.name);
  const [assignedUsers, setAssignedUsers] = useState<string[]>(project.assignedUsers);
  const [active, setActive] = useState(project.active);

  const moveToAssigned = (user: string) => {
    setAssignedUsers([...assignedUsers, user]);
  };

  const removeFromAssigned = (user: string) => {
    setAssignedUsers(assignedUsers.filter(u => u !== user));
  };

  const availableUsers = allUsers.filter(user => !assignedUsers.includes(user));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName || (active && assignedUsers.length === 0)) {
      alert('Please fill in all required fields');
      return;
    }

    if (confirm('Are you sure the information is correct, and you want to proceed?')) {
      console.log('Updating project:', { projectName, assignedUsers, active });
      onClose();
    }
  };

  return (
    <Card className="max-w-4xl mx-auto border-2 border-gray-800">
      <CardHeader>
        <CardTitle>Edit Project</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="projectName" className="bg-gray-300 p-2 rounded border-2 border-gray-800 block text-center font-medium mb-2">
              Project Name*
            </Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Default To What The Name Already Was"
              className="border-2 border-gray-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="bg-gray-300 p-2 rounded border-2 border-gray-800 block text-center font-medium mb-2">
                Available Users
              </Label>
              <div className="border-2 border-gray-800 rounded-lg p-4 min-h-[200px] bg-gray-100">
                <p className="text-center text-gray-600 mb-4">LIST ALL ACTIVE NOT ALREADY ASSIGNED USERS HERE BY DEFAULT</p>
                <div className="space-y-2">
                  {availableUsers.map((user) => (
                    <div key={user} className="flex justify-between items-center p-2 bg-white border border-gray-300 rounded">
                      <span>{user}</span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => moveToAssigned(user)}
                        className="text-xs"
                      >
                        →
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label className="bg-gray-300 p-2 rounded border-2 border-gray-800 block text-center font-medium mb-2">
                Assigned Users*
              </Label>
              <div className="border-2 border-gray-800 rounded-lg p-4 min-h-[200px] bg-gray-100">
                <p className="text-center text-gray-600 mb-4 text-sm">
                  LIST ALL ALREADY ASSIGNED USERS HERE [DON'T HIDE NON-ACTIVE USERS IF ASSIGNED, MAKE THEM ITALIC/DIFFERENT FONT FOR OBVIOUSLY NOTICING]
                </p>
                <div className="space-y-2">
                  {assignedUsers.map((user) => (
                    <div key={user} className="flex justify-between items-center p-2 bg-white border border-gray-300 rounded">
                      <span className={user === 'Pretend Person' ? 'italic text-gray-500' : ''}>{user}</span>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => removeFromAssigned(user)}
                        className="text-xs"
                      >
                        ←
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label className="bg-gray-300 p-2 rounded border-2 border-gray-800 block text-center font-medium mb-2">
              Active
            </Label>
            <div className="flex justify-center">
              <div className="w-6 h-6 border-2 border-black flex items-center justify-center bg-white">
                <Checkbox
                  checked={active}
                  onCheckedChange={(checked) => setActive(checked as boolean)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              type="submit"
              className="bg-gray-300 text-black border-2 border-gray-800 hover:bg-gray-400"
            >
              Save Edits
            </Button>
            <Button 
              type="button"
              onClick={onClose}
              variant="outline"
              className="border-2 border-gray-800"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditProjectForm;
