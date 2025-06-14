
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

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
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.hoursPerDay) {
      alert('Please fill in all required fields');
      return;
    }

    // Confirmation
    if (confirm('Are you sure the information is correct, and you want to proceed?')) {
      console.log('Updating user:', formData);
      onClose();
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-2 border-gray-800">
      <CardHeader>
        <CardTitle>Edit User</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="bg-gray-300 p-2 rounded border-2 border-gray-800 block text-center font-medium">
                First Name*
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                placeholder="Pre-Fills with current data"
                className="border-2 border-gray-800"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="bg-gray-300 p-2 rounded border-2 border-gray-800 block text-center font-medium">
                Last Name*
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                placeholder="Pre-Fills with current data"
                className="border-2 border-gray-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="bg-gray-300 p-2 rounded border-2 border-gray-800 block text-center font-medium">
                Email*
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Pre-Fills with current data"
                className="border-2 border-gray-800"
              />
            </div>
            <div>
              <Label htmlFor="tier" className="bg-gray-300 p-2 rounded border-2 border-gray-800 block text-center font-medium">
                Tier*
              </Label>
              <select
                id="tier"
                value={formData.tier}
                onChange={(e) => setFormData({...formData, tier: e.target.value as 'Admin' | 'User'})}
                className="w-full p-2 border-2 border-gray-800 rounded"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hoursPerDay" className="bg-gray-300 p-2 rounded border-2 border-gray-800 block text-center font-medium">
                Hours Per Day*
              </Label>
              <Input
                id="hoursPerDay"
                type="number"
                step="0.01"
                value={formData.hoursPerDay}
                onChange={(e) => setFormData({...formData, hoursPerDay: e.target.value})}
                placeholder="Number, 2 decimal points"
                className="border-2 border-gray-800"
              />
            </div>
            <div>
              <Label className="bg-gray-300 p-2 rounded border-2 border-gray-800 block text-center font-medium">
                Active
              </Label>
              <div className="flex justify-center mt-2">
                <div className="w-6 h-6 border-2 border-black flex items-center justify-center bg-white">
                  <Checkbox
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({...formData, active: checked as boolean})}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              type="submit"
              className="bg-gray-300 text-black border-2 border-gray-800 hover:bg-gray-400"
            >
              Save Edits
            </Button>
            <Button 
              type="button"
              onClick={onClose}
              variant="outline"
              className="border-2 border-gray-800"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditUserForm;
