import { Outlet } from 'react-router-dom';
import { Navbar } from '../features/tenants/components/Navbar';

/**
 * Authenticated layout component that includes the global navigation bar
 * and wraps all authenticated page content.
 */
export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Optional: Add a footer here if needed */}
    </div>
  );
}