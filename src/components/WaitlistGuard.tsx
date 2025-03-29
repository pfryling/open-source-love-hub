import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWaitlist } from "@/contexts/WaitlistContext";

interface WaitlistGuardProps {
  children: ReactNode;
  requireVerified?: boolean;
  fallback?: ReactNode;
}

const WaitlistGuard = ({ children, requireVerified = false, fallback }: WaitlistGuardProps) => {
  const { email, isVerified, loading } = useWaitlist();
  const navigate = useNavigate();
  const location = useLocation();

  // Show loading state while checking waitlist status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If verified or verification not required, show children
  if (!requireVerified || (requireVerified && isVerified && email)) {
    return <>{children}</>;
  }

  // If fallback is provided, render it instead of redirecting
  if (fallback) {
    return <>{fallback}</>;
  }

  // Otherwise return null
  return null;
};

export default WaitlistGuard;
