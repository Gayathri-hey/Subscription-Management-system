import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Building,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/shared/FormField';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/services/apiClient';
import type { Role, User as UserType } from '@/types/api';
import { getDefaultDashboardForRole } from '@/types/routes';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validation rules evaluation
  const hasMinLength = password.length > 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasSpecialChar;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage('Password must satisfy all security requirements listed below.');
      return;
    }
    if (!passwordsMatch) {
      setErrorMessage('Password and confirm password must match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post<{
        user: any;
        accessToken: string;
        customer?: any;
      }>('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        companyName: companyName.trim() || undefined,
      });

      if (response.data?.user) {
        const u = response.data.user;
        const mappedUser: UserType = {
          id: u.id || u._id,
          name: u.name,
          email: u.email,
          role: 'CUSTOMER',
          status: 'ACTIVE',
          company: response.data.customer?.companyName || companyName || 'Customer HQ',
        };

        login(mappedUser, response.data.accessToken);
        navigate(getDefaultDashboardForRole('CUSTOMER'));
        return;
      }

      navigate('/login');
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Registration could not be completed. Please try again.';
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
            Create your Customer account to manage subscriptions & billing
          </p>
        </div>

        <Card className="border-border shadow-2xl backdrop-blur-md bg-card/80">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Customer Registration</CardTitle>
            <CardDescription className="text-xs">
              Fill in your details to create your secure customer portal account.
            </CardDescription>
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
                label="Email Address"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftAdornment={<Mail className="h-4 w-4 text-muted-foreground" />}
                required
              />

              <FormField
                type="text"
                label="Company / Organization (Optional)"
                placeholder="e.g. Acme Technologies Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                leftAdornment={<Building className="h-4 w-4 text-muted-foreground" />}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  type="password"
                  label="Password"
                  placeholder="Min. 9 characters"
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

              {/* Password Requirement Checklist */}
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs space-y-1.5">
                <div className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider mb-1">
                  Password Requirements:
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <div className={`flex items-center space-x-1.5 ${hasMinLength ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                    {hasMinLength ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                    <span>More than 8 characters</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${hasUppercase ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                    {hasUppercase ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                    <span>Uppercase letter (A-Z)</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${hasLowercase ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                    {hasLowercase ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                    <span>Lowercase letter (a-z)</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${hasSpecialChar ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                    {hasSpecialChar ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                    <span>Special character (!@#$)</span>
                  </div>
                </div>
                {confirmPassword && (
                  <div className={`flex items-center space-x-1.5 text-[11px] pt-1 border-t border-border/40 ${passwordsMatch ? 'text-emerald-400 font-medium' : 'text-rose-400'}`}>
                    {passwordsMatch ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                    <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full font-semibold mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Create Customer Account
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
            <div className="text-center">
              <span>Already have an account? </span>
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
