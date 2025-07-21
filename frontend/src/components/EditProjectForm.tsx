import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProjectService, UserService, ProjectAssignmentService, ApiError } from '@/services/api';
import { Project, User } from '@/data/dummyData';
import { toast } from '@/hooks/use-toast';

interface EditProjectFormProps {
  project: Project;
  onClose: () => void;
  onProjectUpdated?: () => void;
}

const EditProjectForm: React.FC<EditProjectFormProps> = ({ 
  project, 
  onClose, 
  onProjectUpdated 
}) => {
  const [projectName, setProjectName] = useState(project.name);
  const [clientName, setClientName] = useState(project.client);
  const [startDate, setStartDate] = useState(project.startDate || '');
  const [endDate, setEndDate] = useState(project.endDate || '');
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([...(project.assignedUserIds || (project as any).assigned_user_ids?.map(String) || [])]);
  const [selectedAvailableUserIds, setSelectedAvailableUserIds] = useState<string[]>([]);
  const [selectedAssignedUserIds, setSelectedAssignedUserIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true); // Project status
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Store original values for reset functionality
  const originalValues = {
    projectName: project.name,
    clientName: project.client,
    startDate: project.startDate || '',
    endDate: project.endDate || '',
    assignedUserIds: [...(project.assignedUserIds || (project as any).assigned_user_ids?.map(String) || [])],
    isActive: true
  };

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const allUsers = await UserService.getAllUsers();
        setUsers(allUsers);
        setError(null);
      } catch (err) {
        console.error('Failed to load users:', err);
        setError('Failed to load users. Please refresh the page.');
      }
    };
    loadUsers();
  }, []);

  const availableUsers = users.filter(user => !assignedUserIds.includes(user.id));
  const assignedUsers = users.filter(user => assignedUserIds.includes(user.id));

  const moveToAssigned = () => {
    const usersToMove = selectedAvailableUserIds.filter(userId => !assignedUserIds.includes(userId));
    if (usersToMove.length > 0) {
      setAssignedUserIds([...assignedUserIds, ...usersToMove]);
      setSelectedAvailableUserIds([]);
    }
  };

  const removeFromAssigned = () => {
    if (selectedAssignedUserIds.length > 0) {
      setAssignedUserIds(assignedUserIds.filter(userId => !selectedAssignedUserIds.includes(userId)));
      setSelectedAssignedUserIds([]);
    }
  };

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

  // Enhanced validation function
  const validateForm = () => {
    const errors: string[] = [];
    
    if (!projectName.trim()) {
      errors.push('Project name is required');
    }
    
    if (projectName.trim().length > 120) {
      errors.push('Project name must be 120 characters or less');
    }
    
    if (!clientName.trim()) {
      errors.push('Client name is required');
    }
    
    if (clientName.trim().length > 100) {
      errors.push('Client name must be 100 characters or less');
    }
    
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errors.push('End date must be after start date');
    }
    
    if (assignedUserIds.length === 0) {
      errors.push('At least one user must be assigned to the project');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Validation Error",
        description: validationErrors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Update project basic info
      const updatedProject = await ProjectService.updateProject(project.id, {
        name: projectName.trim(),
        client: clientName.trim(),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      // Update project assignments if changed
      const currentAssignedIds = (project as any).assigned_user_ids || [];
      const newAssignedIds = assignedUserIds.map(id => parseInt(id));
      
      if (JSON.stringify(currentAssignedIds.sort()) !== JSON.stringify(newAssignedIds.sort())) {
        // Clear current assignments and set new ones
        await ProjectAssignmentService.unassignUsersFromProject(
          project.id, 
          currentAssignedIds
        );
        
        if (newAssignedIds.length > 0) {
          await ProjectAssignmentService.assignUsersToProject(
            project.id,
            newAssignedIds,
            'Project team updated'
          );
        }
      }

      toast({
        title: "Success",
        description: `Project "${updatedProject.name}" has been updated successfully!`
      });
      onProjectUpdated?.();
      onClose();
    } catch (err) {
      console.error('Error updating project:', err);
      if (err instanceof ApiError) {
        setError(`Failed to update project: ${err.message}`);
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive"
        });
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(`Failed to update project: ${errorMessage}`);
        toast({
          title: "Error",
          description: "There was an error updating the project. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to original values
  const handleReset = () => {
    setProjectName(originalValues.projectName);
    setClientName(originalValues.clientName);
    setStartDate(originalValues.startDate);
    setEndDate(originalValues.endDate);
    setAssignedUserIds([...originalValues.assignedUserIds]);
    setIsActive(originalValues.isActive);
    setSelectedAvailableUserIds([]);
    setSelectedAssignedUserIds([]);
    setError(null);
    
    toast({
      title: "Form Reset",
      description: "Form has been reset to original values."
    });
  };

  // Render user selection card with enhanced display
  const renderUserCard = (
    title: string,
    userList: User[],
    selectedIds: string[],
    onUserClick: (userId: string) => void,
    emptyMessage: string
  ) => (
    <div className="space-y-4">
      <Label className="text-sm font-medium">{title}</Label>
      <Card className="min-h-[300px]">
        <CardContent className="p-4">
          {userList.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              {emptyMessage}
            </p>
          ) : (
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {userList.map((user) => (
                <div
                  key={user.id}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all duration-200 border
                    ${selectedIds.includes(user.id)
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card hover:bg-muted border-border hover:shadow-sm'
                    }
                  `}
                  onClick={() => onUserClick(user.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{user.name}</span>
                    <span className="text-xs opacity-70 capitalize font-medium">
                      {user.role}
                    </span>
                  </div>
                  <span className="text-xs opacity-70">{user.email}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Error state display
  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Edit Project
            {isSubmitting && <span className="text-sm text-muted-foreground">(Saving...)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Optional - Expected project completion date
                </p>
              </div>
            </div>

            {/* User Assignment */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">User Assignment</Label>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {renderUserCard(
                  'Available Users',
                  availableUsers,
                  selectedAvailableUserIds,
                  handleAvailableUserClick,
                  'All users have been assigned'
                )}

                <div className="flex flex-col items-center justify-center gap-4 py-8">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={moveToAssigned}
                    disabled={selectedAvailableUserIds.length === 0 || isSubmitting}
                    className="w-full"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Assign Selected
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeFromAssigned}
                    disabled={selectedAssignedUserIds.length === 0 || isSubmitting}
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Remove Selected
                  </Button>
                </div>

                {renderUserCard(
                  `Assigned Users (${assignedUserIds.length})`,
                  assignedUsers,
                  selectedAssignedUserIds,
                  handleAssignedUserClick,
                  'No users assigned yet'
                )}
              </div>
            </div>

            {/* Project Status */}
            <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
              <Label htmlFor="active-switch" className="text-sm font-medium">
                Project Status
              </Label>
              <Switch
                id="active-switch"
                checked={isActive}
                onCheckedChange={setIsActive}
                disabled={isSubmitting}
              />
              <span className="text-sm text-muted-foreground">
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="sm:order-2"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
                className="sm:order-3"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleReset}
                disabled={isSubmitting}
                className="sm:order-1 sm:mr-auto"
              >
                Reset Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProjectForm; 