import React from 'react';
import GenericTable from './GenericTable';
import ExcelLikeTable from './ExcelLikeTable';
import { colorizeInvygoYelo, searchCarImage } from '../utils.jsx';

const SummaryView = ({ 
    modelSummaryAll, 
    selectedSummaryModel, 
    setSelectedSummaryModel, 
    data 
}) => {

  const summaryColumns = [
    { header: 'Manufacturer', accessor: 'manufacturer' },
    { header: 'Model', accessor: 'model', cell: (val) => (
            <span>
                <span>{val} <span onClick={() => searchCarImage(val)} style={{cursor: 'pointer'}}>🔍</span></span>
            </span>
        )},
        { header: 'Total', accessor: 'total', cell: (val, row) => (
            <span onClick={() => setSelectedSummaryModel({ model: row.model, manufacturer: row.manufacturer, filter: 'all' })} style={{cursor: 'pointer', color: '#1976d2', textDecoration: 'underline'}}>
                {val}
            </span>
        )},
        { header: 'Invygo', accessor: 'invygo', cell: (val, row) => (
            <span onClick={() => setSelectedSummaryModel({ model: row.model, manufacturer: row.manufacturer, filter: 'invygo' })} style={{cursor: 'pointer', color: '#1976d2', textDecoration: 'underline'}}>
                {val}
            </span>
        )},
        { header: 'YELO', accessor: 'yellow', cell: (val, row) => (
            <span onClick={() => setSelectedSummaryModel({ model: row.model, manufacturer: row.manufacturer, filter: 'yelo' })} style={{cursor: 'pointer', color: '#1976d2', textDecoration: 'underline'}}>
                {val}
            </span>
        )},
    ];

    // Generate dynamic columns including EJAR columns
  const generateDetailColumns = (dataSet) => {
    // If EJAR_Category exists, map it to Class
    let hasEjarCategory = false;
    if (dataSet && dataSet.length > 0 && 'EJAR_Category' in dataSet[0]) {
      hasEjarCategory = true;
    }
    const baseColumns = [
      hasEjarCategory
        ? { header: 'Class', accessor: 'EJAR_Category' }
        : { header: 'Class', accessor: 'Class' },
      { header: 'Manufacturer', accessor: 'Manufacturer' },
      { header: 'Model', accessor: 'Model', cell: (val, row) => (
        <span>
          <span>{colorizeInvygoYelo(val)} <span onClick={() => searchCarImage(val, row['Year Model'], row['Color'])} style={{cursor: 'pointer'}}>🔍</span></span>
        </span>
      )},
      { header: 'Year', accessor: 'Year Model' },
      { header: 'Color', accessor: 'Color' },
      { header: 'Plate No', accessor: 'Plate No' },
      { header: 'Rental Rate', accessor: 'Rental Rate' },
      { header: 'Chassis no.', accessor: 'Chassis no.' },
      { header: 'Reg Exp', accessor: 'Reg Exp' },
      { header: 'Insur Exp', accessor: 'Insur Exp' },
      { header: 'Remarks', accessor: 'Remarks', cell: (val) => colorizeInvygoYelo(val) },
      { header: 'Status', accessor: 'Status' },
      { header: 'Branch', accessor: 'Branch', style: { minWidth: '120px', width: '120px' } },
    ];

    // Add EJAR columns if they exist in the data
    if (dataSet && dataSet.length > 0) {
      const sampleRow = dataSet[0];
      const ejarColumns = Object.keys(sampleRow)
        .filter(key => key.startsWith('EJAR_'))
        .map(key => ({
          header: key.replace('EJAR_', ''),
          accessor: key,
          style: { backgroundColor: '#e8f5e8', fontWeight: 'bold' }
        }));
      return [...baseColumns, ...ejarColumns];
    }
    return baseColumns;
  };

    const getFilteredData = () => {
        if (!selectedSummaryModel) return [];
        const { model, manufacturer, filter } = selectedSummaryModel;
        const baseFilter = (car) => car.Model === model && (car.Manufacturer || 'Unknown') === manufacturer;
        if (filter === 'all') return data.filter(baseFilter);
        if (filter === 'invygo') return data.filter(car => baseFilter(car) && car.isInvygo);
        if (filter === 'yelo') return data.filter(car => baseFilter(car) && !car.isInvygo);
        return [];
    }

  return (
    <div style={{ marginTop: '32px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {!selectedSummaryModel ? (
        <>
          <h2 style={{ color: '#7b1fa2', fontWeight: 'bold', fontSize: '2.1rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span role="img" aria-label="box">📦</span> Summary by Model ({modelSummaryAll.length})
          </h2>
          <ExcelLikeTable 
            data={modelSummaryAll}
            columns={summaryColumns}
            // Show only manufacturer, model, total, invygo, yellow by default
            visibleColumns={['manufacturer', 'model', 'total', 'invygo', 'yellow']}
          />
        </>
      ) : (
        <>
            <h2 style={{ fontWeight: 'bold', fontSize: '2rem', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px' }}>
                <span style={{ color: '#7b1fa2', fontWeight: 'bold' }}>{selectedSummaryModel.model}</span>
                <span style={{ color: '#222' }}>-</span>
                {selectedSummaryModel.filter === 'invygo' && colorizeInvygoYelo('Invygo Cars Details')}
                {selectedSummaryModel.filter === 'yelo' && colorizeInvygoYelo('YELO Cars Details')}
                {selectedSummaryModel.filter === 'all' && 'All Cars Details'}
                <span style={{ color: '#7b1fa2', marginLeft: 8 }}>
                    ({getFilteredData().length})
                </span>
            </h2>
      <ExcelLikeTable 
        data={getFilteredData()}
        columns={generateDetailColumns(getFilteredData())}
        visibleColumns={generateDetailColumns(getFilteredData())
          .map(col => col.accessor || col.header)
          .filter(header => header !== 'Chassis no.')}
      />
          <button
            onClick={() => setSelectedSummaryModel(null)}
            style={{
              marginTop: '22px',
              color: '#d32f2f',
              background: 'none',
              border: 'none',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            ← Back to Summary
          </button>
        </>
      )}
    </div>
  );
};

export default SummaryView;
