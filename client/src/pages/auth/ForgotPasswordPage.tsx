import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/shared/FormField';
import { apiClient } from '@/services/apiClient';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.post<{ message: string }>('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });

      setIsSubmitted(true);
      setStatusMessage(
        response.message ||
          'If the account exists, a password reset link has been dispatched to your email.'
      );
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to submit request. Please try again later.'
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
            Account Access Recovery
          </p>
        </div>

        <Card className="border-border shadow-2xl backdrop-blur-md bg-card/80">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Reset your password</CardTitle>
            <CardDescription className="text-xs">
              Enter your registered email address and we will dispatch a secure, time-limited reset link.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="flex items-center space-x-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isSubmitted ? (
              <div className="space-y-4 py-2 text-center animate-in fade-in">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Check your inbox</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {statusMessage}
                  </p>
                </div>
                <div className="pt-2">
                  <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
                    Send another request
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  label="Registered Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftAdornment={<Mail className="h-4 w-4" />}
                  placeholder="name@company.com"
                />

                <Button
                  type="submit"
                  className="w-full font-semibold"
                  isLoading={isLoading}
                  rightIcon={<Send className="h-4 w-4" />}
                >
                  Send Reset Link
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center space-x-1.5 text-primary font-medium hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

