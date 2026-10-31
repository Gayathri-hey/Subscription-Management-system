import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Trash2, Ban, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FormField } from '@/components/shared/FormField';
import { formatDate } from '@/lib/utils';
import type { Role, User } from '@/types/api';

const initialUsers: User[] = [
  {
    id: 'u1',
    name: 'Alexander Wright',
    email: 'admin@subscriptions.io',
    role: 'ADMIN',
    status: 'ACTIVE',
    company: 'Enterprise Admin HQ',
    createdAt: '2026-01-10',
  },
  {
    id: 'u2',
    name: 'Sarah Jenkins',
    email: 'sarah.j@subscriptions.io',
    role: 'STAFF',
    status: 'ACTIVE',
    company: 'Operations Group',
    createdAt: '2026-02-15',
  },
  {
    id: 'u3',
    name: 'Michael Chang',
    email: 'michael.c@subscriptions.io',
    role: 'STAFF',
    status: 'ACTIVE',
    company: 'Support Specialist',
    createdAt: '2026-03-01',
  },
  {
    id: 'u4',
    name: 'David Miller',
    email: 'david@acmecorp.com',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    company: 'Acme Corp',
    createdAt: '2026-04-12',
  },
  {
    id: 'u5',
    name: 'Elena Rostova',
    email: 'elena@cybernetics.de',
    role: 'CUSTOMER',
    status: 'SUSPENDED',
    company: 'Cybernetics GmbH',
    createdAt: '2026-05-20',
  },
];

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<User | null>(null);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('STAFF');
  const [newCompany, setNewCompany] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newUser: User = {
      id: `u_${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      status: 'ACTIVE',
      company: newCompany || 'Default Org',
      createdAt: new Date().toISOString(),
    };

    setUsers([newUser, ...users]);
    setNewName('');
    setNewEmail('');
    setNewCompany('');
    setIsAddModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      setUsers(users.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const confirmSuspend = () => {
    if (suspendTarget) {
      setUsers(
        users.map((u) =>
          u.id === suspendTarget.id
            ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }
            : u
        )
      );
      setSuspendTarget(null);
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name & Organization',
      sortable: true,
      accessor: (row) => (
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
            {row.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-foreground">{row.name}</div>
            <div className="text-xs text-muted-foreground">{row.company}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      accessor: (row) => <span className="font-mono text-xs">{row.email}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      accessor: (row) => <StatusBadge status={row.role} size="sm" />,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      key: 'createdAt',
      header: 'Created On',
      sortable: true,
      accessor: (row) => (
        <span className="text-muted-foreground">{formatDate(row.createdAt || '')}</span>
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
            onClick={() => setSuspendTarget(row)}
            title={row.status === 'ACTIVE' ? 'Suspend User' : 'Reactivate User'}
            className="text-muted-foreground hover:text-amber-400"
          >
            <Ban className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDeleteTarget(row)}
            title="Delete User"
            className="text-muted-foreground hover:text-rose-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            User & Staff Directory
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage administrative privileges, team accounts, and customer access credentials.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link to="/admin/staff">
            <Button variant="outline" leftIcon={<Users className="h-4 w-4" />}>
              Manage Staff
            </Button>
          </Link>
          <Button
            leftIcon={<UserPlus className="h-4 w-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Accounts</CardTitle>
          <CardDescription>
            Showing all accounts across Admin, Staff, and Customer tiers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={users}
            columns={columns}
            keyExtractor={(u) => u.id}
            searchable={true}
            searchPlaceholder="Filter by name, email or company..."
          />
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent onClose={() => setIsAddModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Create New User Account</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddUser} className="space-y-4 py-2">
            <FormField
              label="Full Name"
              required
              placeholder="e.g. Rachel Green"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <FormField
              label="Email Address"
              type="email"
              required
              placeholder="rachel@enterprise.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />

            <FormField
              label="Account Role"
              type="select"
              required
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
              options={[
                { value: 'ADMIN', label: 'Admin (Full Privileges)' },
                { value: 'STAFF', label: 'Staff (Operations & Quotations)' },
                { value: 'CUSTOMER', label: 'Customer (Self-service)' },
              ]}
            />

            <FormField
              label="Company / Department"
              placeholder="e.g. Global Tech"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete User Account"
        description={`Are you sure you want to delete ${deleteTarget?.name} (${deleteTarget?.email})? This action cannot be reversed.`}
        confirmLabel="Delete User"
        variant="danger"
        onConfirm={confirmDelete}
      />

      {/* Suspend Confirmation */}
      <ConfirmationDialog
        open={!!suspendTarget}
        onOpenChange={(open) => !open && setSuspendTarget(null)}
        title={suspendTarget?.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
        description={`Are you sure you want to ${
          suspendTarget?.status === 'ACTIVE' ? 'suspend' : 'reactivate'
        } ${suspendTarget?.name}? ${
          suspendTarget?.status === 'ACTIVE'
            ? 'They will immediately lose access to the portal.'
            : 'Access will be restored.'
        }`}
        confirmLabel={suspendTarget?.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
        variant="warning"
        onConfirm={confirmSuspend}
      />
    </div>
  );
};

export default AdminUsers;

