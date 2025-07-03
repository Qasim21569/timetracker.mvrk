import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { projectService, userService } from '@/services/dataService';
import { User } from '@/data/dummyData';
import { toast } from '@/hooks/use-toast';

interface AddProjectFormProps {
  onClose: () => void;
  onProjectAdded?: () => void;
}

const AddProjectForm = ({ onClose, onProjectAdded }: AddProjectFormProps) => {
  const [projectName, setProjectName] = useState('');
  const [clientName, setClientName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
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
    const usersToMove = selectedAvailableUserIds.filter(userId => !assignedUserIds.includes(userId));
    setAssignedUserIds([...assignedUserIds, ...usersToMove]);
    setSelectedAvailableUserIds([]);
  };

  const removeFromAssigned = () => {
    const usersToRemove = selectedAssignedUserIds;
    setAssignedUserIds(assignedUserIds.filter(userId => !usersToRemove.includes(userId)));
    setSelectedAssignedUserIds([]);
  };

  const availableUsers = users.filter(user => !assignedUserIds.includes(user.id));
  const assignedUsers = users.filter(user => assignedUserIds.includes(user.id));

  const handleAvailableUserClick = (userId: string) => {
    setSelectedAvailableUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAssignedUserClick = (userId: string) => {
    setSelectedAssignedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const missingFields = [];
    if (!projectName.trim()) {
      missingFields.push('Project Name');
    }
    if (!clientName.trim()) {
      missingFields.push('Client Name');
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      missingFields.push('End Date must be after Start Date');
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
      const newProject = projectService.create({
        name: projectName.trim(),
        client: clientName.trim(),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        assignedUserIds: assignedUserIds
      });

      toast({
        title: "Project Added Successfully",
        description: `${newProject.name} has been created!`
      });
      
      onProjectAdded?.();
      onClose();
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: "Error Adding Project",
        description: "There was an error adding the project. Please try again.",
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
          <CardTitle>Add New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Project Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectName">
                  Project Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  maxLength={120}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {projectName.length}/120 characters
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientName">
                  Client Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter client name"
                  maxLength={100}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {clientName.length}/100 characters
                </p>
              </div>
            </div>

            {/* Project Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Project Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Optional - When the project starts
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate">Project End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || undefined}
                />
                <p className="text-xs text-muted-foreground">
                  Optional - Expected project completion date
                </p>
              </div>
            </div>

            {/* User Assignment */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Team Assignment</Label>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
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
                            key={user.id} 
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedAvailableUserIds.includes(user.id)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                            onClick={() => handleAvailableUserClick(user.id)}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                                {user.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-medium">{user.name}</span>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
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
                  disabled={selectedAvailableUserIds.length === 0}
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
                  disabled={selectedAssignedUserIds.length === 0}
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
                            key={user.id} 
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              selectedAssignedUserIds.includes(user.id)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-primary/10 hover:bg-primary/20'
                            }`}
                            onClick={() => handleAssignedUserClick(user.id)}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-semibold">
                                {user.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-medium">{user.name}</span>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
                </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Project'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
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
