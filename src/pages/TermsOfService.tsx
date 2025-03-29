
import React from 'react';

const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p>
          Welcome to Open Source Love Hub. These terms and conditions outline the rules and regulations 
          for the use of our website.
        </p>
        <p>
          By accessing this website, we assume you accept these terms and conditions. Do not continue 
          to use Open Source Love Hub if you do not agree to take all of the terms and conditions stated 
          on this page.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">2. License to Use the Platform</h2>
        <p>
          Unless otherwise stated, Open Source Love Hub and/or its licensors own the intellectual property 
          rights for all material on the platform. All intellectual property rights are reserved.
        </p>
        <p>
          You may view and/or print pages from the website for your own personal use subject to 
          restrictions set in these terms and conditions.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Content</h2>
        <p>
          In these terms and conditions, "User Content" shall mean any audio, video, text, images or 
          other material you choose to submit to Open Source Love Hub. By uploading User Content, you 
          grant Open Source Love Hub a non-exclusive, worldwide, irrevocable, royalty-free license to 
          use, reproduce, adapt, publish, translate and distribute it across any media.
        </p>
        <p>
          User Content must not be illegal or unlawful, must not infringe any third party's legal rights, 
          and must not be capable of giving rise to legal action whether against you or Open Source Love Hub 
          or a third party.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Service Eligibility</h2>
        <p>
          To use our services, you must be at least 13 years old. If you are under 18, you must have 
          parental consent.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Accounts</h2>
        <p>
          When you create an account with us, you must provide information that is accurate, complete, 
          and current at all times. Failure to do so constitutes a breach of the Terms, which may 
          result in immediate termination of your account on our platform.
        </p>
        <p>
          You are responsible for safeguarding the password that you use to access the service and for 
          any activities or actions under your password.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Open Source Projects</h2>
        <p>
          Open Source Love Hub is a platform that connects contributors with open source projects. We do not 
          own or control any of the listed open source projects, and we are not responsible for their content, 
          licensing, or practices.
        </p>
        <p>
          Users who list open source projects on our platform are responsible for ensuring they have 
          the right to do so and that all information provided is accurate and up-to-date.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
        <p>
          In no event shall Open Source Love Hub, nor its directors, employees, partners, agents, suppliers, 
          or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, 
          including without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
          resulting from your access to or use of or inability to access or use the service.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Termination</h2>
        <p>
          We may terminate or suspend your account immediately, without prior notice or liability, for 
          any reason whatsoever, including without limitation if you breach the Terms.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the laws, without regard to 
          its conflict of law provisions.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
          If a revision is material we will try to provide at least 30 days' notice prior to any new 
          terms taking effect.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at: terms@opensource-lovehub.com
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
