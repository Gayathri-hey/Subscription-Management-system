import React, { useState, useEffect } from 'react';
import { Save, Lock, AlertCircle, CheckCircle2, ShieldCheck, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/shared/FormField';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/services/apiClient';

export const CustomerProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [companyName, setCompanyName] = useState(user?.company || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('US');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // UI state
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Password requirements evaluation
  const hasMinLength = newPassword.length > 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmNewPassword;
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasSpecialChar && passwordsMatch;

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await apiClient.get<{ user: any; customer: any }>('/customer/profile');
        if (response.data?.user) {
          setName(response.data.user.name || '');
          setPhone(response.data.user.phone || '');
        }
        if (response.data?.customer) {
          setCompanyName(response.data.customer.companyName || '');
          const addr = response.data.customer.billingAddress;
          if (addr) {
            setStreet(addr.street || '');
            setCity(addr.city || '');
            setState(addr.state || '');
            setPostalCode(addr.postalCode || '');
            setCountry(addr.country || 'US');
          }
        }
      } catch {
        // Fallback to auth context defaults
      }
    };

    fetchDetails();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      await apiClient.put('/customer/profile', {
        name,
        phone: phone || undefined,
        companyName: companyName || undefined,
        billingAddress: street
          ? {
              street,
              city: city || 'City',
              state: state || 'State',
              country: country || 'US',
              postalCode: postalCode || '00000',
            }
          : undefined,
      });

      setProfileSuccess('Profile information saved successfully.');
      if (refreshUser) refreshUser();
    } catch (err: unknown) {
      setProfileError(
        err instanceof Error ? err.message : 'Failed to update profile details.'
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (!isPasswordValid) {
      setPasswordError('Please ensure new password satisfies all security criteria and matches confirmation.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await apiClient.put('/customer/password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      setPasswordSuccess('Password has been changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: unknown) {
      setPasswordError(
        err instanceof Error ? err.message : 'Failed to update password.'
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Account Profile & Security
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage your personal details, corporate billing address, and account credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile & Contact Details</CardTitle>
            <CardDescription>Primary identification associated with your customer portal.</CardDescription>
          </CardHeader>

          <form onSubmit={handleSaveProfile}>
            <CardContent className="space-y-4">
              {profileSuccess && (
                <div className="flex items-center space-x-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {profileError && (
                <div className="flex items-center space-x-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <FormField
                label="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <FormField
                label="Registered Email"
                type="email"
                inputProps={{ disabled: true }}
                value={user?.email || ''}
                helperText="Email is immutable and used for secure sign-in and billing alerts"
              />

              <FormField
                label="Contact Phone"
                placeholder="+1-555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <FormField
                label="Company / Legal Entity"
                placeholder="Acme Technologies Inc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />

              <div className="pt-2 border-t border-border/40 space-y-3">
                <span className="text-xs font-semibold text-muted-foreground block">
                  Billing Address
                </span>
                <FormField
                  label="Street Address"
                  placeholder="100 Market St, Suite 400"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    label="City"
                    placeholder="San Francisco"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                  <FormField
                    label="State / Province"
                    placeholder="CA"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    label="Postal Code"
                    placeholder="94105"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                  <FormField
                    label="Country Code"
                    placeholder="US"
                    value={country}
                    onChange={(e) => setCountry(e.target.value.toUpperCase())}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t border-border/60">
              <Button
                type="submit"
                isLoading={isSavingProfile}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Profile Changes
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Security & Password Card */}
        <Card>
          <CardHeader>
            <CardTitle>Security & Password</CardTitle>
            <CardDescription>Update your credentials to maintain account security.</CardDescription>
          </CardHeader>

          <form onSubmit={handleUpdatePassword}>
            <CardContent className="space-y-4">
              {passwordSuccess && (
                <div className="flex items-center space-x-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="flex items-center space-x-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <FormField
                label="Current Password"
                type="password"
                required
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <FormField
                label="New Password"
                type="password"
                required
                placeholder="Min. 9 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <FormField
                label="Confirm New Password"
                type="password"
                required
                placeholder="Re-enter new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />

              {/* Password criteria checklist */}
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs space-y-1">
                <span className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider block mb-1">
                  Password Requirements:
                </span>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <span className={hasMinLength ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}>
                    • &gt; 8 characters
                  </span>
                  <span className={hasUppercase ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}>
                    • Uppercase letter
                  </span>
                  <span className={hasLowercase ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}>
                    • Lowercase letter
                  </span>
                  <span className={hasSpecialChar ? 'text-emerald-400 font-medium' : 'text-muted-foreground'}>
                    • Special character
                  </span>
                </div>
                {confirmNewPassword && (
                  <span className={`block pt-1 text-[11px] ${passwordsMatch ? 'text-emerald-400 font-medium' : 'text-rose-400'}`}>
                    {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </span>
                )}
              </div>
            </CardContent>

            <CardFooter className="border-t border-border/60">
              <Button
                type="submit"
                variant="outline"
                isLoading={isUpdatingPassword}
                leftIcon={<Lock className="h-4 w-4" />}
              >
                Update Password
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CustomerProfile;
