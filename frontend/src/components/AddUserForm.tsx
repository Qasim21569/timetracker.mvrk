
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { userService } from '@/services/dataService';
import { UserRole } from '@/data/dummyData';

interface AddUserFormProps {
  onClose: () => void;
  onUserAdded?: () => void; // Callback to refresh parent list
}

const AddUserForm = ({ onClose, onUserAdded }: AddUserFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    tier: 'user' as UserRole,
    password: 'password' // Default password for new users
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

    // Check if email already exists
    const existingUser = userService.getByEmail(formData.email);
    if (existingUser) {
      missingFields.push('Unique Email (this email is already in use)');
    }
    
    return missingFields;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const missingFields = validateForm();
    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fix the following issues: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmAdd = async () => {
    setIsSubmitting(true);
    try {
      const newUser = userService.create({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        role: formData.tier,
        password: formData.password,
        avatarUrl: `https://i.pravatar.cc/150?u=${formData.email}`
      });

      toast({
        title: "User Added Successfully",
        description: `${newUser.name} has been added to the system!`
      });
      
      setShowConfirmDialog(false);
      onUserAdded?.(); // Trigger refresh of user list
      onClose();
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "Error Adding User",
        description: "There was an error adding the user. Please try again.",
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
          <CardTitle>Add New User</CardTitle>
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
                  maxLength={40}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Enter last name"
                  maxLength={40}
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
                <Label htmlFor="tier">User Role *</Label>
                <Select value={formData.tier} onValueChange={(value: UserRole) => setFormData({...formData, tier: value as UserRole})}>
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
                <Label htmlFor="password">Default Password *</Label>
                <Input
                  id="password"
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="password"
                />
                <p className="text-xs text-gray-500">User can change this after first login</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit">Add User</Button>
              <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm User Addition</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure the information is correct and you want to proceed with adding this user?
              <br /><br />
              <strong>Name:</strong> {formData.firstName} {formData.lastName}<br />
              <strong>Email:</strong> {formData.email}<br />
              <strong>Role:</strong> {formData.tier === 'admin' ? 'Admin' : 'User'}<br />
              <strong>Default Password:</strong> {formData.password}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAdd}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Yes, Add User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AddUserForm;
