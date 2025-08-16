import React from 'react';

const SearchResultCard = ({ car, searchCardColor }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={{
        background: searchCardColor,
        borderRadius: '22px',
        boxShadow: '0 6px 24px #b39ddb33',
        padding: '32px 28px',
        minWidth: '0',
        width: '100%',
        maxWidth: '420px',
        border: '2px solid #e1bee7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        fontSize: '1.22rem',
        transition: 'transform 0.18s, box-shadow 0.18s',
        textAlign: 'left'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.45rem', color: '#6a1b9a', marginBottom: 12, letterSpacing: '1px' }}>
          🚗 {car.Model || '-'}
        </div>
        <div><strong>Plate:</strong> <span style={{ color: '#222' }}>{car["Plate No"] || '-'}</span></div>
        <div><strong>Class:</strong> <span style={{ color: '#222' }}>{car.Class || '-'}</span></div>
        <div><strong>Color:</strong> <span style={{ color: '#222' }}>{car.Color || '-'}</span></div>
        <div><strong>Year:</strong> <span style={{ color: '#222' }}>{car["Year Model"] || '-'}</span></div>
        <div><strong>Reg Exp:</strong> <span style={{ color: '#222' }}>{car.RegExp || '-'}</span></div>
        <div><strong>Insur Exp:</strong> <span style={{ color: '#222' }}>{car.InsurExp || '-'}</span></div>
        <div><strong>Mortgage:</strong> <span style={{ color: '#222' }}>{car.Mortgage || '-'}</span></div>
        <div><strong>Chassis no.:</strong> <span style={{ color: '#222' }}>{car["Chassis no."] || '-'}</span></div>
        <div><strong>Remarks:</strong> <span style={{ color: '#222' }}>{car.Remarks || '-'}</span></div>
      </div>
    </div>
  );
};

export default SearchResultCard;