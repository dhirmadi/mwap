import { Navigate, useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useTenant } from '../../hooks/useTenant';
import { LoadingState } from '../common';
import { PrivateRoute } from './PrivateRoute';

interface TenantOwnerRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard that requires tenant owner access
 * Redirects to profile if not tenant owner
 */
export function TenantOwnerRoute({ children }: TenantOwnerRouteProps): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth0();
  const { tenant, isLoading, error } = useTenant(id);

  // First ensure user is authenticated
  return (
    <PrivateRoute>
      {isLoading ? (
        <LoadingState />
      ) : error || !tenant || !user ? (
        <Navigate to="/user/profile" />
      ) : !tenant.members.some(m => m.userId === user.sub && m.role === 'OWNER') ? (
        <Navigate to="/user/profile" />
      ) : (
        <>{children}</>
      )}
    </PrivateRoute>
  );
}