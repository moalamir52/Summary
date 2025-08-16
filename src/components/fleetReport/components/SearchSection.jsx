import React from 'react';

const SearchSection = ({ 
  searchTerm, 
  setSearchTerm, 
  performSearch, 
  enableSmartSearch,
  searchCardColor,
  handleFileUpload,
  handleSearch,
  handleReset,
  exportData,
  fetchFromGoogleSheet
}) => {
  return (
    <div style={{ 
      backgroundColor: searchCardColor, 
      padding: '20px', 
      borderRadius: '12px', 
      marginBottom: '20px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🔍 البحث في الأسطول</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileUpload}
          style={{
            padding: '8px',
            border: '2px solid #ddd',
            borderRadius: '6px',
            backgroundColor: 'white'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="ابحث عن سيارة..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch && handleSearch()}
          style={{
            flex: 1,
            padding: '12px',
            border: '2px solid #ddd',
            borderRadius: '6px',
            fontSize: '16px'
          }}
        />
        <span style={{ 
          fontSize: '12px', 
          color: '#666',
          backgroundColor: 'white',
          padding: '4px 8px',
          borderRadius: '4px'
        }}>
          {enableSmartSearch ? 'بحث ذكي' : 'بحث عادي'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {handleSearch && (
          <button
            onClick={handleSearch}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            بحث
          </button>
        )}
        {exportData && (
          <button
            onClick={exportData}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            تصدير
          </button>
        )}
        {handleReset && (
          <button
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            إعادة تعيين
          </button>
        )}
        {fetchFromGoogleSheet && (
          <button
            onClick={fetchFromGoogleSheet}
            style={{
              padding: '8px 16px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            تحديث من Google Sheets
          </button>
        )}
        {searchTerm && (
          <button
            onClick={() => {
              window.open(`https://www.google.com/search?q=${encodeURIComponent(searchTerm + ' car')}&tbm=isch`, '_blank');
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff5722',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            title={`البحث عن ${searchTerm} في جوجل صور`}
          >
            🔍 صور جوجل
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchSection;