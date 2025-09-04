import React from 'react';
import GenericTable from './GenericTable';
import { colorizeInvygoYelo, searchCarImage } from '../utils.jsx';

const SmartNavView = ({ 
  data, 
  selectedClass, 
  setSelectedClass, 
  selectedMake, 
  setSelectedMake, 
  smartTableFilters, 
  updateSmartFilter, 
  clearSmartFilters, 
  applyFilters 
}) => {

  const uniqueClasses = [...new Set(data.map(row => row['Class']).filter(Boolean))];
  const uniqueMakes = selectedClass
    ? [...new Set(data.filter(r => r.Class === selectedClass).map(r => r['Manufacturer']).filter(Boolean))]
    : [];

  const columns = [
    { header: '#', accessor: (row, i) => i + 1 },
    { header: 'Class', accessor: 'Class' },
    { header: 'Manufacturer', accessor: 'Manufacturer' },
    { header: 'Model', accessor: 'Model', cell: (val, row) => (
        <span>
            {colorizeInvygoYelo(val)} <span onClick={() => searchCarImage(val, row['Year Model'], row['Color'])} style={{cursor: 'pointer'}}>🔍</span>
        </span>
    )},
    { header: 'Year', accessor: 'Year Model' },
    { header: 'Plate No', accessor: 'Plate No' },
    { header: 'Color', accessor: 'Color' },
    { header: 'Reg Expiry', accessor: 'RegExp' },
    { header: 'Insur Expiry', accessor: 'InsurExp' },
    { header: 'Mortgage', accessor: 'Mortgage' },
    { header: 'Remarks', accessor: 'Remarks', cell: (val) => colorizeInvygoYelo(val) },
    { header: 'Status', accessor: 'Status' },
    { header: 'Branch', accessor: 'Branch', style: { minWidth: '120px', width: '120px' } },
  ];

  return (
    <div>
      {!selectedClass && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
            margin: '0 auto',
            maxWidth: '1000px',
            justifyItems: 'center',
            marginTop: '32px'
          }}
        >
          {uniqueClasses.map((cls, i) => {
            const colors = ['#ffe082', '#ce93d8', '#b3e5fc', '#c8e6c9', '#ffccbc', '#f8bbd0', '#fff9c4', '#b2dfdb'];
            const bg = colors[i % colors.length];
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
      )}

      {selectedClass && !selectedMake && (
        <div style={{ marginTop: '32px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ color: '#6a1b9a', marginBottom: '18px' }}>
            Models in <span style={{ color: '#ffb300' }}>{selectedClass}</span>
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px',
              maxWidth: '1000px',
              width: '100%',
              justifyItems: 'center'
            }}
          >
            {[...new Set(data.filter(car => car.Class === selectedClass).map(car => car.Model))]
              .filter(Boolean)
              .map((model, i) => {
                const colors = ['#ffe082', '#ce93d8', '#b3e5fc', '#c8e6c9', '#ffccbc', '#f8bbd0', '#fff9c4', '#b2dfdb'];
                const bg = colors[i % colors.length];
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
      )}

      {selectedClass && selectedMake && (
         <div style={{ marginTop: '32px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ color: '#7b1fa2', fontWeight: 'bold', fontSize: '2rem', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px' }}>
                {colorizeInvygoYelo(`Cars in ${selectedMake} (${data.filter(car => car.Class === selectedClass && car.Model === selectedMake).length})`)}
            </h2>
            <GenericTable 
                data={data.filter(car => car.Class === selectedClass && car.Model === selectedMake)}
                columns={columns}
                filters={smartTableFilters}
                updateFilter={updateSmartFilter}
                clearFilters={clearSmartFilters}
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
      )}
    </div>
  );
};

export default SmartNavView;
