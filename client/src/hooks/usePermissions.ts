import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

interface User {
  id: string;
  role: 'customer' | 'staff' | 'manager' | 'admin';
  isAdmin: boolean;
  permissions: string[];
}

// Define permissions constants (matching backend)
export const PERMISSIONS = {
  MANAGE_PACKAGES: 'manage_packages',
  VIEW_PACKAGES: 'view_packages',
  MANAGE_EVENTS: 'manage_events',
  VIEW_EVENTS: 'view_events',
  MANAGE_BOOKINGS: 'manage_bookings',
  VIEW_BOOKINGS: 'view_bookings',
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',
  MANAGE_ROLES: 'manage_roles',
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_CONTENT: 'manage_content',
  MODERATE_REVIEWS: 'moderate_reviews',
} as const;

// Default permissions for each role
export const ROLE_PERMISSIONS = {
  customer: [
    PERMISSIONS.VIEW_PACKAGES,
    PERMISSIONS.VIEW_EVENTS,
  ],
  staff: [
    PERMISSIONS.VIEW_PACKAGES,
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.VIEW_BOOKINGS,
    PERMISSIONS.MANAGE_BOOKINGS,
  ],
  manager: [
    PERMISSIONS.VIEW_PACKAGES,
    PERMISSIONS.MANAGE_PACKAGES,
    PERMISSIONS.VIEW_EVENTS,
    PERMISSIONS.MANAGE_EVENTS,
    PERMISSIONS.VIEW_BOOKINGS,
    PERMISSIONS.MANAGE_BOOKINGS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_CONTENT,
    PERMISSIONS.MODERATE_REVIEWS,
  ],
  admin: Object.values(PERMISSIONS),
} as const;

export function usePermissions() {
  const { user, isAuthenticated } = useAuth();

  // Get effective permissions for the current user
  const getEffectivePermissions = (user: User | null): string[] => {
    if (!user) return [];
    
    // Admin users have all permissions
    if (user.isAdmin || user.role === 'admin') {
      return Object.values(PERMISSIONS);
    }
    
    // Get default role permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.customer;
    
    // Combine role permissions with custom permissions
    const customPermissions = user.permissions || [];
    
    // Merge and deduplicate
    return Array.from(new Set([...rolePermissions, ...customPermissions]));
  };

  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    if (!isAuthenticated || !user) return false;
    
    const effectivePermissions = getEffectivePermissions(user);
    return effectivePermissions.includes(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  // Check if user has all of the specified permissions
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  // Check if user has a specific role
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  // Check if user is admin (either by role or isAdmin flag)
  const isAdmin = (): boolean => {
    return user?.isAdmin || user?.role === 'admin' || false;
  };

  // Get user's role with fallback
  const getRole = (): string => {
    return user?.role || 'customer';
  };

  // Get effective permissions list
  const getPermissions = (): string[] => {
    return getEffectivePermissions(user);
  };

  return {
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Role checks
    hasRole,
    hasAnyRole,
    isAdmin,
    
    // Getters
    getRole,
    getPermissions,
    
    // Constants for convenience
    PERMISSIONS,
    ROLE_PERMISSIONS,
    
    // User data
    user,
    isAuthenticated,
  };
}

// Higher-order component for permission-based rendering
export function withPermission<T extends {}>(
  permission: string | string[],
  Component: React.ComponentType<T>,
  fallback: React.ComponentType<T> | null = null
) {
  return function PermissionGuardedComponent(props: T) {
    const { hasPermission, hasAnyPermission } = usePermissions();
    
    const hasAccess = Array.isArray(permission) 
      ? hasAnyPermission(permission)
      : hasPermission(permission);
    
    if (!hasAccess) {
      return fallback ? React.createElement(fallback, props) : null;
    }
    
    return React.createElement(Component, props);
  };
}

// Component for conditional rendering based on permissions
interface PermissionGuardProps {
  permission: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, requires all permissions when array is passed
}

export function PermissionGuard({ 
  permission, 
  children, 
  fallback = null, 
  requireAll = false 
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
  
  let hasAccess: boolean;
  
  if (Array.isArray(permission)) {
    hasAccess = requireAll ? hasAllPermissions(permission) : hasAnyPermission(permission);
  } else {
    hasAccess = hasPermission(permission);
  }
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Hook for role-based checks
export function useRoleGuard() {
  const { hasRole, hasAnyRole, isAdmin, getRole } = usePermissions();
  
  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    getRole,
    isCustomer: () => hasRole('customer'),
    isStaff: () => hasRole('staff'),
    isManager: () => hasRole('manager'),
  };
}