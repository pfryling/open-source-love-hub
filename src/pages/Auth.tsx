
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import FAQ from "@/components/FAQ";
import { useWaitlist } from "@/contexts/WaitlistContext";
import WaitlistForm from "@/components/WaitlistForm";

const Auth = () => {
  const navigate = useNavigate();
  const { email, isVerified } = useWaitlist();

  // Redirect if already verified
  useEffect(() => {
    if (email && isVerified) {
      navigate("/");
    }
  }, [email, isVerified, navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8">
        <Heart className="h-12 w-12 text-primary mb-2" />
        <h1 className="text-3xl font-bold text-center">Open Source Love Hub</h1>
        <p className="text-muted-foreground text-center max-w-md mt-2">
          Join our waitlist to discover and support amazing open source projects
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div>
          <WaitlistForm />
          
          <div className="mt-6 text-sm text-muted-foreground text-center">
            <p>
              After you verify your email, you'll be able to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 max-w-md mx-auto">
              <li>Vote on projects</li>
              <li>Add your own projects</li>
              <li>Receive updates on new features</li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <FAQ />
        </div>
      </div>
    </div>
  );
};

export default Auth;
