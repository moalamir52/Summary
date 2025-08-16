export const useFilterUpdaters = (
  setTableFilters,
  setSmartTableFilters,
  setSummaryTableFilters,
  setExpiryTableFilters,
  setDetailTableFilters
) => {
  const updateFilter = (filterKey, value) => {
    setTableFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const updateSmartFilter = (filterKey, value) => {
    setSmartTableFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const updateSummaryFilter = (filterKey, value) => {
    setSummaryTableFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const updateExpiryFilter = (filterKey, value) => {
    setExpiryTableFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const updateDetailFilter = (filterKey, value) => {
    setDetailTableFilters(prev => ({ ...prev, [filterKey]: value }));
  };

  const clearAllFilters = () => {
    const emptyFilters = {
      model: '', year: '', color: '', plateNo: '', rentalRate: '',
      chassisNo: '', regExp: '', insurExp: '', remarks: ''
    };
    setTableFilters(emptyFilters);
  };

  const clearSmartFilters = () => {
    const emptyFilters = {
      model: '', year: '', color: '', plateNo: '', rentalRate: '',
      chassisNo: '', regExp: '', insurExp: '', remarks: ''
    };
    setSmartTableFilters(emptyFilters);
  };

  const clearSummaryFilters = () => {
    const emptyFilters = {
      model: '', year: '', color: '', plateNo: '', rentalRate: '',
      chassisNo: '', regExp: '', insurExp: '', remarks: ''
    };
    setSummaryTableFilters(emptyFilters);
  };

  const clearExpiryFilters = () => {
    const emptyFilters = {
      model: '', year: '', color: '', plateNo: '', rentalRate: '',
      chassisNo: '', regExp: '', insurExp: '', remarks: ''
    };
    setExpiryTableFilters(emptyFilters);
  };

  const clearDetailFilters = () => {
    const emptyFilters = {
      model: '', year: '', color: '', plateNo: '', rentalRate: '',
      chassisNo: '', regExp: '', insurExp: '', remarks: ''
    };
    setDetailTableFilters(emptyFilters);
  };

  return {
    updateFilter,
    updateSmartFilter,
    updateSummaryFilter,
    updateExpiryFilter,
    updateDetailFilter,
    clearAllFilters,
    clearSmartFilters,
    clearSummaryFilters,
    clearExpiryFilters,
    clearDetailFilters
  };
};