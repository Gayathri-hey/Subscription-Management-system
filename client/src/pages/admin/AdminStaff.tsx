import React, { useState, useEffect } from 'react';
import { UserPlus, Edit2, Ban, CheckCircle, RefreshCw, AlertCircle, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormField } from '@/components/shared/FormField';
import { formatDate } from '@/lib/utils';
import { apiClient } from '@/services/apiClient';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'staff';
  status: 'active' | 'inactive' | 'suspended';
  phone?: string;
  createdAt: string;
}

export const AdminStaff: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffUser | null>(null);
  const [statusTarget, setStatusTarget] = useState<StaffUser | null>(null);

  // Add form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form fields
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const fetchStaff = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await apiClient.get<StaffUser[]>('/staff', {
        params: { page, limit: 10, search: search || undefined },
      });

      if (Array.isArray(response.data)) {
        setStaffList(response.data);
      } else {
        setStaffList([]);
      }

      if (response.meta && response.meta.totalPages) {
        setTotalPages(response.meta.totalPages);
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to retrieve staff accounts.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [page, search]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/staff', {
        name,
        email,
        phone: phone || undefined,
        password,
        confirmPassword,
      });

      setSuccessMessage(`Staff member ${name} created successfully.`);
      setIsAddModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      fetchStaff();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to create staff member.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await apiClient.put(`/staff/${editTarget.id}`, {
        name: editName,
        phone: editPhone || undefined,
      });

      setSuccessMessage(`Staff member updated successfully.`);
      setEditTarget(null);
      fetchStaff();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to update staff member.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusTarget) return;

    const nextStatus = statusTarget.status === 'active' ? 'suspended' : 'active';
    try {
      await apiClient.patch(`/staff/${statusTarget.id}/status`, {
        status: nextStatus,
      });

      setSuccessMessage(`Status for ${statusTarget.name} updated to ${nextStatus}.`);
      setStatusTarget(null);
      fetchStaff();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to update status.'
      );
    }
  };

  const openEditModal = (staff: StaffUser) => {
    setEditTarget(staff);
    setEditName(staff.name);
    setEditPhone(staff.phone || '');
  };

  const columns: Column<StaffUser>[] = [
    {
      key: 'name',
      header: 'Staff Member',
      sortable: true,
      accessor: (row) => (
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
            {row.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-foreground">{row.name}</div>
            <div className="text-xs text-muted-foreground">{row.phone || 'No direct phone'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email Address',
      sortable: true,
      accessor: (row) => <span className="font-mono text-xs">{row.email}</span>,
    },
    {
      key: 'role',
      header: 'Access Tier',
      accessor: () => <StatusBadge status="STAFF" size="sm" />,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (row) => (
        <StatusBadge
          status={row.status.toUpperCase() as any}
          size="sm"
        />
      ),
    },
    {
      key: 'createdAt',
      header: 'Provisioned On',
      sortable: true,
      accessor: (row) => (
        <span className="text-muted-foreground text-xs">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      accessor: (row) => (
        <div className="flex items-center justify-end space-x-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => openEditModal(row)}
            title="Edit Details"
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setStatusTarget(row)}
            title={row.status === 'active' ? 'Deactivate / Suspend' : 'Reactivate'}
            className={row.status === 'active' ? 'text-muted-foreground hover:text-amber-400' : 'text-muted-foreground hover:text-emerald-400'}
          >
            {row.status === 'active' ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Staff Management
            </h2>
            <div className="inline-flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
              <Shield className="h-3 w-3" />
              <span>Admin Only</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Provision and control operational staff accounts, permissions, and status.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchStaff}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            leftIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Staff Member
          </Button>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="font-bold underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center space-x-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Staff Accounts</CardTitle>
          <CardDescription>
            Active team members with operational capabilities in quotations, subscriptions, and invoicing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={staffList}
            columns={columns}
            keyExtractor={(s) => s.id}
            searchable={true}
            searchPlaceholder="Filter staff by name or email..."
            searchKeys={['name', 'email']}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Add Staff Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent onClose={() => setIsAddModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Provision New Staff Account</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateStaff} className="space-y-4 py-2">
            <FormField
              label="Full Name"
              required
              placeholder="e.g. Sarah Jenkins"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <FormField
              label="Staff Corporate Email"
              type="email"
              required
              placeholder="sarah.j@subscriptions.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <FormField
              label="Phone Number"
              placeholder="+1-555-0144"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <FormField
              label="Temporary Password"
              type="password"
              required
              placeholder="Min. 9 characters, upper, lower, special"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <FormField
              label="Confirm Password"
              type="password"
              required
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Create Staff Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Modal */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent onClose={() => setEditTarget(null)}>
          <DialogHeader>
            <DialogTitle>Edit Staff Member Details</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdateStaff} className="space-y-4 py-2">
            <FormField
              label="Full Name"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <FormField
              label="Email"
              type="email"
              inputProps={{ disabled: true }}
              value={editTarget?.email || ''}
              helperText="Staff email address is immutable"
            />

            <FormField
              label="Phone Number"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Toggle Status Confirmation */}
      <ConfirmationDialog
        open={!!statusTarget}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        title={statusTarget?.status === 'active' ? 'Suspend Staff Account' : 'Reactivate Staff Account'}
        description={`Are you sure you want to ${
          statusTarget?.status === 'active' ? 'suspend' : 'reactivate'
        } ${statusTarget?.name}? ${
          statusTarget?.status === 'active'
            ? 'They will immediately lose operational access to quotations and customer accounts.'
            : 'Access will be restored.'
        }`}
        confirmLabel={statusTarget?.status === 'active' ? 'Suspend Staff' : 'Reactivate Staff'}
        variant={statusTarget?.status === 'active' ? 'warning' : 'primary'}
        onConfirm={handleToggleStatus}
      />
    </div>
  );
};

export default AdminStaff;
