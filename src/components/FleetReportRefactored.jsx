// ✅ Fleet Report — Refactored with Modular Architecture

import React from 'react';
import Header from './fleetReport/Header';
import SearchSection from './fleetReport/components/SearchSection';
import SummaryCards from './fleetReport/SummaryCards';
import DataTable from './fleetReport/components/DataTable';
import ExpiryModal from './fleetReport/ExpiryModal';
import SmartNavigation from './fleetReport/SmartNavigation';
import SummaryModelTable from './fleetReport/components/SummaryModelTable';
import FloatingButtons from './fleetReport/FloatingButtons';

import useFleetData from './hooks/useFleetData';
import useSearch from './hooks/useSearch';
import useFilters from './hooks/useFilters';
import useExpiry from './hooks/useExpiry';
import useModal from './hooks/useModal';
import useView from './hooks/useView';
import useAdvancedSearch from './hooks/useAdvancedSearch';
import useGoogleSheets from './hooks/useGoogleSheets';

export default function FleetReportRefactored({ enableSmartSearch, onDataLoaded }) {
  // Custom hooks
  const { data, summaryAll, modelSummaryAll, analyze, handleFileUpload } = useFleetData(onDataLoaded);
  const { searchTerm, setSearchTerm, searchCardColor, handleSearch } = useSearch(data);
  const { view, setView, selectedClass, setSelectedClass, selectedMake, setSelectedMake, selectedSummaryModel, setSelectedSummaryModel } = useView();
  const { expiryModalOpen, setExpiryModalOpen, expiryDate, setExpiryDate, expiryDateResult, setExpiryDateResult, showExpiryTable, setShowExpiryTable, expiryCount } = useExpiry(data);
  const { showSummaryDetail, setShowSummaryDetail } = useModal();
  const { filtered, showFiltered, setFiltered, setShowFiltered } = useAdvancedSearch(data, searchTerm);
  const { fetchFromGoogleSheet } = useGoogleSheets(analyze, onDataLoaded);
  
  const {
    tableFilters,
    smartTableFilters,
    summaryTableFilters,
    expiryTableFilters,
    detailTableFilters,
    applyFilters,
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
  } = useFilters();

  // Export function
  const handleExport = () => {
    let exportData = null;
    
    if (showSummaryDetail) {
      if (showSummaryDetail === 'total') {
        exportData = data;
      } else if (showSummaryDetail === 'invygo') {
        exportData = data.filter(car => (car.Remarks || '').toUpperCase().includes('INVYGO'));
      } else if (showSummaryDetail === 'yelo') {
        exportData = data.filter(car => !(car.Remarks || '').toUpperCase().includes('INVYGO'));
      }
    } else if (expiryDateResult?.cars?.length > 0) {
      exportData = expiryDateResult.cars;
    } else if (showExpiryTable) {
      exportData = data.filter(car => {
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
    } else if (showFiltered && filtered.length > 0) {
      exportData = filtered;
    }
    
    if (!exportData?.length) {
      alert('لا يوجد بيانات للتصدير!');
      return;
    }
    
    const XLSX = require('xlsx');
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fleet Report');
    XLSX.writeFile(wb, `Fleet_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const resetAll = () => {
    setFiltered([]);
    setShowFiltered(false);
    setExpiryDateResult(null);
    setShowExpiryTable(false);
    setSelectedSummaryModel(null);
    setShowSummaryDetail(null);
  };

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <Header 
        setView={setView}
        setSelectedClass={setSelectedClass}
        setSelectedMake={setSelectedMake}
        setSelectedSummaryModel={setSelectedSummaryModel}
        setExpiryModalOpen={setExpiryModalOpen}
      />

      <ExpiryModal
        expiryModalOpen={expiryModalOpen}
        setExpiryModalOpen={setExpiryModalOpen}
        expiryDate={expiryDate}
        setExpiryDate={setExpiryDate}
        data={data}
        setExpiryDateResult={setExpiryDateResult}
        setView={setView}
        setFiltered={setFiltered}
        setShowFiltered={setShowFiltered}
      />

      {view === 'smart' && (
        <SmartNavigation
          data={data}
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          selectedMake={selectedMake}
          setSelectedMake={setSelectedMake}
          smartTableFilters={smartTableFilters}
          updateSmartFilter={updateSmartFilter}
          clearSmartFilters={clearSmartFilters}
          applyFilters={applyFilters}
        />
      )}

      {view === 'search' && (
        <div>
          <SearchSection
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSearch={handleSearch}
            handleFileUpload={handleFileUpload}
            fetchFromGoogleSheet={fetchFromGoogleSheet}
            handleExport={handleExport}
            resetAll={resetAll}
          />
          
          {searchTerm && (
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <button
                onClick={() => {
                  window.open(`https://www.google.com/search?q=${encodeURIComponent(searchTerm + ' car')}&tbm=isch`, '_blank');
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#ff5722',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
                title={`البحث عن ${searchTerm} في جوجل صور`}
              >
                🔍 البحث عن "{searchTerm}" في جوجل صور
              </button>
            </div>
          )}

          <SummaryCards
            summaryAll={summaryAll}
            expiryCount={expiryCount}
            showSummaryDetail={showSummaryDetail}
            setShowSummaryDetail={setShowSummaryDetail}
            setShowExpiryTable={setShowExpiryTable}
            setShowFiltered={setShowFiltered}
            setExpiryDateResult={setExpiryDateResult}
            setSelectedSummaryModel={setSelectedSummaryModel}
          />

          <DataTable
            filtered={filtered}
            showFiltered={showFiltered}
            searchCardColor={searchCardColor}
            tableFilters={tableFilters}
            updateFilter={updateFilter}
            clearAllFilters={clearAllFilters}
            applyFilters={applyFilters}
            showExpiryTable={showExpiryTable}
            expiryDateResult={expiryDateResult}
            showSummaryDetail={showSummaryDetail}
            summaryAll={summaryAll}
            data={data}
            expiryTableFilters={expiryTableFilters}
            updateExpiryFilter={updateExpiryFilter}
            clearExpiryFilters={clearExpiryFilters}
            detailTableFilters={detailTableFilters}
            updateDetailFilter={updateDetailFilter}
            clearDetailFilters={clearDetailFilters}
            setShowExpiryTable={setShowExpiryTable}
            setShowSummaryDetail={setShowSummaryDetail}
            expiryCount={expiryCount}
          />
        </div>
      )}

      {view === 'summary' && (
        <SummaryModelTable
          modelSummaryAll={modelSummaryAll}
          selectedSummaryModel={selectedSummaryModel}
          setSelectedSummaryModel={setSelectedSummaryModel}
          summaryTableFilters={summaryTableFilters}
          updateSummaryFilter={updateSummaryFilter}
          clearSummaryFilters={clearSummaryFilters}
          detailTableFilters={detailTableFilters}
          updateDetailFilter={updateDetailFilter}
          clearDetailFilters={clearDetailFilters}
          applyFilters={applyFilters}
          data={data}
        />
      )}

      <FloatingButtons
        showFiltered={showFiltered}
        expiryDateResult={expiryDateResult}
        resetAll={resetAll}
      />
    </div>
  );
}