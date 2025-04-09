import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import RequireAuth from './components/RequireAuth';
import RequireSuperAdmin from './components/RequireSuperAdmin';

// Public/Onboarding Pages
import JoinTenantPage from './pages/JoinTenantPage';
import TenantRequestPage from './pages/TenantRequestPage';
import TenantSelectPage from './pages/TenantSelectPage';

// Authenticated Pages
import TenantDashboardPage from './pages/TenantDashboardPage';
import TenantMembersPage from './pages/TenantMembersPage';
import InvitePage from './pages/InvitePage';
import PendingTenantsPage from './pages/PendingTenantsPage';
import AllTenantsPage from './pages/AllTenantsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public/Onboarding Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/join-tenant" element={<JoinTenantPage />} />
        <Route path="/request-tenant" element={<TenantRequestPage />} />
        <Route path="/tenant-select" element={<TenantSelectPage />} />

        {/* Admin Routes - Protected and Wrapped in AdminLayout */}
        <Route element={
          <RequireAuth>
            <RequireSuperAdmin>
              <AdminLayout />
            </RequireSuperAdmin>
          </RequireAuth>
        }>
          <Route path="/admin/tenants/pending" element={<PendingTenantsPage />} />
          <Route path="/admin/tenants" element={<AllTenantsPage />} />
        </Route>

        {/* Tenant Routes - Protected and Wrapped in Layout */}
        <Route element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }>
          <Route path="/dashboard" element={<TenantDashboardPage />} />
          <Route path="/tenants/:tenantId/members" element={<TenantMembersPage />} />
          <Route path="/tenants/:tenantId/invite" element={<InvitePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
