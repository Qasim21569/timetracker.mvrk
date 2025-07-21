
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { UserService, ApiError } from '@/services/api';
import { User as UserType } from '@/data/dummyData';

interface EditUserFormProps {
  user: UserType;
  onClose: () => void;
  onUserUpdated?: () => void;
}

const EditUserForm = ({ user, onClose, onUserUpdated }: EditUserFormProps) => {
  const [firstName, lastName] = user.name.split(' ');
  const [formData, setFormData] = useState({
    first_name: firstName || '',
    last_name: lastName || '',
    email: user.email,
    is_admin: user.role === 'admin',
    username: user.email || '', // Use email as username for new API
    password: '' // Leave empty unless changing password
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const missingFields = [];
    if (!formData.first_name.trim()) missingFields.push('First Name');
    if (!formData.last_name.trim()) missingFields.push('Last Name');
    if (!formData.email.trim()) missingFields.push('Email');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      missingFields.push('Valid Email Format');
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
      // Prepare update data - only include fields that are being updated
      const updateData: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        is_admin: formData.is_admin
      };

      // Only include password if it's been changed
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      const updatedUser = await UserService.updateUser(user.id, updateData);

        toast({
          title: "User Updated Successfully",
        description: `${(updatedUser as any).name || `${(updatedUser as any).first_name} ${(updatedUser as any).last_name}`} has been updated!`
        });
        setShowConfirmDialog(false);
        onUserUpdated?.();
        onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      let errorMessage = 'There was an error updating the user. Please try again.';
      
      if (error instanceof ApiError) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error Updating User",
        description: errorMessage,
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
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  placeholder="Enter last name"
                />
              </div>
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
                <Select 
                  value={formData.is_admin ? 'admin' : 'user'} 
                  onValueChange={(value) => setFormData({...formData, is_admin: value === 'admin'})}
                >
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

              <div className="space-y-2">
              <Label htmlFor="password">Password (leave blank to keep current password)</Label>
                <Input
                  id="password"
                type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Enter new password or leave blank"
                />
              <p className="text-xs text-gray-500">Only fill this field if you want to change the user's password</p>
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
              <strong>Name:</strong> {formData.first_name} {formData.last_name}<br />
              <strong>Email:</strong> {formData.email}<br />
              <strong>Role:</strong> {formData.is_admin ? 'Admin' : 'User'}<br />
              {formData.password && <><strong>Password:</strong> Will be updated<br /></>}
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
