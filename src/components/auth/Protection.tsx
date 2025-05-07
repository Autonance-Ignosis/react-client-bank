
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

import { toast } from 'sonner';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSelector((state: any) => state.user) || {};

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-t-accent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user && user.role !== 'BANK') {
    // Check if user exists but is not an admin
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
