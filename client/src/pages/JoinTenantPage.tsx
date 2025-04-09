import { Link } from 'react-router-dom';
import { JoinTenant } from '../features/tenants/components/JoinTenant';

export default function JoinTenantPage() {
  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Join an Existing Tenant
        </h2>
      </div>

      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <JoinTenant />
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or
              </span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/request-tenant"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Request a New Tenant
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};