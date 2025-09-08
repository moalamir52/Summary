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
        { header: '#', accessor: (row, i) => i + 1 },
        { header: 'Manufacturer', accessor: 'manufacturer' },
        { header: 'Model', accessor: 'model', cell: (val) => (
            <span>
                {val} <span onClick={() => searchCarImage(val)} style={{cursor: 'pointer'}}>🔍</span>
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

    const detailColumns = [
        { header: '#', accessor: (row, i) => i + 1 },
        { header: 'Class', accessor: 'Class' },
        { header: 'Manufacturer', accessor: 'Manufacturer' },
        { header: 'Model', accessor: 'Model', cell: (val, row) => (
            <span>
                {colorizeInvygoYelo(val)} <span onClick={() => searchCarImage(val, row['Year Model'], row['Color'])} style={{cursor: 'pointer'}}>🔍</span>
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
                columns={detailColumns}
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
