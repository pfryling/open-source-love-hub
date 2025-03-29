
// This function will handle sending verification emails to users who join the waitlist

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
    
    // Here we would send an email with the verification link
    // For demo purposes, we're just logging the link
    console.log(`Verification link for ${email}: ${verificationUrl}`);
    
    // Send a welcome email
    const welcomeMessage = `
      <h1>Welcome to Open Source Love Hub!</h1>
      <p>Thank you for joining our waitlist. Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>Once verified, you'll be able to create projects and vote on features!</p>
      <p>Best regards,<br>The Open Source Love Hub Team</p>
    `;
    
    // In a real app, you would use an email service API like:
    /*
    await emailService.send({
      from: "noreply@opensourcelovehub.com",
      to: email,
      subject: "Welcome to Open Source Love Hub - Verify Your Email",
      html: welcomeMessage
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
