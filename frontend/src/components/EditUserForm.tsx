
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { userService } from '@/services/dataService';
import { User as UserType, UserRole } from '@/data/dummyData';

interface EditUserFormProps {
  user: UserType;
  onClose: () => void;
  onUserUpdated?: () => void;
}

const EditUserForm = ({ user, onClose, onUserUpdated }: EditUserFormProps) => {
  const [firstName, lastName] = user.name.split(' ');
  const [formData, setFormData] = useState({
    firstName: firstName || '',
    lastName: lastName || '',
    title: user.title || '',
    email: user.email,
    role: user.role,
    password: user.password || 'password'
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const missingFields = [];
    if (!formData.firstName.trim()) missingFields.push('First Name');
    if (!formData.lastName.trim()) missingFields.push('Last Name');
    if (!formData.email.trim()) missingFields.push('Email');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      missingFields.push('Valid Email Format');
    }

    // Check if email already exists (but not for current user)
    const existingUser = userService.getByEmail(formData.email);
    if (existingUser && existingUser.id !== user.id) {
      missingFields.push('Unique Email (this email is already in use)');
    }
    
    return missingFields;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const missingFields = validateForm();
    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fix the following issues: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmUpdate = async () => {
    setIsSubmitting(true);
    try {
      const updatedUser = userService.update(user.id, {
        name: `${formData.firstName} ${formData.lastName}`,
        title: formData.title.trim() || undefined,
        email: formData.email,
        role: formData.role,
        password: formData.password,
        avatarUrl: `https://i.pravatar.cc/150?u=${formData.email}`
      });

      if (updatedUser) {
        toast({
          title: "User Updated Successfully",
          description: `${updatedUser.name} has been updated!`
        });
        setShowConfirmDialog(false);
        onUserUpdated?.();
        onClose();
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error Updating User",
        description: "There was an error updating the user. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Enter job title (e.g., Senior Developer, Project Manager)"
                maxLength={60}
              />
              <p className="text-xs text-gray-500">Optional - User's job title or position</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">User Role *</Label>
                <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({...formData, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="password"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit">Save Changes</Button>
              <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm User Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure the information is correct and you want to proceed with updating this user?
              <br /><br />
              <strong>Name:</strong> {formData.firstName} {formData.lastName}<br />
              {formData.title && <><strong>Title:</strong> {formData.title}<br /></>}
              <strong>Email:</strong> {formData.email}<br />
              <strong>Role:</strong> {formData.role === 'admin' ? 'Admin' : 'User'}<br />
              <strong>Password:</strong> {formData.password}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmUpdate}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Yes, Update User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EditUserForm;
