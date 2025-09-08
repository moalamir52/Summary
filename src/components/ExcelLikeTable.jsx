import React, { useState, useMemo } from 'react';

const ExcelLikeTable = ({ data, columns, onRowClick, tableStyle }) => {
    const [filters, setFilters] = useState({});
    const [openDropdowns, setOpenDropdowns] = useState({});

    // Get unique values for each column
    const getUniqueValues = (columnKey) => {
        const values = data.map(row => {
            const value = typeof columnKey === 'function' ? columnKey(row) : row[columnKey];
            return String(value || '').trim();
        }).filter(Boolean);
        return [...new Set(values)].sort();
    };

    // Apply filters to data
    const filteredData = useMemo(() => {
        return data.filter(row => {
            return Object.entries(filters).every(([key, selectedValues]) => {
                if (!selectedValues || selectedValues.length === 0) return true;
                const cellValue = String(typeof key === 'function' ? key(row) : row[key] || '').trim();
                return selectedValues.includes(cellValue);
            });
        });
    }, [data, filters]);

    const toggleDropdown = (columnKey) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    const toggleFilter = (columnKey, value) => {
        setFilters(prev => {
            const currentFilters = prev[columnKey] || [];
            const newFilters = currentFilters.includes(value)
                ? currentFilters.filter(v => v !== value)
                : [...currentFilters, value];
            
            return {
                ...prev,
                [columnKey]: newFilters.length > 0 ? newFilters : undefined
            };
        });
    };

    const clearAllFilters = () => {
        setFilters({});
        setOpenDropdowns({});
    };

    const selectAll = (columnKey) => {
        const allValues = getUniqueValues(columnKey);
        setFilters(prev => ({
            ...prev,
            [columnKey]: allValues
        }));
    };

    const deselectAll = (columnKey) => {
        setFilters(prev => ({
            ...prev,
            [columnKey]: undefined
        }));
    };

    return (
        <div style={{ width: '100%', maxWidth: '1400px', overflowX: 'auto', margin: '0 auto', position: 'relative' }}>
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
                            <th key={i} style={{ padding: '6px 4px', borderBottom: '2px solid #ffe082', position: 'relative', ...col.style }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                    {col.header}
                                    {i > 0 && (
                                        <button
                                            onClick={() => toggleDropdown(col.accessor)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                padding: '2px'
                                            }}
                                        >
                                            ▼
                                        </button>
                                    )}
                                </div>
                                
                                {/* Dropdown Filter */}
                                {i > 0 && openDropdowns[col.accessor] && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: '0',
                                        background: 'white',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                        zIndex: 1000,
                                        minWidth: '200px',
                                        maxHeight: '300px',
                                        overflowY: 'auto'
                                    }}>
                                        <div style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                                            <button
                                                onClick={() => selectAll(col.accessor)}
                                                style={{
                                                    background: '#4caf50',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '4px 8px',
                                                    borderRadius: '3px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    marginRight: '5px'
                                                }}
                                            >
                                                Select All
                                            </button>
                                            <button
                                                onClick={() => deselectAll(col.accessor)}
                                                style={{
                                                    background: '#f44336',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '4px 8px',
                                                    borderRadius: '3px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                Clear
                                            </button>
                                        </div>
                                        
                                        {getUniqueValues(col.accessor).map(value => (
                                            <div key={value} style={{ padding: '4px 8px', display: 'flex', alignItems: 'center' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={(filters[col.accessor] || []).includes(value)}
                                                    onChange={() => toggleFilter(col.accessor, value)}
                                                    style={{ marginRight: '8px' }}
                                                />
                                                <span style={{ fontSize: '13px', textAlign: 'left' }}>{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </th>
                        ))}
                    </tr>
                    
                    {/* Clear All Filters Row */}
                    <tr style={{ background: '#f5f5f5' }}>
                        <td colSpan={columns.length} style={{ padding: '4px', borderBottom: '1px solid #ffe082' }}>
                            <button 
                                onClick={clearAllFilters}
                                style={{
                                    padding: '6px 12px',
                                    fontSize: '0.9rem',
                                    background: '#ff9800',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Clear All Filters ({filteredData.length} of {data.length} rows)
                            </button>
                        </td>
                    </tr>
                </thead>
                
                <tbody>
                    {filteredData.map((row, i) => (
                        <tr 
                            key={i} 
                            style={{ 
                                background: i % 2 === 0 ? '#fff' : '#f5f5f5',
                                cursor: onRowClick ? 'pointer' : 'default'
                            }} 
                            onClick={() => onRowClick && onRowClick(row)}
                        >
                            {columns.map((col, j) => (
                                <td key={j} style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', ...col.style }}>
                                    {col.cell ? col.cell(row[col.accessor] || '-', row) : (col.accessor ? (typeof col.accessor === 'function' ? col.accessor(row, i) : row[col.accessor] || '-') : '-')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {/* Click outside to close dropdowns */}
            {Object.values(openDropdowns).some(Boolean) && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999
                    }}
                    onClick={() => setOpenDropdowns({})}
                />
            )}
        </div>
    );
};

export default ExcelLikeTable;