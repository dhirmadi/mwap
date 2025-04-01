import { AppShell } from '@mantine/core';
import { useAuth0 } from '@auth0/auth0-react';
import { TenantProvider } from './contexts/TenantContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/navigation/Header';
import { Home } from './pages/Home';
import { TenantManagement } from './pages/TenantManagement';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { AdminDashboard } from './pages/AdminDashboard';
import { TenantAdminDashboard } from './pages/TenantAdminDashboard';

// Protected route wrapper
function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, isLoading } = useAuth0();
  const { isSuperAdmin, userRole } = useTenant();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (requiredRole === 'super_admin' && !isSuperAdmin) {
    return <Navigate to="/" />;
  }

  if (requiredRole === 'admin' && userRole !== 'admin' && !isSuperAdmin) {
    return <Navigate to="/" />;
  }

  return children;
}

function App() {
  const { isAuthenticated } = useAuth0();

  return (
    <Router>
      <TenantProvider>
        <AppShell
          header={{ height: 60 }}
          padding="md"
        >
          <AppShell.Header>
            <Header />
          </AppShell.Header>

          <AppShell.Main>
            <Routes>
              <Route path="/" element={isAuthenticated ? <TenantManagement /> : <Home />} />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="super_admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/tenant-admin" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <TenantAdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </AppShell.Main>
        </AppShell>
      </TenantProvider>
    </Router>
  );
}

export default App;
