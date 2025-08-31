import React from 'react';

const GenericTable = ({ data, columns, filters, updateFilter, clearFilters, applyFilters, onRowClick, tableStyle }) => {

    const filteredData = applyFilters ? applyFilters(data, filters) : data;

    return (
        <div style={{ width: '100%', maxWidth: '1400px', overflowX: 'auto', margin: '0 auto' }}>
            <table style={{
                borderCollapse: 'collapse',
                width: '100%',
                background: '#fffde7',
                boxShadow: '0 2px 12px #b39ddb33',
                borderRadius: '16px',
                overflow: 'hidden',
                fontSize: '1.05rem',
                tableLayout: 'auto',
                textAlign: 'center',
                ...tableStyle
            }}>
                <thead>
                    <tr style={{ background: '#ffe082', color: '#222', fontWeight: 'bold' }}>
                        {columns.map((col, i) => (
                            <th key={i} style={{ padding: '6px 4px', borderBottom: '2px solid #ffe082', ...col.style }}>{col.header}</th>
                        ))}
                    </tr>
                    {filters && (
                        <tr style={{ background: '#f5f5f5' }}>
                            <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082' }}>
                                <button 
                                    onClick={clearFilters}
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
                            {columns.slice(1).map((col, i) => (
                                <td key={i} style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082' }}>
                                    <input
                                        type="text"
                                        placeholder={`Filter ${col.header}`}
                                        value={filters[col.accessor] || ''}
                                        onChange={(e) => updateFilter(col.accessor, e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '4px',
                                            fontSize: '0.8rem',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px'
                                        }}
                                    />
                                </td>
                            ))}
                        </tr>
                    )}
                </thead>
                <tbody>
                    {filteredData.map((row, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f5f5f5' }} onClick={() => onRowClick && onRowClick(row)}>
                            {columns.map((col, j) => (
                                <td key={j} style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', ...col.style }}>
                                    {col.cell ? col.cell(row[col.accessor] || '-', row) : (col.accessor ? (typeof col.accessor === 'function' ? col.accessor(row, i) : row[col.accessor] || '-') : '-')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default GenericTable;
