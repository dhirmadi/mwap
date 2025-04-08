import { useAuth0 } from '@auth0/auth0-react';
import { NavLink } from 'react-router-dom';
import { useTenantContext } from '../hooks/useTenantContext';

interface NavItemProps {
  to: string;
  children: React.ReactNode;
}

const NavItem = ({ to, children }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      px-3 py-2 rounded-md text-sm font-medium
      ${isActive
        ? 'bg-gray-900 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }
    `}
  >
    {children}
  </NavLink>
);

const NavbarSkeleton = () => (
  <nav className="bg-gray-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="animate-pulse bg-gray-600 h-4 w-32 rounded"></div>
        <div className="flex space-x-4">
          <div className="animate-pulse bg-gray-600 h-4 w-24 rounded"></div>
          <div className="animate-pulse bg-gray-600 h-4 w-24 rounded"></div>
        </div>
      </div>
    </div>
  </nav>
);

export function Navbar() {
  const { user, logout } = useAuth0();
  const {
    tenantName,
    role,
    isSuperAdmin,
    isAdmin,
    isDeputy,
    isContributor
  } = useTenantContext();

  // Get tenant ID from localStorage for dynamic links
  const tenantId = localStorage.getItem('currentTenantId');

  // Show skeleton while loading tenant context
  if (!role && !isSuperAdmin) {
    return <NavbarSkeleton />;
  }

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Tenant Name */}
          <div className="flex-shrink-0">
            <span className="text-white font-semibold">
              {isSuperAdmin ? 'Admin Portal' : tenantName}
            </span>
          </div>

          {/* Center: Navigation Links */}
          <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
            <div className="hidden sm:block sm:ml-6">
              <div className="flex space-x-4">
                {/* Super Admin Links */}
                {isSuperAdmin && (
                  <>
                    <NavItem to="/admin/tenants/pending">Pending Tenants</NavItem>
                    <NavItem to="/admin/tenants">All Tenants</NavItem>
                  </>
                )}

                {/* Admin Links */}
                {isAdmin && tenantId && (
                  <>
                    <NavItem to="/dashboard">Dashboard</NavItem>
                    <NavItem to={`/tenants/${tenantId}/members`}>Manage Members</NavItem>
                    <NavItem to={`/tenants/${tenantId}/invite`}>Invite Users</NavItem>
                  </>
                )}

                {/* Deputy Links */}
                {isDeputy && tenantId && (
                  <>
                    <NavItem to="/dashboard">Dashboard</NavItem>
                    <NavItem to={`/tenants/${tenantId}/members`}>Members</NavItem>
                    <NavItem to={`/tenants/${tenantId}/invite`}>Invite</NavItem>
                  </>
                )}

                {/* Contributor Links */}
                {isContributor && (
                  <NavItem to="/dashboard">Dashboard</NavItem>
                )}
              </div>
            </div>
          </div>

          {/* Right: User Info & Logout */}
          <div className="flex items-center space-x-4">
            {/* User Email - Hidden on mobile */}
            <span className="hidden md:block text-gray-300 text-sm">
              {user?.email}
            </span>

            {/* Logout Button */}
            <button
              onClick={() => logout({ returnTo: window.location.origin })}
              className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>

            {/* Mobile Menu Button */}
            <div className="sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Open main menu</span>
                {/* Heroicon menu icon */}
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu - Could be expanded with state management */}
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Super Admin Links */}
            {isSuperAdmin && (
              <>
                <NavItem to="/admin/tenants/pending">Pending Tenants</NavItem>
                <NavItem to="/admin/tenants">All Tenants</NavItem>
              </>
            )}

            {/* Admin Links */}
            {isAdmin && tenantId && (
              <>
                <NavItem to="/dashboard">Dashboard</NavItem>
                <NavItem to={`/tenants/${tenantId}/members`}>Manage Members</NavItem>
                <NavItem to={`/tenants/${tenantId}/invite`}>Invite Users</NavItem>
              </>
            )}

            {/* Deputy Links */}
            {isDeputy && tenantId && (
              <>
                <NavItem to="/dashboard">Dashboard</NavItem>
                <NavItem to={`/tenants/${tenantId}/members`}>Members</NavItem>
                <NavItem to={`/tenants/${tenantId}/invite`}>Invite</NavItem>
              </>
            )}

            {/* Contributor Links */}
            {isContributor && (
              <NavItem to="/dashboard">Dashboard</NavItem>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}