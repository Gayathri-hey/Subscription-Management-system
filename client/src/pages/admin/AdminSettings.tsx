import React from 'react';
import { Settings, Save, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/shared/FormField';

export const AdminSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          System & Billing Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure default currencies, payment gateway keys, tax rules, and email automation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Organization</CardTitle>
            <CardDescription>Primary company identity and business details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Organization Name" defaultValue="Acme Cloud Solutions" />
            <FormField label="Support Email" type="email" defaultValue="support@subscriptions.io" />
            <FormField
              label="Default Base Currency"
              type="select"
              defaultValue="USD"
              options={[
                { value: 'USD', label: 'USD ($) - US Dollar' },
                { value: 'EUR', label: 'EUR (€) - Euro' },
                { value: 'GBP', label: 'GBP (£) - British Pound' },
              ]}
            />
          </CardContent>
          <CardFooter className="border-t border-border/60">
            <Button leftIcon={<Save className="h-4 w-4" />}>Save Changes</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Automation</CardTitle>
            <CardDescription>Configure node-cron recurring invoice schedules.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Invoice Due Window (Days)"
              type="number"
              defaultValue="14"
              helperText="Days before subscription renewal when invoices are generated"
            />
            <FormField
              label="Grace Period (Days)"
              type="number"
              defaultValue="7"
              helperText="Days before delinquent subscriptions are suspended"
            />
            <FormField
              label="Default Tax Rate (%)"
              type="number"
              defaultValue="8.5"
              helperText="Applied when no specific regional tax override is detected"
            />
          </CardContent>
          <CardFooter className="border-t border-border/60">
            <Button leftIcon={<Save className="h-4 w-4" />}>Update Policies</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;

