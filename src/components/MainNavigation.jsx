import React from 'react';

const MainNavigation = ({ onNavigate, setExpiryModalOpen }) => {
  const buttonStyle = {
    fontSize: '1.35rem', 
    fontWeight: 'bold', 
    padding: '18px 38px', 
    borderRadius: '14px',
    border: 'none',
    boxShadow: '0 2px 8px #b39ddb55', 
    cursor: 'pointer',
    transition: 'transform 0.13s, box-shadow 0.13s'
  };

  const handleMouseOver = (e) => {
    e.currentTarget.style.transform = 'scale(1.07)';
  };

  const handleMouseOut = (e) => {
    e.currentTarget.style.transform = 'scale(1)';
  };

  return (
    <div
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#fff8e1', // أصفر ذهبي أغمق قليلاً
        boxShadow: '0 4px 12px rgb(92, 7, 248)', // تظليل بنفسجي
        padding: '24px 0 18px 0', marginBottom: '18px',
        display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        maxWidth: '800px', margin: '0 auto 18px auto', borderRadius: '20px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
        <button
          onClick={() => onNavigate('search')} 
          style={{...buttonStyle, background: '#ffd600', color: '#111'}}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          Home
        </button>
        
        <button
          onClick={() => onNavigate('smart')} 
          style={{...buttonStyle, background: '#7b1fa2', color: '#ffde38'}}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          Smart
        </button>
        
        <button
          onClick={() => onNavigate('summary')} 
          style={{...buttonStyle, background: '#ffd600', color: '#111'}}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          Summary
        </button>
        
        <button
          onClick={() => setExpiryModalOpen(true)}
          style={{...buttonStyle, background: '#7b1fa2', color: '#ffde38'}}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          Cars Expiry
        </button>
      </div>
    </div>
  );
};

export default MainNavigation;
