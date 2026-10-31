import React from 'react';
import { Plus, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

interface Plan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  interval: 'month' | 'year';
  popular?: boolean;
  features: string[];
  subscribersCount: number;
}

const mockPlans: Plan[] = [
  {
    id: 'plan_starter',
    name: 'Starter',
    tagline: 'Ideal for small agile teams getting started',
    price: 49,
    interval: 'month',
    features: ['Up to 5 Users', 'Basic Analytics', 'Standard Support', '5GB Storage'],
    subscribersCount: 320,
  },
  {
    id: 'plan_growth',
    name: 'Growth',
    tagline: 'Best for expanding organizations with high throughput',
    price: 199,
    interval: 'month',
    popular: true,
    features: [
      'Up to 25 Users',
      'Advanced Reporting',
      'Priority 24/7 SLA',
      '100GB Storage',
      'Custom Webhooks',
    ],
    subscribersCount: 712,
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise',
    tagline: 'Tailored for demanding corporations requiring dedicated resources',
    price: 799,
    interval: 'month',
    features: [
      'Unlimited Seats',
      'Dedicated Account Manager',
      'Custom Contract Terms',
      '1TB Cloud Storage',
      '99.99% Uptime Guarantee',
      'Audit Logs & Compliance',
    ],
    subscribersCount: 216,
  },
];

export const AdminPlans: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Subscription Pricing Plans
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure tiered pricing models, intervals, and billing policies.
          </p>
        </div>

        <Button leftIcon={<Plus className="h-4 w-4" />}>Create New Plan</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {mockPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative flex flex-col justify-between ${
              plan.popular ? 'border-primary ring-1 ring-primary/50 shadow-lg' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="default" className="shadow-md">
                  Most Popular
                </Badge>
              </div>
            )}

            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <span className="text-xs font-mono text-muted-foreground">
                  {plan.subscribersCount} active
                </span>
              </div>
              <CardDescription className="min-h-[40px] text-xs">
                {plan.tagline}
              </CardDescription>

              <div className="pt-4 flex items-baseline">
                <span className="text-3xl font-extrabold tracking-tight font-mono text-foreground">
                  {formatCurrency(plan.price)}
                </span>
                <span className="ml-1 text-sm text-muted-foreground">/{plan.interval}</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 flex-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Included Features
              </div>
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-xs text-foreground">
                    <Check className="h-4 w-4 mr-2 text-emerald-400 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="pt-4 border-t border-border/60">
              <Button
                variant={plan.popular ? 'default' : 'outline'}
                className="w-full"
              >
                Edit Plan
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPlans;

