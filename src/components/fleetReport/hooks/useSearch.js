import { useState } from 'react';
import Fuse from 'fuse.js';

export const useSearch = (data) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [showFiltered, setShowFiltered] = useState(false);

  const performSearch = (term, enableSmartSearch) => {
    if (!term.trim()) {
      setFiltered([]);
      setShowFiltered(false);
      return;
    }

    let results = [];
    
    if (enableSmartSearch) {
      const fuse = new Fuse(data, {
        keys: ['Model', 'Plate No', 'PlateNoClean', 'Color', 'Chassis No', 'Remarks'],
        threshold: 0.3,
        includeScore: true
      });
      results = fuse.search(term).map(result => result.item);
    } else {
      const lowerTerm = term.toLowerCase();
      results = data.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(lowerTerm)
        )
      );
    }

    setFiltered(results);
    setShowFiltered(true);
  };

  return {
    searchTerm,
    setSearchTerm,
    filtered,
    setFiltered,
    showFiltered,
    setShowFiltered,
    performSearch
  };
};