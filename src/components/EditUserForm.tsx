
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  active: boolean;
  tier: 'Admin' | 'User';
  hoursPerDay: number;
}

interface EditUserFormProps {
  user: User;
  onClose: () => void;
}

const EditUserForm = ({ user, onClose }: EditUserFormProps) => {
  const [firstName, lastName] = user.name.split(' ');
  const [formData, setFormData] = useState({
    firstName: firstName || '',
    lastName: lastName || '',
    email: user.email,
    tier: user.tier,
    hoursPerDay: user.hoursPerDay.toString(),
    active: user.active
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.hoursPerDay) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    console.log('Updating user:', formData);
    toast({
      title: "Success",
      description: "User updated successfully"
    });
    onClose();
  };

  return (
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
              <Select value={formData.tier} onValueChange={(value) => setFormData({...formData, tier: value as 'Admin' | 'User'})}>
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
            <div className="space-y-3">
              <Label>Active Status</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({...formData, active: checked})}
                />
                <Label className="text-sm text-muted-foreground">
                  {formData.active ? 'Active' : 'Inactive'}
                </Label>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit">Save Changes</Button>
            <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditUserForm;
