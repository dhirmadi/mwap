import { lazy } from 'react';

// Lazy load route components with chunk naming
export const Profile = lazy(() => import(/* webpackChunkName: "profile" */ '../pages/Profile'));
export const TenantAdmin = lazy(() => import(/* webpackChunkName: "tenant-admin" */ '../pages/TenantAdmin'));
export const ProjectAdmin = lazy(() => import(/* webpackChunkName: "project-admin" */ '../pages/ProjectAdmin'));