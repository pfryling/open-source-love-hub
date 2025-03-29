import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const AuthGuard = ({ children, requireAuth = false }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Save the location they were trying to go to 
        // when they were redirected to the login page
        navigate("/auth", { state: { from: location } });
      }
    }
  }, [user, loading, requireAuth, navigate, location]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not loading, and we don't require auth, or we do require auth and have a user
  if (!requireAuth || (requireAuth && user)) {
    return <>{children}</>;
  }

  // Otherwise don't render anything
  return null;
};

export default AuthGuard;
