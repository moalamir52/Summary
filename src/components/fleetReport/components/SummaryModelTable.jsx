import React from 'react';
import { colorizeInvygoYelo } from '../utils/colorUtils';

const SummaryModelTable = ({ 
  modelSummaryAll, 
  summaryTableFilters, 
  updateSummaryFilter, 
  clearSummaryFilters, 
  applyFilters, 
  setSelectedSummaryModel 
}) => {
  if (!modelSummaryAll.length) return null;

  return (
    <div style={{ marginTop: '32px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ color: '#7b1fa2', fontWeight: 'bold', fontSize: '2.1rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span role="img" aria-label="box">📦</span> Summary by Model ({modelSummaryAll.length})
      </h2>
      
      <div style={{ width: '100%', maxWidth: '900px', overflowX: 'auto' }}>
        <table style={{
          borderCollapse: 'collapse',
          width: '100%',
          background: '#fffde7',
          boxShadow: '0 2px 12px #b39ddb33',
          borderRadius: '16px',
          overflow: 'hidden',
          fontSize: '1.08rem',
          minWidth: '600px'
        }}>
          <thead>
            <tr style={{ background: '#ffe082', color: '#222', fontWeight: 'bold' }}>
              <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>#</th>
              <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>PIC</th>
              <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>Model</th>
              <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>Total</th>
              <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>{colorizeInvygoYelo('Invygo')}</th>
              <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>{colorizeInvygoYelo('YELO')}</th>
            </tr>
            
            {/* صف الفلاتر */}
            <tr style={{ background: '#f5f5f5' }}>
              <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                <button 
                  onClick={clearSummaryFilters}
                  style={{
                    width: '100%',
                    padding: '4px',
                    fontSize: '0.8rem',
                    background: '#ff9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  title="Clear all filters"
                >
                  Clear
                </button>
              </td>
              <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                <input
                  type="text"
                  placeholder="Filter Model"
                  value={summaryTableFilters.model}
                  onChange={(e) => updateSummaryFilter('model', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px',
                    fontSize: '0.8rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </td>
              <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                <input
                  type="text"
                  placeholder="Filter Total"
                  value={summaryTableFilters.total}
                  onChange={(e) => updateSummaryFilter('total', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px',
                    fontSize: '0.8rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </td>
              <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                <input
                  type="text"
                  placeholder="Filter Invygo"
                  value={summaryTableFilters.invygo}
                  onChange={(e) => updateSummaryFilter('invygo', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px',
                    fontSize: '0.8rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </td>
              <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                <input
                  type="text"
                  placeholder="Filter YELO"
                  value={summaryTableFilters.yelo}
                  onChange={(e) => updateSummaryFilter('yelo', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px',
                    fontSize: '0.8rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </td>
            </tr>
          </thead>
          
          <tbody>
            {applyFilters(modelSummaryAll, summaryTableFilters).map((item, i) => {
              const rowBg = i % 2 === 0 ? '#fff' : '#f5f5f5';
              return (
                <tr key={item.model} style={{ background: rowBg, textAlign: 'center' }}>
                  <td style={{ padding: '10px 8px', borderBottom: '1px solid #ffe082', textAlign: 'center', background: rowBg, cursor: 'pointer' }}
                    onClick={() => setSelectedSummaryModel({ model: item.model, filter: 'all' })}
                  >{i + 1}</td>
                  <td style={{ padding: '10px 8px', borderBottom: '1px solid #ffe082', textAlign: 'center', background: rowBg }}>
                    PIC
                  </td>
                  <td 
                    style={{ 
                      padding: '10px 8px', 
                      borderBottom: '1px solid #ffe082', 
                      textAlign: 'center', 
                      background: rowBg, 
                      cursor: 'pointer'
                    }}
                  >
                    <span
                      style={{
                        color: '#7b1fa2',
                        fontWeight: 'bold',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        marginRight: '8px'
                      }}
                      onClick={() => {
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(item.model + ' car')}&tbm=isch`, '_blank');
                      }}
                      title={`البحث عن ${item.model} في جوجل صور`}
                    >
                      {item.model}
                    </span>
                    <button
                      style={{
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: '#2196f3',
                        color: 'white',
                        border: 'none',
                        marginLeft: '8px'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://www.google.com/search?q=${encodeURIComponent(item.model + ' car')}&tbm=isch`, '_blank');
                      }}
                      title={`البحث عن ${item.model} في جوجل صور`}
                    >
                      صور
                    </button>
                  </td>
                  <td style={{ padding: '10px 8px', borderBottom: '1px solid #ffe082', textAlign: 'center', background: rowBg, cursor: 'pointer' }}
                    onClick={() => setSelectedSummaryModel({ model: item.model, filter: 'all' })}
                  >{item.total}</td>
                  <td style={{ padding: '10px 8px', borderBottom: '1px solid #ffe082', textAlign: 'center', background: '#e3f2fd', cursor: 'pointer' }}
                    onClick={() => setSelectedSummaryModel({ model: item.model, filter: 'invygo' })}
                  >{item.invygo}</td>
                  <td style={{ padding: '10px 8px', borderBottom: '1px solid #ffe082', textAlign: 'center', background: '#fffde7', cursor: 'pointer' }}
                    onClick={() => setSelectedSummaryModel({ model: item.model, filter: 'yelo' })}
                  >{item.yellow}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SummaryModelTable;