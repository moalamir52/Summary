import React from 'react';
import DataTable from './DataTable';

const SmartNavigation = ({
  data,
  selectedClass,
  setSelectedClass,
  selectedMake,
  setSelectedMake,
  smartTableFilters,
  setSmartTableFilters,
  applyFilters,
  colorizeInvygoYelo
}) => {
  const uniqueClasses = [...new Set(data.map(row => row['Class']).filter(Boolean))];
  const cardColors = ['#ffe082', '#ce93d8', '#b3e5fc', '#c8e6c9', '#ffccbc', '#f8bbd0', '#fff9c4', '#b2dfdb'];

  if (!selectedClass) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px',
        margin: '0 auto',
        maxWidth: '1000px',
        justifyItems: 'center',
        marginTop: '32px'
      }}>
        {uniqueClasses.map((cls, i) => {
          const bg = cardColors[i % cardColors.length];
          return (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              style={{
                background: bg,
                borderRadius: '18px',
                fontWeight: 'bold',
                border: 'none',
                boxShadow: '0 4px 18px #b39ddb33',
                cursor: 'pointer',
                fontSize: '1.5rem',
                width: '100%',
                minHeight: '90px',
                transition: 'transform 0.15s, box-shadow 0.15s',
                textAlign: 'center',
                padding: '18px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 28px #b39ddb';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 18px #b39ddb33';
              }}
            >
              {cls}
            </button>
          );
        })}
      </div>
    );
  }

  if (selectedClass && !selectedMake) {
    const models = [...new Set(data.filter(car => car.Class === selectedClass).map(car => car.Model))].filter(Boolean);
    
    return (
      <div style={{ marginTop: '32px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ color: '#6a1b9a', marginBottom: '18px' }}>
          Models in <span style={{ color: '#ffb300' }}>{selectedClass}</span>
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          maxWidth: '1000px',
          width: '100%',
          justifyItems: 'center'
        }}>
          {models.map((model, i) => {
            const bg = cardColors[i % cardColors.length];
            return (
              <button
                key={model}
                onClick={() => setSelectedMake(model)}
                style={{
                  background: bg,
                  borderRadius: '18px',
                  fontWeight: 'bold',
                  border: 'none',
                  boxShadow: '0 4px 18px #b39ddb33',
                  fontSize: '1.2rem',
                  width: '100%',
                  minHeight: '70px',
                  padding: '16px 0',
                  textAlign: 'center',
                  marginBottom: '8px',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 28px #b39ddb';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 18px #b39ddb33';
                }}
              >
                {model}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setSelectedClass(null)}
          style={{
            marginTop: '28px',
            color: '#d32f2f',
            background: 'none',
            border: 'none',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '1.1rem'
          }}
        >
          Back to Classes
        </button>
      </div>
    );
  }

  if (selectedClass && selectedMake) {
    const filteredCars = data.filter(car => car.Class === selectedClass && car.Model === selectedMake);
    
    return (
      <div style={{ marginTop: '32px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ color: '#7b1fa2', fontWeight: 'bold', fontSize: '2rem', marginBottom: '18px' }}>
          Cars in {selectedMake} ({filteredCars.length})
        </h2>
        
        <DataTable
          data={filteredCars}
          filters={smartTableFilters}
          setFilters={setSmartTableFilters}
          applyFilters={applyFilters}
        />
        
        <button
          onClick={() => setSelectedMake(null)}
          style={{
            marginTop: '28px',
            color: '#d32f2f',
            background: 'none',
            border: 'none',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '1.1rem'
          }}
        >
          Back to Models
        </button>
      </div>
    );
  }

  return null;
};

export default SmartNavigation;