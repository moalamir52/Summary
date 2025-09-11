import React from 'react';
import ExcelLikeTable from './ExcelLikeTable';
import { colorizeInvygoYelo, searchCarImage } from '../utils';

const ResultsDisplay = ({ 
    showFiltered, 
    filtered, 
    searchCardColor,
    showExpiryTable,
    expiryCount,
    data,
    showSummaryDetail,
    summaryAll,
    expiryDateResult
}) => {

    // Generate dynamic columns including EJAR columns
  const generateColumns = (dataSet) => {
    const baseColumns = [
      { header: 'Class', accessor: 'Class' },
      { header: 'Manufacturer', accessor: 'Manufacturer' },
      { header: 'Model', accessor: 'Model', cell: (val, row) => <span onClick={() => searchCarImage(val, row['Year Model'], row['Color'])} style={{cursor: 'pointer'}}>{colorizeInvygoYelo(val)} 🔍</span> },
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



    if (showFiltered && filtered.length > 0) {
        return (
            <div style={{ marginTop: '20px' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: 18, color: '#6a1b9a', textAlign: 'center' }}>🔍 Search Results
                <span style={{ fontSize: '1.2rem', color: '#7b1fa2', marginLeft: 10 }}>
                  ({filtered.length})
                </span>
              </h2>
              {filtered.length === 1 ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <div
                    style={{
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
                    }}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '1.45rem', color: '#6a1b9a', marginBottom: 12, letterSpacing: '1px' }}>
                      🚗 <span onClick={() => searchCarImage(filtered[0].Model, filtered[0]['Year Model'], filtered[0].Color)} style={{cursor: 'pointer'}}>{filtered[0].Model || '-'} 🔍</span>
                    </div>
                    <div><strong>Class:</strong> <span style={{ color: '#222' }}>{filtered[0].Class || '-'}</span></div>
                    <div><strong>Manufacturer:</strong> <span style={{ color: '#222' }}>{filtered[0].Manufacturer || '-'}</span></div>
                    <div><strong>Model:</strong> <span style={{ color: '#222' }}>{filtered[0].Model || '-'}</span></div>
                    <div><strong>Year:</strong> <span style={{ color: '#222' }}>{filtered[0]["Year Model"] || '-'}</span></div>
                    <div><strong>Plate:</strong> <span style={{ color: '#222' }}>{filtered[0]["Plate No"] || '-'}</span></div>
                    <div><strong>Color:</strong> <span style={{ color: '#222' }}>{filtered[0].Color || '-'}</span></div>
                    <div><strong>Reg Exp:</strong> <span style={{ color: '#222' }}>{filtered[0].RegExp || '-'}</span></div>
                    <div><strong>Insur Exp:</strong> <span style={{ color: '#222' }}>{filtered[0].InsurExp || '-'}</span></div>
                    <div><strong>Mortgage:</strong> <span style={{ color: '#222' }}>{filtered[0].Mortgage || '-'}</span></div>
                    <div><strong>Chassis no.:</strong> <span style={{ color: '#222' }}>{filtered[0]["Chassis no."] || '-'}</span></div>
                    <div><strong>Remarks:</strong> <span style={{ color: '#222' }}>{filtered[0].Remarks || '-'}</span></div>
                    <div><strong>Status:</strong> <span style={{ color: '#222' }}>{filtered[0].Status || 'Unknown'}</span></div>
                    <div><strong>Branch:</strong> <span style={{ color: '#222' }}>{filtered[0].Branch || 'Unknown'}</span></div>
                    
                    {/* EJAR Data */}
                    {Object.keys(filtered[0]).filter(key => key.startsWith('EJAR_')).map(key => (
                      <div key={key} style={{ backgroundColor: '#e8f5e8', padding: '4px 8px', borderRadius: '4px', margin: '2px 0' }}>
                        <strong>{key.replace('EJAR_', '')}:</strong> <span style={{ color: '#222' }}>{filtered[0][key] || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  <ExcelLikeTable 
                      data={filtered}
                      columns={generateColumns(filtered)}
                  />
                </div>
              )}
            </div>
        )
    } else if (showExpiryTable) {
        const expiredCars = data.filter(car => {
            const exp = car.RegExp || car["Reg Exp"];
            if (!exp) return false;
            let d;
            if (typeof exp === "string" && exp.includes("-")) d = new Date(exp);
            else if (typeof exp === "string" && exp.includes("/")) {
              const [day, mon, yr] = exp.split("/");
              d = new Date(`${yr}-${mon}-${day}`);
            } else if (exp instanceof Date) d = exp;
            else return false;
            return d <= new Date();
        });

        return (
            <div style={{ marginTop: '32px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ color: '#7b1fa2', fontWeight: 'bold', fontSize: '2rem', marginBottom: '18px' }}>
                    Expiry Details ({expiryCount})
                </h2>
                <ExcelLikeTable 
                    data={expiredCars}
                    columns={generateColumns(expiredCars)}
                />
            </div>
        )
    } else if (expiryDateResult) {
        return (
            <div style={{ marginTop: '32px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ color: '#7b1fa2', fontWeight: 'bold', fontSize: '2rem', marginBottom: '18px' }}>
                    Expiry Details ({expiryDateResult.cars.length})
                </h2>
                <ExcelLikeTable 
                    data={expiryDateResult.cars}
                    columns={generateColumns(expiryDateResult.cars)}
                />
            </div>
        )
    } else if (showSummaryDetail) {
        let summaryData;
        let title = '';
        if (showSummaryDetail === 'total') {
            summaryData = data;
            title = `All Cars Details (${summaryAll.total})`
        } else if (showSummaryDetail === 'invygo') {
            summaryData = data.filter(car => (car.Remarks || '').toUpperCase().includes('INVYGO'));
            title = `Invygo Cars Details (${summaryAll.invygo})`
        } else {
            summaryData = data.filter(car => !(car.Remarks || '').toUpperCase().includes('INVYGO'));
            title = `YELO Cars Details (${summaryAll.total - summaryAll.invygo})`
        }

        return (
            <div style={{ marginTop: '32px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ fontWeight: 'bold', fontSize: '2rem', marginBottom: '18px' }}>
                    {title}
                </h2>
                <ExcelLikeTable 
                    data={summaryData}
                    columns={generateColumns(summaryData)}
                />
            </div>
        )
    }

    return null;
};

export default ResultsDisplay;