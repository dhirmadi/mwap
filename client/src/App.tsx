import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Layout } from './components/Layout';
import { RequireAuth } from './components/RequireAuth';

// Public/Onboarding Pages
import { JoinTenantPage } from './pages/JoinTenantPage';
import { TenantRequestPage } from './pages/TenantRequestPage';
import { TenantSelectPage } from './pages/TenantSelectPage';

// Authenticated Pages
import { TenantDashboardPage } from './pages/TenantDashboardPage';
import { TenantMembersPage } from './pages/TenantMembersPage';
import { InvitePage } from './pages/InvitePage';
import { PendingTenantsPage } from './pages/PendingTenantsPage';
import { AllTenantsPage } from './pages/AllTenantsPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public/Onboarding Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/join-tenant" element={<JoinTenantPage />} />
        <Route path="/request-tenant" element={<TenantRequestPage />} />
        <Route path="/tenant-select" element={<TenantSelectPage />} />

        {/* Authenticated Routes - Protected and Wrapped in Layout */}
        <Route element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }>
          {/* Tenant Routes */}
          <Route path="/dashboard" element={<TenantDashboardPage />} />
          <Route path="/tenants/:tenantId/members" element={<TenantMembersPage />} />
          <Route path="/tenants/:tenantId/invite" element={<InvitePage />} />

          {/* Admin Routes */}
          <Route path="/admin/tenants/pending" element={<PendingTenantsPage />} />
          <Route path="/admin/tenants" element={<AllTenantsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
