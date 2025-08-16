import { useState } from 'react';

export const useAdvancedSearch = (data, cardColors) => {
  const [searchCardColor, setSearchCardColor] = useState(cardColors[0]);

  const handleAdvancedSearch = (searchTerm, setFiltered, setShowFiltered, resetOtherStates) => {
    setSearchCardColor(cardColors[Math.floor(Math.random() * cardColors.length)]);
    const keyword = searchTerm.trim().toLowerCase();
    
    if (!keyword) {
      setFiltered([]);
      setShowFiltered(false);
      resetOtherStates();
      return;
    }
    
    resetOtherStates();

    const tokens = keyword.split(/\s+/);
    let results = [];
    
    if (tokens.length === 1) {
      const searchVal = tokens[0];
      const exactMatches = data.filter(row =>
        Object.values(row).some(val => String(val || '').toLowerCase() === searchVal)
      );
      
      if (exactMatches.length > 0) {
        results = exactMatches;
      } else {
        results = data.filter(row =>
          Object.values(row).some(val => String(val || '').toLowerCase().includes(searchVal))
        );
      }
    } else if (tokens.length >= 2) {
      const fieldMap = {
        'model': 'Model', 'mod': 'Model', 'mdl': 'Model',
        'color': 'Color', 'col': 'Color',
        'class': 'Class', 'cls': 'Class',
        'plate': 'Plate No', 'pl': 'Plate No', 'plt': 'Plate No', 'plate_no': 'Plate No', 'plate number': 'Plate No',
        'remarks': 'Remarks', 'rem': 'Remarks',
        'chassis': 'Chassis no.', 'chassisno': 'Chassis no.', 'chassis_no': 'Chassis no.', 'chs': 'Chassis no.', 'chno': 'Chassis no.',
        'year': 'Year Model', 'yr': 'Year Model', 'yrmodel': 'Year Model', 'yearmodel': 'Year Model',
        'rental': 'Rental Rate', 'rentalrate': 'Rental Rate', 'rent': 'Rental Rate', 'rate': 'Rental Rate',
        'reg': 'Reg Exp', 'regexp': 'Reg Exp', 'reg_exp': 'Reg Exp', 'regx': 'Reg Exp', 'regdate': 'Reg Exp',
        'insur': 'Insur Exp', 'insurexp': 'Insur Exp', 'insur_exp': 'Insur Exp', 'ins': 'Insur Exp', 'insdate': 'Insur Exp',
        'mortgage': 'Mortgage', 'mort': 'Mortgage', 'mtg': 'Mortgage',
      };
      
      const fieldKey = tokens[0].replace(/\W/g, '');
      const field = fieldMap[fieldKey];
      
      if (field) {
        const value = tokens.slice(1).join(' ').trim();
        const exactMatches = data.filter(row => String(row[field] || '').toLowerCase() === value);
        
        if (exactMatches.length > 0) {
          results = exactMatches;
        } else {
          results = data.filter(row => String(row[field] || '').toLowerCase().includes(value));
        }
      } else {
        const exactMatches = data.filter(row =>
          tokens.every(token =>
            Object.values(row).some(val => String(val || '').toLowerCase() === token)
          )
        );
        
        if (exactMatches.length > 0) {
          results = exactMatches;
        } else {
          results = data.filter(row =>
            tokens.every(token =>
              Object.values(row).some(val => String(val || '').toLowerCase().includes(token))
            )
          );
        }
      }
    }
    
    setFiltered(results);
    setShowFiltered(true);
  };

  return {
    searchCardColor,
    handleAdvancedSearch
  };
};