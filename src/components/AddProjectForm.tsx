
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface AddProjectFormProps {
  onClose: () => void;
}

const availableUsers = ['Vuk Stajic', 'Diego Oviedo', 'Pretend Person'];

const AddProjectForm = ({ onClose }: AddProjectFormProps) => {
  const [projectName, setProjectName] = useState('');
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [selectedAvailableUsers, setSelectedAvailableUsers] = useState<string[]>([]);
  const [selectedAssignedUsers, setSelectedAssignedUsers] = useState<string[]>([]);

  const moveToAssigned = () => {
    const usersToMove = selectedAvailableUsers.filter(user => !assignedUsers.includes(user));
    setAssignedUsers([...assignedUsers, ...usersToMove]);
    setSelectedAvailableUsers([]);
  };

  const removeFromAssigned = () => {
    const usersToRemove = selectedAssignedUsers;
    setAssignedUsers(assignedUsers.filter(user => !usersToRemove.includes(user)));
    setSelectedAssignedUsers([]);
  };

  const availableUsersFiltered = availableUsers.filter(user => !assignedUsers.includes(user));

  const handleAvailableUserClick = (user: string) => {
    setSelectedAvailableUsers(prev => 
      prev.includes(user) 
        ? prev.filter(u => u !== user)
        : [...prev, user]
    );
  };

  const handleAssignedUserClick = (user: string) => {
    setSelectedAssignedUsers(prev => 
      prev.includes(user) 
        ? prev.filter(u => u !== user)
        : [...prev, user]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const missingFields = [];
    if (!projectName.trim()) {
      missingFields.push('Project Name');
    }
    if (assignedUsers.length === 0) {
      missingFields.push('At least 1 Assigned User');
    }

    if (missingFields.length > 0) {
      alert(`Please fill in the following required fields:\n${missingFields.join('\n')}`);
      return;
    }

    if (confirm('Are you sure the information is correct, and you want to proceed?')) {
      console.log('Adding project:', { projectName, assignedUsers });
      onClose();
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="projectName">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name (max 120 characters)"
                maxLength={120}
                required
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="space-y-4">
                <Label>Available Users</Label>
                <Card className="min-h-[300px]">
                  <CardContent className="p-4">
                    {availableUsersFiltered.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        All users have been assigned
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[250px] overflow-y-auto">
                        {availableUsersFiltered.map((user) => (
                          <div 
                            key={user} 
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedAvailableUsers.includes(user)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                            onClick={() => handleAvailableUserClick(user)}
                          >
                            <span className="font-medium">{user}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-col items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={moveToAssigned}
                  disabled={selectedAvailableUsers.length === 0}
                  className="w-full"
                >
                  <ArrowRight className="h-4 w-4" />
                  Add Selected
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={removeFromAssigned}
                  disabled={selectedAssignedUsers.length === 0}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Remove Selected
                </Button>
              </div>

              <div className="space-y-4">
                <Label>
                  Assigned Users <span className="text-red-500">*</span>
                </Label>
                <Card className="min-h-[300px]">
                  <CardContent className="p-4">
                    {assignedUsers.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No users assigned yet
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[250px] overflow-y-auto">
                        {assignedUsers.map((user) => (
                          <div 
                            key={user} 
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedAssignedUsers.includes(user)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-primary/10 hover:bg-primary/20'
                            }`}
                            onClick={() => handleAssignedUserClick(user)}
                          >
                            <span className="font-medium">{user}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit">
                Add Project
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProjectForm;
