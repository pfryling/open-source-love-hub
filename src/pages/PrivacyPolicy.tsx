
import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose prose-slate max-w-none">
        <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p>
          Welcome to Open Source Love Hub. We respect your privacy and are committed to protecting 
          your personal data. This privacy policy will inform you about how we look after your 
          personal data when you visit our website and tell you about your privacy rights and 
          how the law protects you.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">2. The Data We Collect</h2>
        <p>
          We may collect, use, store and transfer different kinds of personal data about you 
          which we have grouped together as follows:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Identity Data: includes name, username or similar identifier</li>
          <li>Contact Data: includes email address</li>
          <li>Technical Data: includes internet protocol (IP) address, browser type and version, 
          time zone setting and location, browser plug-in types and versions, operating system 
          and platform, and other technology on the devices you use to access this website</li>
          <li>Usage Data: includes information about how you use our website and services</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Collect Your Data</h2>
        <p>
          We use different methods to collect data from and about you including through:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Direct interactions: You may give us your Identity and Contact Data by filling in 
          forms or by corresponding with us.</li>
          <li>Automated technologies or interactions: As you interact with our website, we may 
          automatically collect Technical Data about your equipment, browsing actions and patterns.</li>
          <li>Third parties: We may receive data about you from various third parties such as Google 
          when you use their services to log in to our platform.</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">4. How We Use Your Data</h2>
        <p>
          We will only use your personal data when the law allows us to. Most commonly, we will use 
          your personal data in the following circumstances:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>To register you as a new user</li>
          <li>To provide and improve our services</li>
          <li>To manage our relationship with you</li>
          <li>To administer and protect our business and this website</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Security</h2>
        <p>
          We have put in place appropriate security measures to prevent your personal data from being 
          accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, 
          we limit access to your personal data to those employees, agents, contractors and other third 
          parties who have a business need to know.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Retention</h2>
        <p>
          We will only retain your personal data for as long as necessary to fulfill the purposes we 
          collected it for, including for the purposes of satisfying any legal, accounting, or reporting 
          requirements.
        </p>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Your Legal Rights</h2>
        <p>
          Under certain circumstances, you have rights under data protection laws in relation to your 
          personal data, including the right to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Request access to your personal data</li>
          <li>Request correction of your personal data</li>
          <li>Request erasure of your personal data</li>
          <li>Object to processing of your personal data</li>
          <li>Request restriction of processing your personal data</li>
          <li>Request transfer of your personal data</li>
          <li>Right to withdraw consent</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contact Us</h2>
        <p>
          If you have any questions about this privacy policy or our privacy practices, please contact 
          us at: <a href="mailto:pfryling@gmail.com" className="text-primary hover:underline">pfryling@gmail.com</a>
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
