import React, { useState } from 'react';
import { useTenant } from '../hooks/useTenant';
import { useProjects } from '../hooks/useProjects';
import { useInviteRedeem } from '../hooks/useInviteRedeem';
import { useProjectMembers } from '../hooks/useProjectMembers';
import { ProjectRole } from '../hooks/useProjects';

// Types
interface CreateTenantRequest {
  name: string;
}

// Component for creating a new tenant
const CreateTenantForm: React.FC = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/tenant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create tenant');
      }

      setName('');
      // Could trigger a refresh of tenant data here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tenant');
    }
  };

  return (
    <div className='card p-4 mb-4'>
      <h2>Create Tenant</h2>
      <form onSubmit={handleSubmit}>
        <div className='mb-3'>
          <label className='form-label'>
            Tenant Name:
            <input
              type='text'
              className='form-control'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
        </div>
        <button type='submit' className='btn btn-primary'>
          Create Tenant
        </button>
        {error && <div className='alert alert-danger mt-3'>{error}</div>}
      </form>
    </div>
  );
};

// Component for redeeming an invite
const InviteRedemption: React.FC = () => {
  const [code, setCode] = useState('');
  const { redeemInvite, loading, error, success, data, reset } = useInviteRedeem();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await redeemInvite(code);
      setCode('');
    } catch (err) {
      // Error handled by hook
    }
  };

  if (success) {
    return (
      <div className='card p-4 mb-4'>
        <h3>Successfully Joined Project!</h3>
        <p>Project: {data?.project.name}</p>
        <p>Your role: {data?.project.role}</p>
        <button onClick={reset} className='btn btn-primary'>
          Redeem Another Invite
        </button>
      </div>
    );
  }

  return (
    <div className='card p-4 mb-4'>
      <h2>Redeem Invite</h2>
      <form onSubmit={handleSubmit}>
        <div className='mb-3'>
          <label className='form-label'>
            Invite Code:
            <input
              type='text'
              className='form-control'
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
              required
            />
          </label>
        </div>
        <button type='submit' className='btn btn-primary' disabled={loading || !code}>
          {loading ? 'Redeeming...' : 'Redeem Invite'}
        </button>
        {error && <div className='alert alert-danger mt-3'>{error.message}</div>}
      </form>
    </div>
  );
};

// Component for displaying project members
const ProjectMembersList: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { members, loading, error } = useProjectMembers(projectId);

  if (loading) return <div>Loading members...</div>;
  if (error) return <div className='alert alert-danger'>{error.message}</div>;
  if (!members.length) return <div>No members found</div>;

  const admins = members.filter(m => m.role === ProjectRole.ADMIN);
  const deputies = members.filter(m => m.role === ProjectRole.DEPUTY);
  const contributors = members.filter(m => m.role === ProjectRole.CONTRIBUTOR);

  return (
    <div className='card p-3'>
      <h4>Project Members</h4>
      <div className='row'>
        <div className='col-md-4'>
          <h5>Admins ({admins.length})</h5>
          <ul className='list-unstyled'>
            {admins.map(member => (
              <li key={member.userId}>{member.userId}</li>
            ))}
          </ul>
        </div>
        <div className='col-md-4'>
          <h5>Deputies ({deputies.length})</h5>
          <ul className='list-unstyled'>
            {deputies.map(member => (
              <li key={member.userId}>{member.userId}</li>
            ))}
          </ul>
        </div>
        <div className='col-md-4'>
          <h5>Contributors ({contributors.length})</h5>
          <ul className='list-unstyled'>
            {contributors.map(member => (
              <li key={member.userId}>{member.userId}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Component for displaying projects list with pagination
const ProjectsList: React.FC = () => {
  const [page, setPage] = useState(1);
  const { projects, pagination, loading, error } = useProjects({ page, limit: 5 });

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div className='alert alert-danger'>{error.message}</div>;
  if (!projects.length) return <div>No projects found</div>;

  return (
    <div className='card p-4 mb-4'>
      <h2>Your Projects</h2>
      <div className='list-group mb-3'>
        {projects.map(project => (
          <div key={project.id} className='list-group-item'>
            <h4>{project.name}</h4>
            <p className='mb-1'>Members: {project.members.length}</p>
            <ProjectMembersList projectId={project.id} />
          </div>
        ))}
      </div>

      {pagination && (
        <div className='d-flex justify-content-between align-items-center'>
          <button
            className='btn btn-secondary'
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className='btn btn-secondary'
            onClick={() => setPage(p => p + 1)}
            disabled={page === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

// Main test page component
export const TestPage: React.FC = () => {
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant();

  if (tenantLoading) {
    return <div>Loading tenant info...</div>;
  }

  if (tenantError) {
    return (
      <div className='container mt-4'>
        <div className='alert alert-danger'>{tenantError.message}</div>
        <CreateTenantForm />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className='container mt-4'>
        <div className='alert alert-info'>No tenant found. Create one to get started.</div>
        <CreateTenantForm />
      </div>
    );
  }

  return (
    <div className='container mt-4'>
      <div className='card p-4 mb-4'>
        <h1>Current Tenant: {tenant.name}</h1>
        <p>Created: {new Date(tenant.createdAt).toLocaleDateString()}</p>
      </div>

      <div className='row'>
        <div className='col-md-6'>
          <InviteRedemption />
        </div>
        <div className='col-md-6'>
          <ProjectsList />
        </div>
      </div>
    </div>
  );
};