
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWaitlist } from "@/contexts/WaitlistContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const Verify = () => {
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail } = useWaitlist();

  useEffect(() => {
    const verifyToken = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");

      if (!token) {
        setVerifying(false);
        setSuccess(false);
        setMessage("Invalid verification link. No token provided.");
        return;
      }

      try {
        const result = await verifyEmail(token);
        setSuccess(result.success);
        setMessage(result.message);
      } catch (error: any) {
        setSuccess(false);
        setMessage(error.message || "An error occurred during verification.");
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [location, verifyEmail]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            Verifying your email address...
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          {verifying ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <p>Verifying your email address...</p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-lg font-medium">{message}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <XCircle className="h-16 w-16 text-destructive mb-4" />
              <p className="text-lg font-medium">{message}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate("/")} disabled={verifying}>
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Verify;
