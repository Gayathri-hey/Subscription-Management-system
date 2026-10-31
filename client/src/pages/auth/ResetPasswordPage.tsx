import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/shared/FormField';
import { apiClient } from '@/services/apiClient';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validation rules evaluation
  const hasMinLength = password.length > 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasSpecialChar;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage('Missing password reset token. Please request a new reset link.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage('Password must satisfy all security requirements.');
      return;
    }
    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post('/auth/reset-password', {
        token,
        password,
        confirmPassword,
      });

      setIsSuccess(true);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to reset password. The link may have expired.'
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
            Choose a New Account Password
          </p>
        </div>

        <Card className="border-border shadow-2xl backdrop-blur-md bg-card/80">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Set new password</CardTitle>
            <CardDescription className="text-xs">
              Create a strong, unique password to secure your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="flex items-center space-x-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isSuccess ? (
              <div className="space-y-4 py-2 text-center animate-in fade-in">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Password reset successful!</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Your password has been updated. You can now sign in with your new credentials.
                  </p>
                </div>
                <div className="pt-2">
                  <Button className="w-full" onClick={() => navigate('/login')}>
                    Proceed to Sign In
                  </Button>
                </div>
              </div>
            ) : !token ? (
              <div className="space-y-4 py-2 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AlertCircle className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Invalid Reset Link</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    No token was provided in the URL. Please verify the link in your email or request a new one.
                  </p>
                </div>
                <div className="pt-2">
                  <Link to="/forgot-password">
                    <Button variant="outline" className="w-full">
                      Request New Reset Link
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <FormField
                  label="New Password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftAdornment={<Lock className="h-4 w-4" />}
                  placeholder="Min. 9 characters"
                />

                <FormField
                  label="Confirm New Password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftAdornment={<Lock className="h-4 w-4" />}
                  placeholder="Re-enter new password"
                />

                {/* Password Criteria Checklist */}
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs space-y-1.5">
                  <div className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider mb-1">
                    Requirements:
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <div className={`flex items-center space-x-1.5 ${hasMinLength ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                      {hasMinLength ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                      <span>&gt; 8 characters</span>
                    </div>
                    <div className={`flex items-center space-x-1.5 ${hasUppercase ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                      {hasUppercase ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                      <span>Uppercase (A-Z)</span>
                    </div>
                    <div className={`flex items-center space-x-1.5 ${hasLowercase ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                      {hasLowercase ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                      <span>Lowercase (a-z)</span>
                    </div>
                    <div className={`flex items-center space-x-1.5 ${hasSpecialChar ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}`}>
                      {hasSpecialChar ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
                      <span>Special character</span>
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
                  className="w-full font-semibold"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Update Password
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
            <div className="text-center">
              <Link to="/login" className="text-primary font-medium hover:underline">
                Back to Sign In
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

