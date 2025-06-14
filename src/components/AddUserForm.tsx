
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

interface AddUserFormProps {
  onClose: () => void;
}

const AddUserForm = ({ onClose }: AddUserFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    tier: 'User',
    hoursPerDay: ''
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const validateForm = () => {
    const missingFields = [];
    if (!formData.firstName.trim()) missingFields.push('First Name');
    if (!formData.lastName.trim()) missingFields.push('Last Name');
    if (!formData.email.trim()) missingFields.push('Email');
    if (!formData.hoursPerDay.trim()) missingFields.push('Hours Per Day');
    
    return missingFields;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const missingFields = validateForm();
    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in the following fields: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmAdd = () => {
    console.log('Adding user:', formData);
    toast({
      title: "User Added Successfully",
      description: "Welcome email sent to the user!"
    });
    setShowConfirmDialog(false);
    onClose();
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
                <Label htmlFor="tier">User Tier *</Label>
                <Select value={formData.tier} onValueChange={(value) => setFormData({...formData, tier: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hoursPerDay">Hours Per Day *</Label>
                <Input
                  id="hoursPerDay"
                  type="number"
                  step="0.01"
                  value={formData.hoursPerDay}
                  onChange={(e) => setFormData({...formData, hoursPerDay: e.target.value})}
                  placeholder="8.00"
                />
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
              <strong>Tier:</strong> {formData.tier}<br />
              <strong>Hours Per Day:</strong> {formData.hoursPerDay}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAdd}>
              Yes, Add User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AddUserForm;
