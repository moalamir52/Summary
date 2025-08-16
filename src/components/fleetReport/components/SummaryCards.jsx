import React from 'react';

const SummaryCards = ({ 
  summaryAll, 
  modelSummaryAll, 
  cardColors,
  onCardClick,
  expiryCount = 0
}) => {
  if (!summaryAll) return null;

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '15px', color: '#333' }}>📊 ملخص الأسطول</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div 
          onClick={() => onCardClick('total')}
          style={{
            backgroundColor: cardColors[0],
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>إجمالي السيارات</h4>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
            {summaryAll.total}
          </div>
        </div>

        <div 
          onClick={() => onCardClick('invygo')}
          style={{
            backgroundColor: cardColors[1],
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>سيارات Invygo</h4>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8e44ad' }}>
            {summaryAll.invygo}
          </div>
        </div>

        <div 
          onClick={() => onCardClick('yelo')}
          style={{
            backgroundColor: cardColors[2],
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>سيارات Yelo</h4>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f39c12' }}>
            {summaryAll.total - summaryAll.invygo}
          </div>
        </div>

        <div 
          onClick={() => onCardClick('expiry')}
          style={{
            backgroundColor: '#fffde7',
            border: '2px solid #ffe082',
            padding: '20px',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          <h4 style={{ margin: '0 0 10px 0', color: '#d32f2f' }}>منتهية الصلاحية</h4>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d32f2f' }}>
            {expiryCount}
          </div>
        </div>
      </div>

      {modelSummaryAll.length > 0 && (
        <div style={{ 
          backgroundColor: cardColors[3], 
          padding: '20px', 
          borderRadius: '12px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>ملخص الموديلات</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
            gap: '10px' 
          }}>
            {modelSummaryAll.slice(0, 8).map((model, idx) => (
              <div 
                key={model.model}
                style={{
                  backgroundColor: 'white',
                  padding: '10px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '12px'
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {model.model}
                </div>
                <div style={{ color: '#666' }}>
                  المجموع: {model.total}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryCards;