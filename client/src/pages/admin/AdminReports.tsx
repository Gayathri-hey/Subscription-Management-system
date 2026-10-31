import React from 'react';
import { BarChart3, Download, Calendar, DollarSign, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

export const AdminReports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Financial & Revenue Reports
          </h2>
          <p className="text-sm text-muted-foreground">
            Comprehensive audit reports, MRR growth trends, and tax reconciliation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" leftIcon={<Calendar className="h-4 w-4" />}>
            Q4 2026
          </Button>
          <Button leftIcon={<Download className="h-4 w-4" />}>Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">
              Total Gross Billings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-foreground">
              {formatCurrency(542380)}
            </div>
            <p className="text-xs text-emerald-400 mt-2 flex items-center">
              <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
              +18.7% compared to prior year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">
              Net Revenue Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-emerald-400">
              {formatCurrency(498120)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              After tax withholding & transaction fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">
              Average Revenue Per User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-foreground">
              {formatCurrency(139.2)}
            </div>
            <p className="text-xs text-emerald-400 mt-2 flex items-center">
              <ArrowUpRight className="h-3.5 w-3.5 mr-1" />
              +6.3% expansion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Visual placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>MRR Growth Trajectory</CardTitle>
          <CardDescription>
            Monthly breakdown of recurring income, new expansion, and cancellations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 rounded-xl border border-dashed border-border bg-card/40 flex flex-col items-center justify-center p-6 text-center">
            <BarChart3 className="h-12 w-12 text-primary/40 mb-3" />
            <p className="text-sm font-medium text-foreground">
              Interactive Revenue Chart Component
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              Connects to <code className="text-primary font-mono">/analytics/revenue</code> and displays multi-series financial telemetry.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;

