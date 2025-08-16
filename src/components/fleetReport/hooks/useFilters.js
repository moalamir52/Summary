import { useState } from 'react';

export const useFilters = () => {
  const [tableFilters, setTableFilters] = useState({
    model: '',
    year: '',
    color: '',
    plateNo: '',
    rentalRate: '',
    chassisNo: '',
    regExp: '',
    insurExp: '',
    remarks: ''
  });

  const [smartTableFilters, setSmartTableFilters] = useState({
    model: '',
    year: '',
    color: '',
    plateNo: '',
    rentalRate: '',
    chassisNo: '',
    regExp: '',
    insurExp: '',
    remarks: ''
  });

  const [summaryTableFilters, setSummaryTableFilters] = useState({
    model: '',
    year: '',
    color: '',
    plateNo: '',
    rentalRate: '',
    chassisNo: '',
    regExp: '',
    insurExp: '',
    remarks: ''
  });

  const [expiryTableFilters, setExpiryTableFilters] = useState({
    model: '',
    year: '',
    color: '',
    plateNo: '',
    rentalRate: '',
    chassisNo: '',
    regExp: '',
    insurExp: '',
    remarks: ''
  });

  const [detailTableFilters, setDetailTableFilters] = useState({
    model: '',
    year: '',
    color: '',
    plateNo: '',
    rentalRate: '',
    chassisNo: '',
    regExp: '',
    insurExp: '',
    remarks: ''
  });

  const applyFilters = (dataToFilter, filters) => {
    return dataToFilter.filter(row => {
      return Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue) return true;
        
        const filterValues = filterValue.split(',').map(v => v.trim().toLowerCase());
        let cellValue = '';
        
        switch (key) {
          case 'model':
            cellValue = String(row.Model || '').toLowerCase();
            break;
          case 'year':
            cellValue = String(row.Year || '').toLowerCase();
            break;
          case 'color':
            cellValue = String(row.Color || '').toLowerCase();
            break;
          case 'plateNo':
            cellValue = String(row["Plate No"] || '').toLowerCase();
            break;
          case 'rentalRate':
            cellValue = String(row.RentPerDay || '').toLowerCase();
            break;
          case 'chassisNo':
            cellValue = String(row["Chassis No"] || '').toLowerCase();
            break;
          case 'regExp':
            cellValue = String(row.RegExp || row["Reg Exp"] || '').toLowerCase();
            break;
          case 'insurExp':
            cellValue = String(row.InsurExp || row["Insur Exp"] || '').toLowerCase();
            break;
          case 'remarks':
            cellValue = String(row.Remarks || '').toLowerCase();
            break;
          default:
            return true;
        }
        
        return filterValues.some(fv => cellValue.includes(fv));
      });
    });
  };

  return {
    tableFilters,
    setTableFilters,
    smartTableFilters,
    setSmartTableFilters,
    summaryTableFilters,
    setSummaryTableFilters,
    expiryTableFilters,
    setExpiryTableFilters,
    detailTableFilters,
    setDetailTableFilters,
    applyFilters
  };
};