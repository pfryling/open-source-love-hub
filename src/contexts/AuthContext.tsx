
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean, message: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean, message: string }>;
  signOut: () => Promise<void>;
  updateUserDetails: (details: { display_name?: string, avatar_url?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const setData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setLoading(false);
      }
    };

    setData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true, message: "Signed in successfully!" };
    } catch (error: any) {
      console.error("Error signing in:", error);
      return { success: false, message: error.message || "Error signing in" };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name,
          },
        } 
      });
      
      if (error) throw error;
      
      toast({
        title: "Account created",
        description: "Please check your email for a confirmation link.",
      });
      
      return { success: true, message: "Signup successful. Please check your email for confirmation." };
    } catch (error: any) {
      console.error("Error signing up:", error);
      return { success: false, message: error.message || "Error signing up" };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updateUserDetails = async (details: { display_name?: string, avatar_url?: string }) => {
    try {
      if (!user) throw new Error("Not authenticated");
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          name: details.display_name,
          avatar_url: details.avatar_url
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error("Error updating user details:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        updateUserDetails
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
