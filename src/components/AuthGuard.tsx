
import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  fallback?: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  // Always render children, regardless of auth status
  return <>{children}</>;
};

export default AuthGuard;
