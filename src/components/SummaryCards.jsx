import React from 'react';

const SummaryCards = ({ summaryAll, expiryCount, setShowSummaryDetail, setShowExpiryTable }) => {
  if (!summaryAll) {
    return null;
  }

  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
      <div className="modal-card" style={{ cursor: 'pointer' }}
        onClick={() => { setShowSummaryDetail(prev => prev === 'total' ? null : 'total'); setShowExpiryTable(false); }}
        title="Show all cars details"
      >
        <strong>Total Cars:</strong> {summaryAll.total}
      </div>
      
      <div className="modal-card" style={{ cursor: 'pointer' }}
        onClick={() => { setShowSummaryDetail(prev => prev === 'invygo' ? null : 'invygo'); setShowExpiryTable(false); }}
        title="Show Invygo cars details"
      >
        <strong>Invygo Cars:</strong> {summaryAll.invygo}
      </div>
      
      <div className="modal-card" style={{ cursor: 'pointer' }}
        onClick={() => { setShowSummaryDetail(prev => prev === 'yelo' ? null : 'yelo'); setShowExpiryTable(false); }}
        title="Show YELO cars details"
      >
        <strong>YELO Cars:</strong> {summaryAll.total - summaryAll.invygo}
      </div>
      
      <div className="modal-card"
        style={{ background: '#fffde7', border: '2px solid #ffe082', color: '#d32f2f', cursor: 'pointer', minWidth: 120 }}
        onClick={() => { setShowExpiryTable(prev => !prev); setShowSummaryDetail(null); }}
        title="Show expired cars details"
      >
        <strong>Expiry:</strong> {expiryCount}
      </div>
    </div>
  );
};

export default SummaryCards;