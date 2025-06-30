
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { projectService, userService } from '@/services/dataService';
import { Project, User } from '@/data/dummyData';
import { toast } from '@/hooks/use-toast';

interface EditProjectFormProps {
  project: Project;
  onClose: () => void;
  onProjectUpdated?: () => void;
}

const EditProjectForm = ({ project, onClose, onProjectUpdated }: EditProjectFormProps) => {
  const [projectName, setProjectName] = useState(project.name);
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>(project.assignedUserIds);
  const [selectedAvailableUserIds, setSelectedAvailableUserIds] = useState<string[]>([]);
  const [selectedAssignedUserIds, setSelectedAssignedUserIds] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load users from localStorage
  useEffect(() => {
    const allUsers = userService.getAll();
    setUsers(allUsers);
  }, []);

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

  const availableUsers = allUsers.filter(user => !assignedUsers.includes(user));

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const missingFields = [];
    if (!projectName.trim()) {
      missingFields.push('Project Name');
    }
    if (assignedUserIds.length === 0) {
      missingFields.push('At least 1 Assigned User');
    }

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in the following fields: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedProject = projectService.update(project.id, {
        name: projectName.trim(),
        assignedUserIds: assignedUserIds
      });

      if (updatedProject) {
        toast({
          title: "Project Updated Successfully",
          description: `${updatedProject.name} has been updated!`
        });
        onProjectUpdated?.();
        onClose();
      } else {
        throw new Error('Project not found');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error Updating Project",
        description: "There was an error updating the project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Project</CardTitle>
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
                    {availableUsers.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        All users have been assigned
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[250px] overflow-y-auto">
                        {availableUsers.map((user) => (
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
                  Assigned Users {active && <span className="text-red-500">*</span>}
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
                            <span className={`font-medium ${user === 'Pretend Person' ? 'italic text-muted-foreground' : ''}`}>
                              {user}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
              <Label htmlFor="active-switch" className="text-sm font-medium">
                Project Active
              </Label>
              <Switch
                id="active-switch"
                checked={active}
                onCheckedChange={setActive}
              />
              <span className="text-sm text-muted-foreground">
                {active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit">
                Save Changes
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

export default EditProjectForm;
