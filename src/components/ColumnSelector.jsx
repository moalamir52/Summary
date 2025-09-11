import React from 'react';


const ColumnSelector = ({ 
  availableColumns, 
  selectedColumns, 
  setSelectedColumns, 
  onMerge, 
  onCancel
}) => {
  const handleColumnToggle = (column) => {
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

    return (
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}
        onClick={onCancel}
      >
        <div
          style={{
            backgroundColor: '#fffde7', padding: '30px', borderRadius: '16px',
            maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto',
            boxShadow: '0 8px 32px rgba(123, 31, 162, 0.3)',
            border: '2px solid #ffe082'
          }}
          onClick={e => e.stopPropagation()}
        >
          <h3 style={{ color: '#7b1fa2', marginBottom: '20px', textAlign: 'center' }}>
            Select columns
          </h3>
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setSelectedColumns(availableColumns)}
              style={{
                backgroundColor: '#7b1fa2', color: '#ffde38', border: 'none',
                padding: '8px 16px', borderRadius: '8px', marginRight: '10px',
                cursor: 'pointer', fontSize: '14px'
              }}
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedColumns([])}
              style={{
                backgroundColor: '#ffd600', color: '#111', border: 'none',
                padding: '8px 16px', borderRadius: '8px',
                cursor: 'pointer', fontSize: '14px'
              }}
            >
              Deselect All
            </button>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px', marginBottom: '20px'
          }}>
            {availableColumns.map(column => (
              <label key={column} style={{
                display: 'flex', alignItems: 'center', padding: '8px',
                backgroundColor: selectedColumns.includes(column) ? '#fff9c4' : '#fff',
                borderRadius: '8px', border: '1px solid #ffe082',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(column)}
                  onChange={() => handleColumnToggle(column)}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontSize: '14px', color: '#7b1fa2' }}>{column}</span>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
            <button
              onClick={onMerge}
              disabled={selectedColumns.length === 0}
              style={{
                backgroundColor: selectedColumns.length > 0 ? '#7b1fa2' : '#ccc',
                color: selectedColumns.length > 0 ? '#ffde38' : '#666',
                border: 'none', padding: '12px 24px', borderRadius: '8px',
                cursor: selectedColumns.length > 0 ? 'pointer' : 'not-allowed',
                fontSize: '16px', fontWeight: 'bold'
              }}
            >
              Merge Data ({selectedColumns.length})
            </button>
            <button
              onClick={onCancel}
              style={{
                backgroundColor: '#ffd600', color: '#111', border: 'none',
                padding: '12px 24px', borderRadius: '8px',
                cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
  );
};

export default ColumnSelector;