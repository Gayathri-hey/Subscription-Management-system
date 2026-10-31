import React from 'react';
import { CreditCard, FileText, CheckCircle, ArrowUpRight, Zap, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export const CustomerPortal: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-card p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-foreground">Welcome back, David</span>
              <StatusBadge status="ACTIVE" size="sm" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Your subscription is active and renewed automatically. Next billing event on{' '}
              <strong className="text-foreground">November 20, 2026</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate('/customer/invoices')}
            >
              View Invoices
            </Button>
            <Button
              onClick={() => navigate('/customer/subscriptions')}
              leftIcon={<Zap className="h-4 w-4" />}
            >
              Manage Plan
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground">
              Current Plan
            </CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">Enterprise Cloud</div>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              {formatCurrency(1188)} / monthly
            </p>
          </CardContent>
          <CardFooter className="pt-2 text-xs text-emerald-400 flex items-center border-t border-border/50">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Active & in good standing
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground">
              Next Invoice
            </CardTitle>
            <FileText className="h-4 w-4 text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-mono">
              {formatCurrency(1188)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Due on Nov 20, 2026</p>
          </CardContent>
          <CardFooter className="pt-2 text-xs text-muted-foreground border-t border-border/50">
            Auto-pay enabled (Visa ending 4242)
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase text-muted-foreground">
              Account Storage
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground font-mono">428 GB</div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: '42%' }}
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2 text-xs text-muted-foreground border-t border-border/50">
            42% of 1 TB quota used
          </CardFooter>
        </Card>
      </div>

      {/* Recent Invoices quick glance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Billing History</CardTitle>
              <CardDescription>Statements generated for your account</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/customer/invoices')}
            >
              See All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              id: 'inv-101',
              number: 'INV-2026-0091',
              date: '2026-10-20',
              amount: 1188,
              status: 'PAID',
            },
            {
              id: 'inv-102',
              number: 'INV-2026-0082',
              date: '2026-09-20',
              amount: 1188,
              status: 'PAID',
            },
          ].map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card/40"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-semibold text-sm text-foreground">
                    {inv.number}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(inv.date)}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="font-mono font-semibold text-sm">
                  {formatCurrency(inv.amount)}
                </span>
                <StatusBadge status={inv.status} size="sm" />
                <Button variant="ghost" size="icon-sm" title="Download PDF">
                  <Download className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerPortal;

