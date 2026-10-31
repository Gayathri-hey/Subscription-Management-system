import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Shield,
  Briefcase,
  UserCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/shared/FormField';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/services/apiClient';
import type { Role, User } from '@/types/api';
import { getDefaultDashboardForRole } from '@/types/routes';

const DEMO_PRESETS: { role: Role; label: string; email: string; name: string; defaultPass: string; icon: React.ElementType }[] = [
  {
    role: 'ADMIN',
    label: 'Admin',
    email: 'admin@subscriptions.io',
    name: 'Alexander Wright',
    defaultPass: 'AdminPass123!',
    icon: Shield,
  },
  {
    role: 'STAFF',
    label: 'Staff',
    email: 'sarah.j@subscriptions.io',
    name: 'Sarah Jenkins',
    defaultPass: 'StaffPass123!',
    icon: Briefcase,
  },
  {
    role: 'CUSTOMER',
    label: 'Customer',
    email: 'david@acmecorp.com',
    name: 'David Miller',
    defaultPass: 'CustomerPass123!',
    icon: UserCheck,
  },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState<Role>('ADMIN');
  const [email, setEmail] = useState('admin@subscriptions.io');
  const [password, setPassword] = useState('AdminPass123!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRolePresetSelect = (preset: (typeof DEMO_PRESETS)[0]) => {
    setSelectedRole(preset.role);
    setEmail(preset.email);
    setPassword(preset.defaultPass);
    setErrorMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.post<{ user: any; accessToken: string; customer?: any }>('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.data?.user) {
        const u = response.data.user;
        const normalizedRole = (u.role || selectedRole).toUpperCase() as Role;
        const loggedInUser: User = {
          id: u.id || u._id,
          name: u.name,
          email: u.email,
          role: normalizedRole,
          status: (u.status || 'ACTIVE').toUpperCase() as any,
          company: response.data.customer?.companyName || u.company || 'Enterprise Org',
        };

        login(loggedInUser, response.data.accessToken);
        navigate(getDefaultDashboardForRole(normalizedRole));
        return;
      }

      throw new Error('Authentication succeeded but user profile was not returned.');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Invalid email or password. Please verify your credentials.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background selection:bg-primary/20 selection:text-primary">
      {/* Background ambient gradient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[550px] rounded-full bg-primary/10 blur-[130px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-indigo-400 text-white shadow-xl shadow-primary/30 mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            SubScribe<span className="text-primary font-black">Pro</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Enterprise Multi-Tenant Subscription & Recurring Billing Management
          </p>
        </div>

        <Card className="border-border shadow-2xl backdrop-blur-md bg-card/80">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Sign in to your account</CardTitle>
            <CardDescription className="text-xs">
              Enter your registered corporate or customer credentials.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Role Demo Quick Autofill */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Demo Accounts
              </span>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = selectedRole === preset.role && email === preset.email;
                  return (
                    <button
                      key={preset.role}
                      type="button"
                      onClick={() => handleRolePresetSelect(preset)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/15 text-primary shadow-sm ring-1 ring-primary/40'
                          : 'border-border bg-card/60 text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4 mb-1" />
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center space-x-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <FormField
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftAdornment={<Mail className="h-4 w-4" />}
                placeholder="name@company.com"
              />

              <FormField
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftAdornment={<Lock className="h-4 w-4" />}
                placeholder="••••••••••••"
              />

              <div className="flex items-center justify-between text-xs">
                <Checkbox label="Remember me" defaultChecked />
                <Link
                  to="/forgot-password"
                  className="text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full font-semibold"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Sign In
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
            <div className="text-center">
              <span>Don't have an account? </span>
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Register as Customer
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
