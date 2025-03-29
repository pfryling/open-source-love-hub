
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <Heart className="h-12 w-12 text-primary mb-2" />
        <h1 className="text-3xl font-bold text-center">Open Source Love Hub</h1>
        <p className="text-muted-foreground text-center max-w-md mt-2">
          Sign in or create an account to contribute to open source projects
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <AuthForm />
      </div>

      <div className="mt-8 text-sm text-muted-foreground text-center">
        <p>
          By signing in, you agree to our{" "}
          <a href="/terms" className="underline hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-primary">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
