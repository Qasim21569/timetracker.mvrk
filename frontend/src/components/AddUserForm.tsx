import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { UserService, ApiError } from '@/services/api';
import { UserRole } from '@/data/dummyData';
import { Copy, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface AddUserFormProps {
  onClose: () => void;
  onUserAdded?: () => void; // Callback to refresh parent list
}

interface CreatedUserDetails {
  name: string;
  username: string;
  email: string;
  password: string;
  role: string;
}

const AddUserForm = ({ onClose, onUserAdded }: AddUserFormProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    role: 'user' as 'user' | 'admin',
    password: '',
    password_confirm: '',
    useGeneratedPassword: true
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [createdUserDetails, setCreatedUserDetails] = useState<CreatedUserDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  // Generate a secure random password
  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    // Ensure at least one of each type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // Uppercase
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // Lowercase  
    password += "0123456789"[Math.floor(Math.random() * 10)]; // Number
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // Special char
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };



  // Toggle password generation mode
  const togglePasswordMode = () => {
    setFormData(prev => {
      const useGenerated = !prev.useGeneratedPassword;
      if (useGenerated) {
        const newPassword = generatePassword();
        return {
          ...prev,
          useGeneratedPassword: useGenerated,
          password: newPassword,
          password_confirm: newPassword
        };
      } else {
        return {
          ...prev,
          useGeneratedPassword: useGenerated,
          password: '',
          password_confirm: ''
        };
      }
    });
  };

  // Generate new password
  const handleGenerateNewPassword = () => {
    const newPassword = generatePassword();
    setFormData(prev => ({
      ...prev,
      password: newPassword,
      password_confirm: newPassword
    }));
  };

  const validateForm = () => {
    const missingFields = [];
    if (!formData.firstName.trim()) missingFields.push('First Name');
    if (!formData.lastName.trim()) missingFields.push('Last Name');
    if (!formData.username.trim()) missingFields.push('Username');
    if (!formData.email.trim()) missingFields.push('Email');
    if (!formData.password.trim()) missingFields.push('Password');
    if (!formData.password_confirm.trim()) missingFields.push('Password Confirmation');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      missingFields.push('Valid Email Format');
    }

    // Username validation (alphanumeric only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (formData.username && !usernameRegex.test(formData.username)) {
      missingFields.push('Username (only letters, numbers, and underscore allowed)');
    }

    // Password confirmation validation
    if (formData.password !== formData.password_confirm) {
      missingFields.push('Passwords Must Match');
    }
    
    return missingFields;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-generate password if using generated mode and no password set
    if (formData.useGeneratedPassword && !formData.password) {
      const newPassword = generatePassword();
      setFormData(prev => ({
        ...prev,
        password: newPassword,
        password_confirm: newPassword
      }));
      return; // Re-submit will be triggered by the state update
    }
    
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
      const newUser = await UserService.createUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        first_name: formData.firstName,
        last_name: formData.lastName,
        is_admin: formData.role === 'admin'
      });

      // Store user details for credentials dialog
      setCreatedUserDetails({
        name: `${formData.firstName} ${formData.lastName}`,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      toast({
        title: "User Added Successfully",
        description: `${formData.firstName} ${formData.lastName} has been added to the system!`
      });
      
      setShowConfirmDialog(false);
      setShowCredentialsDialog(true);
      onUserAdded?.(); // Trigger refresh of user list
    } catch (error) {
      console.error('Error adding user:', error);
      let errorMessage = "There was an error adding the user. Please try again.";
      
      if (error instanceof ApiError) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error Adding User",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format credentials for copying
  const formatCredentials = (details: CreatedUserDetails) => {
    return `MVRK Time Tracker Account Created

Name: ${details.name}
Username: ${details.username}
Email: ${details.email}
Password: ${details.password}
Role: ${details.role.charAt(0).toUpperCase() + details.role.slice(1)}

Login URL: ${window.location.origin}/login`;
  };

  // Copy credentials to clipboard (from current form data)
  const handleCopyCredentials = async () => {
    if (!formData.firstName || !formData.lastName || !formData.username || !formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please complete all fields before copying credentials.",
        variant: "destructive"
      });
      return;
    }
    
    const credentials = {
      name: `${formData.firstName} ${formData.lastName}`,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      role: formData.role
    };
    
    try {
      await navigator.clipboard.writeText(formatCredentials(credentials));
      toast({
        title: "Credentials Copied",
        description: "User credentials have been copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy credentials. Please copy manually.",
        variant: "destructive"
      });
    }
  };



  // Auto-generate password on mount if using generated mode
  React.useEffect(() => {
    if (formData.useGeneratedPassword && !formData.password) {
      const newPassword = generatePassword();
      setFormData(prev => ({
        ...prev,
        password: newPassword,
        password_confirm: newPassword
      }));
    }
  }, []);

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
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

            {/* Email and Username */}
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
                <p className="text-xs text-gray-500">User can login with this email address</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="Enter username"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500">Unique username for login (letters, numbers, underscore only)</p>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">User Role *</Label>
              <Select value={formData.role} onValueChange={(value: 'user' | 'admin') => setFormData({...formData, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Password Generation Options */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="useGenerated"
                  checked={formData.useGeneratedPassword}
                  onChange={togglePasswordMode}
                  className="rounded"
                />
                <Label htmlFor="useGenerated" className="cursor-pointer">
                  Generate secure password automatically (Recommended)
                </Label>
              </div>

              {formData.useGeneratedPassword ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Generated Password</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateNewPassword}
                      className="h-7 px-2"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      New
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-7 px-2"
                    >
                      {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    readOnly
                    className="bg-gray-50 font-mono"
                  />
                  <p className="text-xs text-gray-500">
                    Secure 12-character password with uppercase, lowercase, numbers, and symbols
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password_confirm">Confirm Password *</Label>
                    <Input
                      id="password_confirm"
                      type="password"
                      value={formData.password_confirm}
                      onChange={(e) => setFormData({...formData, password_confirm: e.target.value})}
                      placeholder="Confirm password"
                    />
                  </div>
                </div>
              )}
            </div>



            {/* Copy Credentials Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Ready to Share Credentials</Label>
                  <p className="text-xs text-gray-500">Copy formatted credentials to share with the user</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyCredentials}
                  className="flex items-center gap-2"
                  disabled={!formData.firstName || !formData.lastName || !formData.username || !formData.email || !formData.password}
                >
                  <Copy className="h-4 w-4" />
                  Copy Credentials
                </Button>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Creating User...' : 'Add User'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm User Creation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to create a new user account for{' '}
              <strong>{formData.firstName} {formData.lastName}</strong>?
              <br />
              <br />
              <strong>Details:</strong>
              <br />
              Email: {formData.email}
              <br />
              Username: {formData.username}
              <br />
              Role: {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAdd} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Credentials Success Dialog */}
      <Dialog open={showCredentialsDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCredentialsDialog(false);
          onClose();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-green-600">✅ User Created Successfully!</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              The user account has been created. Here are the login credentials:
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Name:</strong> {createdUserDetails?.name}</div>
                <div><strong>Role:</strong> {createdUserDetails?.role.charAt(0).toUpperCase() + createdUserDetails?.role.slice(1)}</div>
                <div><strong>Email:</strong> {createdUserDetails?.email}</div>
                <div><strong>Username:</strong> {createdUserDetails?.username}</div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2">
                  <strong className="text-sm">Password:</strong>
                  <code className="bg-white px-2 py-1 rounded font-mono text-sm border">
                    {createdUserDetails?.password}
                  </code>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>🔑 Login Instructions:</strong> User can login with either their email or username at {window.location.origin}/login
              </p>
            </div>

            <Textarea
              value={createdUserDetails ? formatCredentials(createdUserDetails) : ''}
              readOnly
              className="h-32 font-mono text-xs bg-gray-50"
              placeholder="Formatted credentials will appear here..."
            />
          </div>

          <DialogFooter>
            <Button onClick={() => {
              setShowCredentialsDialog(false);
              onClose();
            }}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddUserForm;
