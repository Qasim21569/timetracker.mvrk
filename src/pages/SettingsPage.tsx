
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Palette, Bell, Shield } from 'lucide-react';

const SettingsPage = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and application preferences</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                User Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Update your personal information and preferences.</p>
            </CardContent>
          </Card>
          
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Customize the look and feel of your interface.</p>
            </CardContent>
          </Card>
          
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configure your notification preferences.</p>
            </CardContent>
          </Card>
          
          <Card className="card-enhanced">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Manage your account security settings.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
