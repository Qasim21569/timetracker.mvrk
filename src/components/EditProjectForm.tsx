
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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
    
    if (!projectName.trim() || (active && assignedUsers.length === 0)) {
      alert('Please fill in all required fields');
      return;
    }

    if (confirm('Are you sure the information is correct, and you want to proceed?')) {
      console.log('Updating project:', { projectName, assignedUsers, active });
      onClose();
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
                placeholder="Enter project name"
                required
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label>Available Users</Label>
                <Card className="min-h-[300px]">
                  <CardContent className="p-4">
                    {availableUsers.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        All users have been assigned
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {availableUsers.map((user) => (
                          <div key={user} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="font-medium">{user}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => moveToAssigned(user)}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Label>
                  Assigned Users <span className="text-red-500">*</span>
                </Label>
                <Card className="min-h-[300px]">
                  <CardContent className="p-4">
                    {assignedUsers.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No users assigned
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {assignedUsers.map((user) => (
                          <div key={user} className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                            <span className={`font-medium ${user === 'Pretend Person' ? 'italic text-muted-foreground' : ''}`}>
                              {user}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromAssigned(user)}
                            >
                              <ArrowLeft className="h-4 w-4" />
                            </Button>
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
