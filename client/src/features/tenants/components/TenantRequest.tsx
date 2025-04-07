import { useState } from 'react';
import { useTenantApi } from '../services/tenantApi';

export const TenantRequest = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { requestTenant } = useTenantApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await requestTenant(name.trim());
      setSuccess(response.message);
      setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700">
          Tenant Name
        </label>
        <input
          id="tenantName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter tenant name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          minLength={2}
          maxLength={100}
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      {success && (
        <div className="text-green-600 text-sm">{success}</div>
      )}

      <button
        type="submit"
        disabled={isLoading || !name.trim()}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
      >
        {isLoading ? 'Submitting...' : 'Request Tenant'}
      </button>
    </form>
  );
};