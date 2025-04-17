import { Navigate } from 'react-router-dom';
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
  const { tenant, isLoading, error } = useTenant();

  // First ensure user is authenticated
  return (
    <PrivateRoute>
      {isLoading ? (
        <LoadingState />
      ) : error || !tenant?.isOwner ? (
        <Navigate to="/user/profile" />
      ) : (
        <>{children}</>
      )}
    </PrivateRoute>
  );
}