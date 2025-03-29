
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WaitlistContextType {
  email: string | null;
  isVerified: boolean;
  loading: boolean;
  joinWaitlist: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>;
  checkWaitlistStatus: (email: string) => Promise<boolean>;
  setEmail: (email: string | null) => void;
}

const WaitlistContext = createContext<WaitlistContextType | undefined>(undefined);

export const WaitlistProvider = ({ children }: { children: ReactNode }) => {
  const [email, setEmail] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check localStorage for saved email
    const savedEmail = localStorage.getItem("waitlist-email");
    if (savedEmail) {
      setEmail(savedEmail);
      // Check verification status
      checkWaitlistStatus(savedEmail).then((verified) => {
        setIsVerified(verified);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const joinWaitlist = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Check if email already exists and is verified
      const { data: existingEntries, error: fetchError } = await supabase
        .from("waitlist")
        .select("*")
        .eq("email", email);

      if (fetchError) {
        console.error("Error checking existing entries:", fetchError);
        throw fetchError;
      }

      if (existingEntries && existingEntries.length > 0) {
        const entry = existingEntries[0];
        if (entry.is_verified) {
          // Already verified
          setEmail(email);
          setIsVerified(true);
          localStorage.setItem("waitlist-email", email);
          return { 
            success: true, 
            message: "Your email is already verified! You can now participate fully." 
          };
        } else {
          // Re-send verification
          return { 
            success: true, 
            message: "A new verification email has been sent. Please check your inbox." 
          };
        }
      }

      // Insert new entry
      const { error: insertError } = await supabase
        .from("waitlist")
        .insert([{ email }]);

      if (insertError) {
        console.error("Error inserting into waitlist:", insertError);
        throw insertError;
      }
      
      // Save email to local storage
      localStorage.setItem("waitlist-email", email);
      setEmail(email);

      // In a real app, this would trigger an email with a verification link
      // For now, let's simulate by returning the token for testing
      const { data: tokenData, error: tokenError } = await supabase
        .from("waitlist")
        .select("verification_token")
        .eq("email", email)
        .single();

      if (tokenError) {
        console.error("Error fetching verification token:", tokenError);
        // Non-blocking error, we'll still return success
      } else {
        console.log("Verification token for testing:", tokenData?.verification_token);
      }

      return { 
        success: true, 
        message: "Thank you for joining the waitlist! Please check your email for verification." 
      };
    } catch (error: any) {
      console.error("Error joining waitlist:", error);
      return { 
        success: false, 
        message: error.message || "An error occurred while joining the waitlist." 
      };
    }
  };

  const verifyEmail = async (token: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Find entry with token
      const { data, error } = await supabase
        .from("waitlist")
        .select("*")
        .eq("verification_token", token)
        .single();

      if (error || !data) {
        throw new Error("Invalid or expired verification token.");
      }

      // Update verification status
      const { error: updateError } = await supabase
        .from("waitlist")
        .update({ is_verified: true })
        .eq("id", data.id);

      if (updateError) throw updateError;

      // Update local state
      setEmail(data.email);
      setIsVerified(true);
      localStorage.setItem("waitlist-email", data.email);

      return { 
        success: true, 
        message: "Email verified successfully! You can now participate fully." 
      };
    } catch (error: any) {
      console.error("Error verifying email:", error);
      return { 
        success: false, 
        message: error.message || "An error occurred during verification." 
      };
    }
  };

  const checkWaitlistStatus = async (email: string): Promise<boolean> => {
    try {
      const { data } = await supabase
        .from("waitlist")
        .select("is_verified")
        .eq("email", email)
        .single();

      return data?.is_verified || false;
    } catch (error) {
      console.error("Error checking waitlist status:", error);
      return false;
    }
  };

  const value = {
    email,
    isVerified,
    loading,
    joinWaitlist,
    verifyEmail,
    checkWaitlistStatus,
    setEmail,
  };

  return <WaitlistContext.Provider value={value}>{children}</WaitlistContext.Provider>;
};

export const useWaitlist = () => {
  const context = useContext(WaitlistContext);
  if (context === undefined) {
    throw new Error("useWaitlist must be used within a WaitlistProvider");
  }
  return context;
};
