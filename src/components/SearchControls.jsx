import React from 'react';

const SearchControls = ({ searchTerm, setSearchTerm, handleSearch, fetchFromGoogleSheet, handleExport, resetFilters }) => {
  return (
    <div style={{
      padding: '24px 0 18px 0',
      borderRadius: '20px',
      background: '#ffd600',
      color: '#000',
      fontWeight: 'bold',
      fontSize: '16px',
      boxShadow: '0 4px 12px rgb(92, 7, 248)',
      marginBottom: '18px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      maxWidth: '800px',
      margin: '0 auto 18px auto'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text" placeholder="Search..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ padding: '12px 16px', borderRadius: '12px', border: '2px solid #6a1b9a', fontSize: '16px', width: '350px', fontFamily: 'Montserrat, Poppins, sans-serif', outline: 'none', transition: 'border-color 0.3s' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button 
            onClick={handleSearch} 
            style={{ padding: '12px 24px', borderRadius: '10px', background: '#6a1b9a', color: '#fff', border: 'none', fontFamily: 'Montserrat, sans-serif', fontWeight: '600', cursor: 'pointer', fontSize: '14px', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(106, 27, 154, 0.3)' }}
            onMouseOver={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(106, 27, 154, 0.4)'; }}
            onMouseOut={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(106, 27, 154, 0.3)'; }}
          >🔍 Search</button>
          <button 
            onClick={fetchFromGoogleSheet} 
            style={{ padding: '12px 24px', borderRadius: '10px', background: '#f5e728ff', color: '#6a1b9a', border: '2px solid #ffd600', fontFamily: 'Montserrat, sans-serif', fontWeight: '600', cursor: 'pointer', fontSize: '14px', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(255, 214, 0, 0.3)' }}
            onMouseOver={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(255, 214, 0, 0.4)'; }}
            onMouseOut={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(255, 214, 0, 0.3)'; }}
          >🔄 Reload</button>
          <button 
            onClick={handleExport} 
            style={{ padding: '12px 24px', borderRadius: '10px', background: '#6a1b9a', color: '#fff', border: 'none', fontFamily: 'Montserrat, sans-serif', fontWeight: '600', cursor: 'pointer', fontSize: '14px', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(106, 27, 154, 0.3)' }}
            onMouseOver={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(106, 27, 154, 0.4)'; }}
            onMouseOut={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(106, 27, 154, 0.3)'; }}
          >📤 Export</button>
          <button 
            onClick={resetFilters} 
            style={{ padding: '12px 24px', borderRadius: '10px', background: '#f5e728ff', color: '#6a1b9a', border: '2px solid #ffd600', fontFamily: 'Montserrat, sans-serif', fontWeight: '600', cursor: 'pointer', fontSize: '14px', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(255, 214, 0, 0.3)' }}
            onMouseOver={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(255, 214, 0, 0.4)'; }}
            onMouseOut={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(255, 214, 0, 0.3)'; }}
          >🔄 Reset</button>
        </div>
      </div>
    </div>
  );
};

export default SearchControls;
