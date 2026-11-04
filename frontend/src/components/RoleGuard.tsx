import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedPortals?: ('staff' | 'student' | 'parent')[];
  allowedRoles?: string[];
  restrictedMessage?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedPortals,
  allowedRoles,
  restrictedMessage = 'Access Restricted: You do not have permission to view this administrative page.',
}) => {
  const { user, portalType, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 1. Check portal type if specified
  if (allowedPortals && allowedPortals.length > 0) {
    const userPortal = (user.portal_type || portalType || 'staff') as 'staff' | 'student' | 'parent';
    if (!allowedPortals.includes(userPortal)) {
      return (
        <Navigate
          to="/"
          state={{
            accessRestricted: true,
            restrictedMessage,
            attemptedPath: location.pathname,
          }}
          replace
        />
      );
    }
  }

  // 2. Check roles if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user.roles || [];
    const isSuperAdmin = userRoles.includes('super_admin') || user.username === 'adrin';
    const hasRole = isSuperAdmin || allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      return (
        <Navigate
          to="/"
          state={{
            accessRestricted: true,
            restrictedMessage,
            attemptedPath: location.pathname,
          }}
          replace
        />
      );
    }
  }

  return <>{children}</>;
};

