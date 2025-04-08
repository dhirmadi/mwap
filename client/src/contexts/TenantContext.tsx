import React, { createContext, useContext, ReactNode } from 'react';

interface TenantContextType {
  tenantName: string;
  role: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isDeputy: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
  value: TenantContextType;
}

export function TenantProvider({ children, value }: TenantProviderProps) {
  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
}