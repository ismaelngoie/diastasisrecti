import React from "react";

export default function PrivacyPolicy() {
  return (
    <section style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'sans-serif', color: '#FFFFFF', lineHeight: '1.6' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', color: '#FFFFFF' }}>Privacy Policy</h1>
      <p><strong style={{ color: '#FFFFFF' }}>Effective Date: February 6, 2026</strong></p>
      
      <hr style={{ border: 0, borderTop: '1px solid rgba(255, 255, 255, 0.2)', margin: '20px 0' }} />

      <h3 style={{ color: '#FFFFFF' }}>1. Our Commitment</h3>
      <p>
        DiastaFix is designed to help users <strong>fix diastasis recti</strong> and 
        <strong>fix abdominal separation</strong> through safe, guided movements. Your privacy is a high priority.
      </p>

      <h3 style={{ color: '#FFFFFF' }}>2. Data Collection for Diastasis Recti Repair</h3>
      <ul>
        <li><strong>Assessment Data:</strong> We collect gap measurements and tissue depth to provide accurate <strong>abdominal separation repair</strong> plans.</li>
        <li><strong>Account Info:</strong> Your name and email are used to save your progress.</li>
      </ul>

      <h3 style={{ color: '#FFFFFF' }}>3. Third-Party Services</h3>
      <p>
        We use Stripe for secure payments. Your payment info is handled by Stripe under their own privacy policy. 
        We also use Google Ads to reach people looking for <strong>diastasis recti repair</strong>; however, we do not share your specific health measurements with advertisers.
      </p>

      <h3 style={{ color: '#FFFFFF' }}>4. Apple App Store Compliance</h3>
      <p>In accordance with Apple’s guidelines, you can delete your account and data directly within the app settings at any time.</p>

      <h3 style={{ color: '#FFFFFF' }}>5. Contact</h3>
      <p>For support regarding your privacy, email <strong>support@diastafix.com</strong>.</p>
    </section>
  );
}
