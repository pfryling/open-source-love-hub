
// This is a stub for a real email verification function
// In a real app, you would use a service like Resend, SendGrid, or Postmark to send the emails

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const { email } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the verification token for the email
    const { data, error } = await supabase
      .from("waitlist")
      .select("verification_token")
      .eq("email", email)
      .single();
    
    if (error) throw error;
    
    // Construct verification URL
    // In a real app, this would be your deployed URL
    const verificationUrl = `${req.headers.get("origin")}/verify?token=${data.verification_token}`;
    
    // Here you would send an email with the verification link
    // For demo purposes, we're just logging the link
    console.log(`Verification link for ${email}: ${verificationUrl}`);
    
    // In a real app, you would use an email service like:
    /*
    await emailService.send({
      from: "noreply@yourdomain.com",
      to: email,
      subject: "Verify your email for Open Source Love Hub",
      html: `
        <h1>Welcome to Open Source Love Hub!</h1>
        <p>Click the link below to verify your email and get full access:</p>
        <a href="${verificationUrl}">Verify Email</a>
      `
    });
    */
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification email sent successfully.",
        // Only in development for testing:
        verificationUrl 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in verify-email function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || "An error occurred while sending the verification email." 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
