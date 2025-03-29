
import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWaitlist } from "@/contexts/WaitlistContext";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  fallback?: ReactNode;
}

const AuthGuard = ({ children, requireAuth = false, fallback }: AuthGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const { email, isVerified, loading: waitlistLoading } = useWaitlist();
  const navigate = useNavigate();
  const location = useLocation();
  
  const loading = authLoading || waitlistLoading;
  const isAuthenticated = !!user || (email && isVerified);

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !isAuthenticated) {
        // Save the location they were trying to go to 
        // when they were redirected to the login page
        navigate("/login", { state: { from: location } });
      }
    }
  }, [user, isAuthenticated, loading, requireAuth, navigate, location]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not loading, and we don't require auth, or we do require auth and have a user
  if (!requireAuth || (requireAuth && isAuthenticated)) {
    return <>{children}</>;
  }

  // If fallback is provided, render it instead of redirecting
  if (fallback) {
    return <>{fallback}</>;
  }

  // Otherwise don't render anything
  return null;
};

export default AuthGuard;
