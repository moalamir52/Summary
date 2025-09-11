// Expose a global function to clear expiryDateResult and hide expiry table
window.clearExpiryDateResult = () => {
  if (typeof setExpiryDateResult === 'function') setExpiryDateResult(null);
  if (typeof setShowExpiryTable === 'function') setShowExpiryTable(false);
};
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
import ColumnSelector from './components/ColumnSelector';
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

  const [showExpiryDateDetails, setShowExpiryDateDetails] = useState(false);
  const [expiryModalTable, setExpiryModalTable] = useState(null);
  const [expiryFiltered, setExpiryFiltered] = useState(null);
  const [searchCardColor, setSearchCardColor] = useState('#ffe082');
  const cardColors = ['#ffe082', '#ce93d8', '#b3e5fc', '#c8e6c9', '#ffccbc', '#f8bbd0', '#fff9c4', '#b2dfdb'];

  // EJAR Vehicles data states
  const [ejarData, setEjarData] = useState([]);
  const [mergedData, setMergedData] = useState([]);
  const [selectedEjarColumns, setSelectedEjarColumns] = useState([]);
  const [availableEjarColumns, setAvailableEjarColumns] = useState([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const handleNavigation = (newView) => {
    setSelectedSummaryModel(null); // Reset summary model when navigating
    setSelectedClass(null); // Reset smart view class when navigating
    setSelectedMake(null); // Reset smart view make when navigating
    setFiltered([]); // Clear search results
    setShowFiltered(false); // Hide search results
    setSearchTerm(''); // Clear search term
    setShowSummaryDetail(null); // Clear summary detail filters
    setShowExpiryTable(false); // Hide expiry table
    setExpiryDateResult(null); // Clear expiry date results
    setView(newView);
  };

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
    let dataToExport = null;
    let visibleColumns = null;
    let exportContext = '';
    // Try to get visible columns from the main table (if available)
    if (window.getMainTableVisibleColumns) {
      visibleColumns = window.getMainTableVisibleColumns();
    }
    // Determine what is being exported and set context
    if (showSummaryDetail) {
      if (showSummaryDetail === 'total') {
        dataToExport = data;
        exportContext = 'AllCars';
      } else if (showSummaryDetail === 'invygo') {
        dataToExport = data.filter(car => car.isInvygo);
        exportContext = 'InvygoCars';
      } else if (showSummaryDetail === 'yelo') {
        dataToExport = data.filter(car => !car.isInvygo);
        exportContext = 'YeloCars';
      }
    }
    else if (expiryDateResult && expiryDateResult.cars && expiryDateResult.cars.length > 0) {
      dataToExport = expiryDateResult.cars;
      exportContext = 'ExpiryDetails';
    }
    else if (showExpiryTable) {
      dataToExport = data.filter(car => {
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
      exportContext = 'ExpiredCars';
    }
    else if (showFiltered && filtered.length > 0) {
      dataToExport = filtered;
      exportContext = 'SearchResults';
    }
    if (!dataToExport || dataToExport.length === 0) {
      alert('لا يوجد بيانات للتصدير!');
      return;
    }

    // Try to get visible columns from the first ExcelLikeTable instance if not set
    if (!visibleColumns && window.getMainTableVisibleColumns) {
      visibleColumns = window.getMainTableVisibleColumns();
    }
    // Fallback: use all columns in the data
    if (!visibleColumns) {
      visibleColumns = Object.keys(dataToExport[0] || {});
    }

    // Clean and filter data to only visible columns
    const cleanedData = dataToExport.map(row => {
      const {
        PlateNoClean,
        isInvygo,
        RegExp,
        InsurExp,
        SaleDate,
        ...rest
      } = row;
      const result = {};
      visibleColumns.forEach(col => {
        // Special handling for Reg Exp, Insur Exp, Sale Date
        if (col === 'Reg Exp') result['Reg Exp'] = RegExp || row['Reg Exp'];
        else if (col === 'Insur Exp') result['Insur Exp'] = InsurExp || row['Insur Exp'];
        else if (col === 'Sale Date') result['Sale Date'] = SaleDate || row['Sale Date'];
        else result[col] = row[col] !== undefined ? row[col] : '';
      });
      return result;
    });

    // Use visibleColumns order for export
    const sortedColumns = visibleColumns;

    // Smart file name
    let fileName = 'Fleet_Report';
    if (exportContext === 'SearchResults') {
      let keyword = (typeof searchTerm === 'string' && searchTerm.trim()) ? searchTerm.trim().replace(/\s+/g, '_') : '';
      if (keyword) fileName = `${keyword}`;
      else fileName = 'Search_Results';
    } else if (exportContext === 'AllCars') fileName = 'All_Cars_Details';
    else if (exportContext === 'InvygoCars') fileName = 'Invygo_Cars_Details';
    else if (exportContext === 'YeloCars') fileName = 'YELO_Cars_Details';
    else if (exportContext === 'ExpiryDetails') fileName = 'Expiry_Details';
    else if (exportContext === 'ExpiredCars') fileName = 'Expired_Cars';
    fileName += `_${new Date().toISOString().slice(0, 10)}.xlsx`;

    const ws = XLSX.utils.json_to_sheet(cleanedData, { header: sortedColumns });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, exportContext || 'Fleet Report');
    XLSX.writeFile(wb, fileName);
  };

  // Handle EJAR file upload
  const handleEjarFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length > 0) {
        setEjarData(jsonData);
        setAvailableEjarColumns(Object.keys(jsonData[0]).filter(col => col !== 'Plate Number'));
        setShowColumnSelector(true);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Merge data based on plate number
  const mergeDataByPlate = () => {
    if (!data.length || !ejarData.length || !selectedEjarColumns.length) return;

    const merged = data.map(mainRow => {
      const plateNo = mainRow['Plate No'] || mainRow.PlateNo;
      if (!plateNo) return mainRow;

      const ejarMatch = ejarData.find(ejarRow => {
        const ejarPlate = ejarRow['Plate Number'];
        return ejarPlate && plateNo.toString().trim() === ejarPlate.toString().trim();
      });

      if (ejarMatch) {
        const updatedRow = { ...mainRow };
        selectedEjarColumns.forEach(col => {
          // إذا كان العمود هو EJAR_Category، حدث عمود Class مباشرة
          if (col === 'EJAR_Category') {
            updatedRow['Class'] = ejarMatch[col];
          } else if (col in updatedRow) {
            updatedRow[col] = ejarMatch[col];
          } else {
            updatedRow[`EJAR_${col}`] = ejarMatch[col];
          }
        });
        return updatedRow;
      }
      return mainRow;
    });

    setMergedData(merged);
    setData(merged); // Update main data with merged data
    setShowColumnSelector(false);

    // Show the selected columns in the table automatically
    // This assumes you have a state for visible columns in the table component or pass it as a prop
    // If using ResultsDisplay or ExcelLikeTable directly, you may need to lift state up or trigger a refresh
    if (window.setMainTableVisibleColumns) {
      window.setMainTableVisibleColumns(prev => {
        // Add selected EJAR columns (with EJAR_ prefix if not already in main data)
        return Array.from(new Set([...prev, ...selectedEjarColumns.map(col => {
          if (col === 'EJAR_Category') return 'Class';
          // If the column exists in main data, use its name, else use EJAR_ prefix
          if (merged.length && col in merged[0]) return col;
          return `EJAR_${col}`;
        })]));
      });
    }
  };



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
        'class': 'Class', 'Category': 'Class',
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
    const invygoUrl = "https://docs.google.com/spreadsheets/d/1sHvEQMtt3suuxuMA0zhcXk5TYGqZzit0JvGLk1CQ0LI/export?format=csv&gid=1812913588";
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
        const branch = statusObj['Branch'] || statusObj['branch'] || statusObj['BRANCH'];
        if (plateNo && plateNo.trim()) {
          statusData[plateNo.replace(/\s/g, '').toUpperCase()] = {
            status: status || 'Unknown',
            branch: branch || 'Unknown'
          };
        }
      });
      
      const invygoRes = await fetch(invygoUrl);
      const invygoText = await invygoRes.text();
      const invygoRows = invygoText.split('\n').map(row => row.split(','));
      const invygoPlates = new Set();
      invygoRows.slice(1).forEach(row => {
        const plateNo = row[0]; // First column is Plate No
        if (plateNo && plateNo.trim()) {
          invygoPlates.add(plateNo.replace(/\s/g, '').toUpperCase());
        }
      });
      
      const cleaned = dataArr.map(r => {
        const plateKey = String(r["Plate No"] || "").replace(/\s/g, "").toUpperCase();
        const statusInfo = statusData[plateKey] || { status: 'Unknown', branch: 'Unknown' };
        const isInvygoCar = invygoPlates.has(plateKey);
        const originalRemarks = String(r.Remarks || "").trim();
        return {
          ...r,
          PlateNoClean: plateKey,
          RegExp: formatDate(r["Reg Exp"]),
          InsurExp: formatDate(r["Insur Exp"]),
          SaleDate: formatDate(r["Sale Date"]),
          Remarks: originalRemarks || (isInvygoCar ? "INVYGO" : "YELO"),
          isInvygo: isInvygoCar,
          Status: statusInfo.status,
          Branch: statusInfo.branch
        };
      });
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
    setShowSummaryCards(false);
    setShowSummaryDetail(null);
    setSelectedSummaryModel(null);
    setExpiryFiltered(null);
    setExpiryModalTable(null);
    setShowExpiryDateDetails(false);
    setView('search');
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <Header />
      <MainNavigation onNavigate={handleNavigation} setExpiryModalOpen={setExpiryModalOpen} />

      {view === 'search' && (
        <>
          <SearchControls 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSearch={handleSearch}
            fetchFromGoogleSheet={fetchFromGoogleSheet}
            handleExport={handleExport}
            resetFilters={resetFilters}
            handleEjarFile={handleEjarFile}
            ejarData={ejarData}
            setShowColumnSelector={setShowColumnSelector}
          />
          {showSummaryCards && !showFiltered && 
            <SummaryCards 
              summaryAll={summaryAll} 
              expiryCount={expiryCount} 
              setShowSummaryDetail={setShowSummaryDetail} 
              setShowExpiryTable={setShowExpiryTable}
              setShowFiltered={setShowFiltered}
            />
          }
          {showFiltered && summaryAll && 
            <SummaryCards 
              summaryAll={summaryAll} 
              expiryCount={expiryCount} 
              setShowSummaryDetail={setShowSummaryDetail} 
              setShowExpiryTable={setShowExpiryTable}
              setShowFiltered={setShowFiltered}
            />
          }
          <ResultsDisplay 
            showFiltered={showFiltered}
            filtered={filtered}
            searchCardColor={searchCardColor}
            showExpiryTable={showExpiryTable}
            expiryCount={expiryCount}
            data={data}
            showSummaryDetail={showSummaryDetail}
            summaryAll={summaryAll}
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
        />
      }

      {view === 'summary' && 
        <SummaryView 
          modelSummaryAll={modelSummaryAll} 
          selectedSummaryModel={selectedSummaryModel} 
          setSelectedSummaryModel={setSelectedSummaryModel} 
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

      {/* Column Selector Modal */}
      {showColumnSelector && (
        <ColumnSelector
          availableColumns={availableEjarColumns}
          selectedColumns={selectedEjarColumns}
          setSelectedColumns={setSelectedEjarColumns}
          onMerge={mergeDataByPlate}
          onCancel={() => setShowColumnSelector(false)}
        />
      )}
  {/* ...existing code... */}
    </div>
  );
}

export default App;
