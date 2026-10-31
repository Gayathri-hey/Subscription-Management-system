import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Shield,
  Briefcase,
  UserCheck,
  Lock,
  Mail,
  User,
  Building,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/shared/FormField';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/services/apiClient';
import type { Role, User as UserType } from '@/types/api';
import { getDefaultDashboardForRole } from '@/types/routes';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState<Role>('CUSTOMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid business email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('You must agree to the Terms of Service to proceed.');
      return;
    }

    setIsLoading(true);

    try {
      // Attempt backend registration endpoint (fallback smoothly if backend auth is not yet implemented)
      try {
        const response = await apiClient.post<{ user: UserType; accessToken: string }>('/auth/register', {
          name,
          email,
          company,
          role: role.toLowerCase(),
          password,
        });

        if (response.data?.user) {
          login(response.data.user, response.data.accessToken);
          navigate(getDefaultDashboardForRole(response.data.user.role));
          return;
        }
      } catch {
        // Backend auth staged for future task - simulate successful onboarding
      }

      // Simulated session for development preview
      const newUser: UserType = {
        id: `usr_${Date.now()}`,
        name,
        email,
        company: company || (role === 'CUSTOMER' ? 'Acme Corp' : 'SubScribe HQ'),
        role,
        status: 'ACTIVE',
      };

      login(newUser, `demo_token_${role.toLowerCase()}`);
      navigate(getDefaultDashboardForRole(role));
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Registration could not be completed. Please try again.'
      );
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

      <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-200 py-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-indigo-400 text-white shadow-xl shadow-primary/30 mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            SubScribe<span className="text-primary font-black">Pro</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Create your account and start managing subscriptions
          </p>
        </div>

        <Card className="border-border shadow-2xl backdrop-blur-md bg-card/80">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Create a new account</CardTitle>
            <CardDescription className="text-xs">
              Select your initial account type and enter your business details.
            </CardDescription>

            {/* Role Type Selector Pills */}
            <div className="pt-3">
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                Account Workspace Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { r: 'CUSTOMER' as Role, label: 'Customer', icon: UserCheck, desc: 'Client portal' },
                  { r: 'STAFF' as Role, label: 'Staff', icon: Briefcase, desc: 'Operations' },
                  { r: 'ADMIN' as Role, label: 'Admin', icon: Shield, desc: 'Full access' },
                ].map(({ r, label, icon: Icon, desc }) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      role === r
                        ? 'border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/30'
                        : 'border-border/60 hover:border-border hover:bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span className="text-xs font-bold">{label}</span>
                    <span className="text-[10px] text-muted-foreground/80">{desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-1">
            {errorMessage && (
              <div className="flex items-center space-x-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive animate-in fade-in-50">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3.5">
              <FormField
                type="text"
                label="Full Name"
                placeholder="e.g. David Miller"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftAdornment={<User className="h-4 w-4 text-muted-foreground" />}
                required
              />

              <FormField
                type="email"
                label="Business Email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftAdornment={<Mail className="h-4 w-4 text-muted-foreground" />}
                required
              />

              <FormField
                type="text"
                label="Company / Organization"
                placeholder="e.g. Acme Technologies Inc."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                leftAdornment={<Building className="h-4 w-4 text-muted-foreground" />}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  type="password"
                  label="Password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftAdornment={<Lock className="h-4 w-4 text-muted-foreground" />}
                  required
                />

                <FormField
                  type="password"
                  label="Confirm Password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftAdornment={<Lock className="h-4 w-4 text-muted-foreground" />}
                  required
                />
              </div>

              <div className="pt-1">
                <Checkbox
                  id="agree-terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  label="I agree to the Terms of Service and Privacy Policy."
                />
              </div>

              <Button
                type="submit"
                className="w-full font-semibold mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Create {role} Account
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 border-t border-border/60 pt-4 text-xs text-muted-foreground">
            <div className="text-center">
              <span>Already have an account? </span>
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Sign In
              </Link>
            </div>
            <div className="text-center text-[11px] text-muted-foreground/60">
              <span>Staged for Task 6 — Role Structure placeholder</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
