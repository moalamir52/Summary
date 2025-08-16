import React from 'react';

const FloatingButtons = ({ 
  showFiltered, 
  expiryDateResult, 
  onClear, 
  onScrollToTop 
}) => {
  return (
    <>
      {/* زر Top */}
      <button
        onClick={onScrollToTop}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: '#fff',
          color: '#512da8',
          border: '2px solid #1976d2',
          borderRadius: '10px',
          padding: '5px 12px',
          fontSize: '0.95rem',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px #b39ddb33',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          transition: 'background 0.18s, transform 0.18s'
        }}
        title="Scroll to top"
      >
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.85rem' }}>
          <span style={{ fontSize: '1rem', color: '#7b1fa2', lineHeight: 1 }}>⬆️</span>
          <span style={{ fontSize: '0.6rem', color: '#7b1fa2', marginTop: '-2px' }}>TOP</span>
        </span>
        <span style={{ color: '#1976d2', fontWeight: 'bold', fontSize: '0.95rem' }}>Top</span>
      </button>

      {/* زر Clear Results */}
      {(showFiltered || expiryDateResult) && (
        <button
          onClick={onClear}
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '32px',
            zIndex: 2000,
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: '#fff',
            color: '#d32f2f',
            border: '2px solid #d32f2f',
            fontSize: '2.1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 18px #b39ddb33',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s, color 0.2s',
          }}
          title="Clear Results"
        >
          ×
        </button>
      )}
    </>
  );
};

export default FloatingButtons;