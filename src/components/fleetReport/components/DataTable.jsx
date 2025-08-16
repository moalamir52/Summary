import React from 'react';

const DataTable = ({ 
  data, 
  title, 
  filters, 
  setFilters, 
  applyFilters,
  maxHeight = '400px' 
}) => {
  const filteredData = applyFilters(data, filters);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (!data || data.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px', 
        color: '#666',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        لا توجد بيانات للعرض
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      {title && (
        <h3 style={{ marginBottom: '15px', color: '#333' }}>{title}</h3>
      )}
      
      <div style={{ 
        overflowX: 'auto', 
        maxHeight,
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: 'white'
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '12px'
        }}>
          <thead style={{ 
            backgroundColor: '#f8f9fa',
            position: 'sticky',
            top: 0,
            zIndex: 1
          }}>
            <tr>
              <th style={{ padding: '8px', border: '1px solid #ddd', minWidth: '100px' }}>
                <div>الموديل</div>
                <input
                  type="text"
                  placeholder="فلتر..."
                  value={filters.model}
                  onChange={(e) => handleFilterChange('model', e.target.value)}
                  style={{ 
                    width: '90px', 
                    padding: '2px', 
                    fontSize: '10px',
                    marginTop: '4px'
                  }}
                />
              </th>
              <th style={{ padding: '8px', border: '1px solid #ddd', minWidth: '50px' }}>
                <div>PIC</div>
              </th>
              <th style={{ padding: '8px', border: '1px solid #ddd', minWidth: '80px' }}>
                <div>السنة</div>
                <input
                  type="text"
                  placeholder="فلتر..."
                  value={filters.year}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  style={{ 
                    width: '70px', 
                    padding: '2px', 
                    fontSize: '10px',
                    marginTop: '4px'
                  }}
                />
              </th>
              <th style={{ padding: '8px', border: '1px solid #ddd', minWidth: '80px' }}>
                <div>اللون</div>
                <input
                  type="text"
                  placeholder="فلتر..."
                  value={filters.color}
                  onChange={(e) => handleFilterChange('color', e.target.value)}
                  style={{ 
                    width: '70px', 
                    padding: '2px', 
                    fontSize: '10px',
                    marginTop: '4px'
                  }}
                />
              </th>
              <th style={{ padding: '8px', border: '1px solid #ddd', minWidth: '100px' }}>
                <div>رقم اللوحة</div>
                <input
                  type="text"
                  placeholder="فلتر..."
                  value={filters.plateNo}
                  onChange={(e) => handleFilterChange('plateNo', e.target.value)}
                  style={{ 
                    width: '90px', 
                    padding: '2px', 
                    fontSize: '10px',
                    marginTop: '4px'
                  }}
                />
              </th>
              <th style={{ padding: '8px', border: '1px solid #ddd', minWidth: '80px' }}>
                <div>الإيجار</div>
                <input
                  type="text"
                  placeholder="فلتر..."
                  value={filters.rentalRate}
                  onChange={(e) => handleFilterChange('rentalRate', e.target.value)}
                  style={{ 
                    width: '70px', 
                    padding: '2px', 
                    fontSize: '10px',
                    marginTop: '4px'
                  }}
                />
              </th>
              <th style={{ padding: '8px', border: '1px solid #ddd', minWidth: '120px' }}>
                <div>رقم الشاسيه</div>
                <input
                  type="text"
                  placeholder="فلتر..."
                  value={filters.chassisNo}
                  onChange={(e) => handleFilterChange('chassisNo', e.target.value)}
                  style={{ 
                    width: '110px', 
                    padding: '2px', 
                    fontSize: '10px',
                    marginTop: '4px'
                  }}
                />
              </th>
              <th style={{ padding: '8px', border: '1px solid #ddd', minWidth: '100px' }}>
                <div>انتهاء التسجيل</div>
                <input
                  type="text"
                  placeholder="فلتر..."
                  value={filters.regExp}
                  onChange={(e) => handleFilterChange('regExp', e.target.value)}
                  style={{ 
                    width: '90px', 
                    padding: '2px', 
                    fontSize: '10px',
                    marginTop: '4px'
                  }}
                />
              </th>
              <th style={{ padding: '8px', border: '1px solid #ddd', minWidth: '100px' }}>
                <div>انتهاء التأمين</div>
                <input
                  type="text"
                  placeholder="فلتر..."
                  value={filters.insurExp}
                  onChange={(e) => handleFilterChange('insurExp', e.target.value)}
                  style={{ 
                    width: '90px', 
                    padding: '2px', 
                    fontSize: '10px',
                    marginTop: '4px'
                  }}
                />
              </th>
              <th style={{ padding: '8px', border: '1px solid #ddd', minWidth: '100px' }}>
                <div>ملاحظات</div>
                <input
                  type="text"
                  placeholder="فلتر..."
                  value={filters.remarks}
                  onChange={(e) => handleFilterChange('remarks', e.target.value)}
                  style={{ 
                    width: '90px', 
                    padding: '2px', 
                    fontSize: '10px',
                    marginTop: '4px'
                  }}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, idx) => (
              <tr key={idx} style={{ 
                backgroundColor: idx % 2 === 0 ? '#f9f9f9' : 'white',
                '&:hover': { backgroundColor: '#e3f2fd' }
              }}>
                <td 
                  style={{ 
                    padding: '6px', 
                    border: '1px solid #ddd',
                    cursor: row.Model ? 'pointer' : 'default',
                    color: row.Model ? '#1976d2' : 'inherit',
                    textDecoration: row.Model ? 'underline' : 'none'
                  }}
                  onClick={(e) => { // Added 'e' parameter
                    e.stopPropagation(); // Added stopPropagation()
                    if (row.Model) {
                      window.open(`https://www.google.com/search?q=${encodeURIComponent(row.Model + ' car')}&tbm=isch`, '_blank');
                    }
                  }}
                  title={row.Model ? `البحث عن ${row.Model} في جوجل صور` : ''}
                >
                  {row.Model || '-'}
                </td>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                  PIC
                </td>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                  {row.Year || '-'}
                </td>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                  {row.Color || '-'}
                </td>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                  {row["Plate No"] || '-'}
                </td>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                  {row.RentPerDay || '-'}
                </td>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                  {row["Chassis No"] || '-'}
                </td>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                  {row.RegExp || row["Reg Exp"] || '-'}
                </td>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                  {row.InsurExp || row["Insur Exp"] || '-'}
                </td>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                  {row.Remarks || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ 
        marginTop: '10px', 
        fontSize: '12px', 
        color: '#666',
        textAlign: 'right'
      }}>
        عرض {filteredData.length} من أصل {data.length} سجل
      </div>
    </div>
  );
};

export default DataTable;