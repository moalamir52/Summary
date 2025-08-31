import React from 'react';

const Header = () => {
  return (
    <>
      <a
        href="https://moalamir52.github.io/Yelo/#dashboard"
        style={{
          position: 'fixed', top: '20px', left: '20px', zIndex: 1000,
          display: 'inline-block', backgroundColor: '#ffd600', color: '#6a1b9a',
          padding: '10px 20px', textDecoration: 'none', fontWeight: 'bold',
          borderRadius: '8px', border: '2px solid #6a1b9a',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        ← Back to YELO
      </a>
      <header
        style={{
          background: '#ffd600',
          boxShadow: '0 4px 12px rgb(92, 7, 248)',
          padding: '40px 40px 30px 40px', marginBottom: '18px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          maxWidth: '800px', margin: '0 auto 18px auto', borderRadius: '20px',
          minHeight: '120px', width: '90%'
        }}
      >
        <h1 style={{ fontSize: '42px', margin: '0', color: '#6a1b9a', fontWeight: '700', fontFamily: 'Montserrat, Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '1px' }}>YELO Fleet Report</h1>
        <p style={{ fontSize: '18px', marginTop: '8px', color: '#7b1fa2', fontWeight: '600', fontFamily: 'Montserrat, Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          Smart fleet insight powered by future AI intelligence 🚗
        </p>
      </header>
    </>
  );
};

export default Header;
