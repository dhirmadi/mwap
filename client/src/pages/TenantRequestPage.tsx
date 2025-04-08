import { Link } from 'react-router-dom';
import { TenantRequest } from '../features/tenants/components/TenantRequest';

export default function TenantRequestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Request a New Tenant
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <TenantRequest />
          
          <div className="mt-6 text-center">
            <Link
              to="/join-tenant"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              ← Back to Join Tenant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};