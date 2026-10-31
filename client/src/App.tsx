import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RoleGuard } from '@/routes/RoleGuard';

// Public Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ShowcasePage } from '@/pages/ShowcasePage';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { AdminProducts } from '@/pages/admin/AdminProducts';
import { AdminPlans } from '@/pages/admin/AdminPlans';
import { AdminReports } from '@/pages/admin/AdminReports';
import { AdminSettings } from '@/pages/admin/AdminSettings';

// Staff Pages
import { StaffDashboard } from '@/pages/staff/StaffDashboard';
import { StaffCustomers } from '@/pages/staff/StaffCustomers';
import { StaffQuotations } from '@/pages/staff/StaffQuotations';
import { StaffSubscriptions } from '@/pages/staff/StaffSubscriptions';

// Customer Pages
import { CustomerDashboard } from '@/pages/customer/CustomerDashboard';
import { CustomerSubscriptions } from '@/pages/customer/CustomerSubscriptions';
import { CustomerInvoices } from '@/pages/customer/CustomerInvoices';
import { CustomerProfile } from '@/pages/customer/CustomerProfile';

// Route Definitions
import { ROUTE_PATHS, getDefaultDashboardForRole } from '@/types/routes';

/** Root redirect helper based on active authentication and role */
const RootRedirect: React.FC = () => {
  const { user, role, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user || !role) {
    return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
  }
  return <Navigate to={getDefaultDashboardForRole(role)} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Unified Dashboard Shell Layout */}
          <Route element={<DashboardLayout />}>
            {/* UI System Showcase (accessible for reviewer testing) */}
            <Route path="/showcase" element={<ShowcasePage />} />

            {/* Admin Protected Routes */}
            <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/plans" element={<AdminPlans />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>

            {/* Staff Protected Routes */}
            <Route element={<RoleGuard allowedRoles={['ADMIN', 'STAFF']} />}>
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
              <Route path="/staff/customers" element={<StaffCustomers />} />
              <Route path="/staff/quotations" element={<StaffQuotations />} />
              <Route path="/staff/subscriptions" element={<StaffSubscriptions />} />
            </Route>

            {/* Customer Self-Service Protected Routes */}
            <Route element={<RoleGuard allowedRoles={['ADMIN', 'CUSTOMER']} />}>
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer" element={<Navigate to="/customer/dashboard" replace />} />
              <Route path="/customer/subscriptions" element={<CustomerSubscriptions />} />
              <Route path="/customer/invoices" element={<CustomerInvoices />} />
              <Route path="/customer/profile" element={<CustomerProfile />} />
            </Route>
          </Route>

          {/* Fallback 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
