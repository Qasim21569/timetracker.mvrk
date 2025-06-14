
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AddProjectFormProps {
  onClose: () => void;
}

const availableUsers = ['Vuk Stajic', 'Diego Oviedo', 'Pretend Person'];

const AddProjectForm = ({ onClose }: AddProjectFormProps) => {
  const [projectName, setProjectName] = useState('');
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);

  const moveToAssigned = (user: string) => {
    setAssignedUsers([...assignedUsers, user]);
  };

  const removeFromAssigned = (user: string) => {
    setAssignedUsers(assignedUsers.filter(u => u !== user));
  };

  const availableUsersFiltered = availableUsers.filter(user => !assignedUsers.includes(user));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName || assignedUsers.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    if (confirm('Are you sure the information is correct, and you want to proceed?')) {
      console.log('Adding project:', { projectName, assignedUsers });
      onClose();
    }
  };

  return (
    <Card className="max-w-4xl mx-auto border-2 border-gray-800">
      <CardHeader>
        <CardTitle>Add Project</CardTitle>
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
              placeholder="Text Field (max 120 characters)"
              maxLength={120}
              className="border-2 border-gray-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="bg-gray-300 p-2 rounded border-2 border-gray-800 block text-center font-medium mb-2">
                Available Users
              </Label>
              <div className="border-2 border-gray-800 rounded-lg p-4 min-h-[200px] bg-gray-100">
                <p className="text-center text-gray-600 mb-4">LIST ALL ACTIVE USERS HERE BY DEFAULT</p>
                <div className="space-y-2">
                  {availableUsersFiltered.map((user) => (
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
                <p className="text-center text-gray-600 mb-4">LIST ALL USERS SELECTED AND MOVED TO ASSIGNED</p>
                <div className="space-y-2">
                  {assignedUsers.map((user) => (
                    <div key={user} className="flex justify-between items-center p-2 bg-white border border-gray-300 rounded">
                      <span>{user}</span>
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

          <div className="flex gap-4">
            <Button 
              type="submit"
              className="bg-gray-300 text-black border-2 border-gray-800 hover:bg-gray-400"
            >
              Add Project
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

export default AddProjectForm;
