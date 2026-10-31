import React from 'react';
import { User, Save, Lock, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/shared/FormField';
import { useAuth } from '@/context/AuthContext';

export const CustomerProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Account Profile & Security
        </h2>
        <p className="text-sm text-muted-foreground">
          Update primary business credentials, billing contacts, and security keys.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>Primary information associated with your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Full Name" defaultValue={user?.name || 'David Miller'} />
            <FormField
              label="Email Address"
              type="email"
              defaultValue={user?.email || 'david@acmecorp.com'}
              helperText="Invoices and renewal reminders are dispatched here"
            />
            <FormField
              label="Company Name"
              defaultValue={user?.company || 'Acme Technologies Inc.'}
            />
          </CardContent>
          <CardFooter className="border-t border-border/60">
            <Button leftIcon={<Save className="h-4 w-4" />}>Save Changes</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security & Password</CardTitle>
            <CardDescription>Update your authentication password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Current Password"
              type="password"
              placeholder="••••••••••••"
            />
            <FormField
              label="New Password"
              type="password"
              placeholder="Minimum 8 characters"
            />
            <FormField
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
            />
          </CardContent>
          <CardFooter className="border-t border-border/60">
            <Button variant="outline" leftIcon={<Lock className="h-4 w-4" />}>
              Update Password
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default CustomerProfile;

