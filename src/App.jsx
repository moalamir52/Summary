import React, { useState, useEffect } from 'react';
import * as XLSX from "xlsx";
import Header from './components/Header';
import MainNavigation from './components/MainNavigation';
import SearchControls from './components/SearchControls';
import SummaryCards from './components/SummaryCards';
import SmartNavView from './components/SmartNavView';
import SummaryView from './components/SummaryView';
import ExpiryModal from './components/ExpiryModal';
import ResultsDisplay from './components/ResultsDisplay';
import { average, formatDate } from './utils.jsx';

function App() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [summary, setSummary] = useState(null);
  const [modelSummary, setModelSummary] = useState([]);
  const [showFiltered, setShowFiltered] = useState(false);
  const [showSummaryCards, setShowSummaryCards] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedMake, setSelectedMake] = useState(null);
  const [view, setView] = useState('search');
  const [expiryModalOpen, setExpiryModalOpen] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryDateResult, setExpiryDateResult] = useState(null);
  const [showExpiryTable, setShowExpiryTable] = useState(false);
  const [expiryCount, setExpiryCount] = useState(0);
  const [selectedSummaryModel, setSelectedSummaryModel] = useState(null);
  const [summaryAll, setSummaryAll] = useState(null);
  const [modelSummaryAll, setModelSummaryAll] = useState([]);
  const [showSummaryDetail, setShowSummaryDetail] = useState(null);
  const [tableFilters, setTableFilters] = useState({});
  const [smartTableFilters, setSmartTableFilters] = useState({});
  const [summaryTableFilters, setSummaryTableFilters] = useState({});
  const [expiryTableFilters, setExpiryTableFilters] = useState({});
  const [detailTableFilters, setDetailTableFilters] = useState({});
  const [showExpiryDateDetails, setShowExpiryDateDetails] = useState(false);
  const [expiryModalTable, setExpiryModalTable] = useState(null);
  const [expiryFiltered, setExpiryFiltered] = useState(null);
  const [searchCardColor, setSearchCardColor] = useState('#ffe082');
  const cardColors = ['#ffe082', '#ce93d8', '#b3e5fc', '#c8e6c9', '#ffccbc', '#f8bbd0', '#fff9c4', '#b2dfdb'];

  const analyze = (rows) => {
    const validRows = rows.filter(r => r.Model && r["Plate No"]);
    const total = validRows.length;
    const invygo = validRows.filter(r => r.isInvygo).length;
    const modelCounts = {};
    const modelInvygo = {};
    validRows.forEach(r => {
      if (!r.Model || r.Model === "56" || r.Model === "") return;
      const key = `${r.Manufacturer || 'Unknown'}-${r.Model}`;
      modelCounts[key] = (modelCounts[key] || 0) + 1;
      if (r.isInvygo) modelInvygo[key] = (modelInvygo[key] || 0) + 1;
    });

    const modelSummaryData = Object.keys(modelCounts).map(key => {
      const [manufacturer, model] = key.split('-');
      const relatedCars = validRows.filter(r => (r.Manufacturer || 'Unknown') === manufacturer && r.Model === model);
      const daily = average(relatedCars.map(r => Number(r.RentPerDay)));
      const monthly = average(relatedCars.map(r => Number(r.RentPerMonth)));
      const yearly = average(relatedCars.map(r => Number(r.RentPerYear)));
      return {
        manufacturer,
        model,
        total: modelCounts[key],
        invygo: modelInvygo[key] || 0,
        daily: daily ? daily.toFixed(0) : '-',
        monthly: monthly ? monthly.toFixed(0) : '-',
        yearly: yearly ? yearly.toFixed(0) : '-',
        yellow: modelCounts[key] - (modelInvygo[key] || 0)
      };
    }).sort((a, b) => b.total - a.total);

    setSummary({ total, invygo });
    setModelSummary(modelSummaryData);
    setShowSummaryCards(true);
  };

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
    }
    else if (expiryDateResult && expiryDateResult.cars && expiryDateResult.cars.length > 0) {
      exportData = expiryDateResult.cars;
    }
    else if (showExpiryTable) {
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
    }
    else if (showFiltered && filtered.length > 0) {
      exportData = filtered;
    }
    if (!exportData || exportData.length === 0) {
      alert('لا يوجد بيانات للتصدير!');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fleet Report');
    XLSX.writeFile(wb, `Fleet_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const applyFilters = (dataToFilter, filters) => {
    return dataToFilter.filter(row => {
      return Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue) return true;
        const filterValues = filterValue.split(',').map(v => v.toLowerCase().trim()).filter(Boolean);
        if (filterValues.length === 0) return true;
        const matchesAny = (fieldStr) => filterValues.some(val => fieldStr.includes(val));
        const keyMap = {
            class: 'Class',
            manufacturer: 'Manufacturer',
            model: 'Model',
            year: 'Year Model',
            color: 'Color',
            plateNo: 'Plate No',
            rentalRate: 'Rental Rate',
            chassisNo: 'Chassis no.',
            regExp: 'Reg Exp',
            insurExp: 'Insur Exp',
            remarks: 'Remarks',
            status: 'Status',
            total: 'total',
            invygo: 'invygo',
            yelo: 'yelo'
        };
        const mappedKey = keyMap[key];
        if(mappedKey) {
            return matchesAny(String(row[mappedKey] || '').toLowerCase());
        }
        return true;
      });
    });
  };

  const updateFilter = (filterKey, value) => setTableFilters(prev => ({...prev, [filterKey]: value}));
  const clearAllFilters = () => setTableFilters({});
  const updateSmartFilter = (filterKey, value) => setSmartTableFilters(prev => ({...prev, [filterKey]: value}));
  const clearSmartFilters = () => setSmartTableFilters({});
  const updateSummaryFilter = (filterKey, value) => setSummaryTableFilters(prev => ({...prev, [filterKey]: value}));
  const clearSummaryFilters = () => setSummaryTableFilters({});
  const updateExpiryFilter = (filterKey, value) => setExpiryTableFilters(prev => ({...prev, [filterKey]: value}));
  const clearExpiryFilters = () => setExpiryTableFilters({});
  const updateDetailFilter = (filterKey, value) => setDetailTableFilters(prev => ({...prev, [filterKey]: value}));
  const clearDetailFilters = () => setDetailTableFilters({});

  useEffect(() => {
    if (data && data.length > 0) {
      const validRows = data.filter(r => r.Model && r["Plate No"]);
      const total = validRows.length;
      const invygo = validRows.filter(r => r.isInvygo).length;
      const modelCounts = {};
      const modelInvygo = {};
      validRows.forEach(r => {
        if (!r.Model || r.Model === "56" || r.Model === "") return;
        const key = `${r.Manufacturer || 'Unknown'}-${r.Model}`;
        modelCounts[key] = (modelCounts[key] || 0) + 1;
        if (r.isInvygo) modelInvygo[key] = (modelInvygo[key] || 0) + 1;
      });

      const modelSummaryData = Object.keys(modelCounts).map(key => {
        const [manufacturer, model] = key.split('-');
        const relatedCars = validRows.filter(r => (r.Manufacturer || 'Unknown') === manufacturer && r.Model === model);
        const daily = average(relatedCars.map(r => Number(r.RentPerDay)));
        const monthly = average(relatedCars.map(r => Number(r.RentPerMonth)));
        const yearly = average(relatedCars.map(r => Number(r.RentPerYear)));
        return {
          manufacturer,
          model,
          total: modelCounts[key],
          invygo: modelInvygo[key] || 0,
          daily: daily ? daily.toFixed(0) : '-',
          monthly: monthly ? monthly.toFixed(0) : '-',
          yearly: yearly ? yearly.toFixed(0) : '-',
          yellow: modelCounts[key] - (modelInvygo[key] || 0)
        };
      }).sort((a, b) => b.total - a.total);

      setSummaryAll({ total, invygo });
      setModelSummaryAll(modelSummaryData);
    }
  }, [data]);

  const handleSearch = () => {
    setSearchCardColor(cardColors[Math.floor(Math.random() * cardColors.length)]);
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      setFiltered([]);
      setShowFiltered(false);
      return;
    }
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
        'class': 'Class', 'cls': 'Class',
        'manufacturer': 'Manufacturer', 'mfg': 'Manufacturer',
        'model': 'Model', 'mod': 'Model', 'mdl': 'Model',
        'color': 'Color', 'col': 'Color',
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
    setView('search');
  };

  const fetchFromGoogleSheet = async () => {
    const sheetUrl = "https://docs.google.com/spreadsheets/d/1sHvEQMtt3suuxuMA0zhcXk5TYGqZzit0JvGLk1CQ0LI/export?format=csv&gid=804568597";
    const statusUrl = "https://docs.google.com/spreadsheets/d/1v4rQWn6dYPVQPd-PkhvrDNgKVnexilrR2XIUVa5RKEM/export?format=csv&gid=1425121708";
    try {
      const res = await fetch(sheetUrl);
      const text = await res.text();
      const rows = text.split('\n').map(row => row.split(','));
      const headers = rows[0];
      const dataArr = rows.slice(1).map(row =>
        Object.fromEntries(row.map((cell, i) => [headers[i].trim(), cell]))
      );
      
      const statusRes = await fetch(statusUrl);
      const statusText = await statusRes.text();
      const statusRows = statusText.split('\n').map(row => row.split(','));
      const statusHeaders = statusRows[0];
      const statusData = {};
      statusRows.slice(1).forEach(row => {
        const statusObj = Object.fromEntries(row.map((cell, i) => [statusHeaders[i]?.trim(), cell]));
        const plateNo = statusObj['Plate No'] || statusObj['plate no'] || statusObj['Plate no'] || statusObj['Plate Number'];
        const status = statusObj['Status'] || statusObj['status'] || statusObj['STATUS'];
        if (plateNo && plateNo.trim()) {
          statusData[plateNo.replace(/\s/g, '').toUpperCase()] = status || 'Unknown';
        }
      });
      
      const cleaned = dataArr.map(r => ({
        ...r,
        PlateNoClean: String(r["Plate No"] || "").replace(/\s/g, "").toUpperCase(),
        RegExp: formatDate(r["Reg Exp"]),
        InsurExp: formatDate(r["Insur Exp"]),
        SaleDate: formatDate(r["Sale Date"]),
        Remarks: String(r.Remarks || "").toUpperCase(),
        isInvygo: String(r.Remarks || "").toUpperCase().includes("INVYGO"),
        Status: statusData[String(r["Plate No"] || "").replace(/\s/g, "").toUpperCase()] || 'Unknown'
      }));
      setData(cleaned);
      setFiltered([]);
      analyze(cleaned);
      setShowFiltered(false);
    } catch (err) {
      alert("Error fetching data from Google Sheets");
    }
  };

  useEffect(() => {
    fetchFromGoogleSheet();
  }, []);

  useEffect(() => {
    if (!data || !data.length) return;
    const today = new Date();
    const expired = data.filter(car => {
      const exp = car.RegExp || car["Reg Exp"];
      if (!exp) return false;
      let d;
      if (typeof exp === "string" && exp.includes("-")) d = new Date(exp);
      else if (typeof exp === "string" && exp.includes("/")) {
        const [day, mon, yr] = exp.split("/");
        d = new Date(`${yr}-${mon}-${day}`);
      } else if (exp instanceof Date) d = exp;
      else return false;
      return d <= today;
    });
    setExpiryCount(expired.length);
  }, [data]);

  useEffect(() => {
    if (view !== 'search') {
      setFiltered([]);
      setShowFiltered(false);
      setShowExpiryDateDetails(false);
      setExpiryModalTable(null);
      setShowExpiryTable(false);
      setExpiryFiltered(null);
      setSelectedSummaryModel(null);
    }
  }, [view]);

  useEffect(() => {
    if (filtered.length === 0 && searchTerm === "") {
      analyze(data);
      setShowSummaryCards(true);
    }
  }, [filtered, searchTerm, data]);

  const handleExpiryDateSearch = () => {
    setExpiryModalOpen(false);
    setView('search');
    const selected = new Date(expiryDate);
    const cars = data.filter(car => {
      const exp = car.RegExp || car["Reg Exp"];
      if (!exp) return false;
      let d;
      if (typeof exp === "string" && exp.includes("-")) d = new Date(exp);
      else if (typeof exp === "string" && exp.includes("/")) {
        const [day, mon, yr] = exp.split("/");
        d = new Date(`${yr}-${mon}-${day}`);
      } else if (exp instanceof Date) d = exp;
      else return false;
      return d <= selected;
    })
    setExpiryDateResult({ cars, date: expiryDate });
  }

  const resetFilters = () => {
    setFiltered([]); 
    setShowFiltered(false); 
    setExpiryDateResult(null);
    setShowExpiryTable(false); 
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <Header />
      <MainNavigation setView={setView} setExpiryModalOpen={setExpiryModalOpen} />

      {view === 'search' && (
        <>
          <SearchControls 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSearch={handleSearch}
            fetchFromGoogleSheet={fetchFromGoogleSheet}
            handleExport={handleExport}
            resetFilters={resetFilters}
          />
          {showSummaryCards && 
            <SummaryCards 
              summaryAll={summaryAll} 
              expiryCount={expiryCount} 
              setShowSummaryDetail={setShowSummaryDetail} 
              setShowExpiryTable={setShowExpiryTable}
            />
          }
          <ResultsDisplay 
            showFiltered={showFiltered}
            filtered={filtered}
            applyTableFilters={applyFilters}
            tableFilters={tableFilters}
            updateFilter={updateFilter}
            clearAllFilters={clearAllFilters}
            searchCardColor={searchCardColor}
            showExpiryTable={showExpiryTable}
            expiryCount={expiryCount}
            data={data}
            expiryTableFilters={expiryTableFilters}
            updateExpiryFilter={updateExpiryFilter}
            clearExpiryFilters={clearExpiryFilters}
            applyFilters={applyFilters}
            showSummaryDetail={showSummaryDetail}
            summaryAll={summaryAll}
            detailTableFilters={detailTableFilters}
            updateDetailFilter={updateDetailFilter}
            clearDetailFilters={clearDetailFilters}
            expiryDateResult={expiryDateResult}
          />
        </>
      )}

      {view === 'smart' && 
        <SmartNavView 
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
      }

      {view === 'summary' && 
        <SummaryView 
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
      }

      <ExpiryModal 
        expiryModalOpen={expiryModalOpen}
        setExpiryModalOpen={setExpiryModalOpen}
        expiryDate={expiryDate}
        setExpiryDate={setExpiryDate}
        handleExpiryDateSearch={handleExpiryDateSearch}
      />

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: '#fff',
          color: '#512da8',
          border: '2px solid #1976d2',
          borderRadius: '10px',
          padding: '5px 12px',
          fontSize: '0.95rem',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px #b39ddb33',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          transition: 'background 0.18s, transform 0.18s'
        }}
        title="Scroll to top"
      >
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.85rem' }}>
          <span style={{ fontSize: '1rem', color: '#7b1fa2', lineHeight: 1 }}>⬆️</span>
          <span style={{ fontSize: '0.6rem', color: '#7b1fa2', marginTop: '-2px' }}>TOP</span>
        </span>
        <span style={{ color: '#1976d2', fontWeight: 'bold', fontSize: '0.95rem' }}>Top</span>
      </button>

      {(showFiltered || expiryDateResult) && (
        <button
          onClick={resetFilters}
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '32px',
            zIndex: 2000,
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            background: '#fff',
            color: '#d32f2f',
            border: '2px solid #d32f2f',
            fontSize: '2.1rem',
            fontWeight: 'bold',
            boxShadow: '0 4px 18px #b39ddb33',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s, color 0.2s',
          }}
          title="Clear Results"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default App;
