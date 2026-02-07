import React from "react";

export default function ContactUs() {
  return (
    <section style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '60px 20px', 
      fontFamily: 'sans-serif', 
      color: '#FFFFFF', 
      lineHeight: '1.6',
      textAlign: 'center' 
    }}>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', marginBottom: '10px' }}>
        Contact Support
      </h1>
      <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '40px' }}>
        Questions about your abdominal separation repair? We are here to help.
      </p>

      <div style={{ 
        background: 'rgba(255, 255, 255, 0.05)', 
        padding: '30px', 
        borderRadius: '16px', 
        border: '1px solid rgba(255, 255, 255, 0.1)' 
      }}>
        <h3 style={{ marginBottom: '5px' }}>Email Us</h3>
        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
          <a href="mailto:support@diastafix.com" style={{ color: '#FFB6C1', textDecoration: 'none' }}>
            support@diastafix.com
          </a>
        </p>
        <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '10px' }}>
          We typically respond to all fix diastasis recti inquiries within 24 hours.
        </p>
      </div>

      <div style={{ marginTop: '40px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.4)' }}>
        <p>DiastaFix | © All right reserved.</p>
      </div>
    </section>
  );
}
