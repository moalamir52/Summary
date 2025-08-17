// ✅ Fleet Report — YELO Themed with Header, Home Button, and Full UI

import React, { useState, useRef, useEffect } from "react";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import * as XLSX from "xlsx";

// Helper function to colorize Invygo/YELO text
const colorizeInvygoYelo = (text) => {
  if (!text) return text;
  const str = String(text);
  if (str.toUpperCase().includes('INVYGO')) {
    return <span style={{ color: '#1976d2', fontWeight: 'bold' }}>{str}</span>;
  }
  if (str.toUpperCase().includes('YELO')) {
    return <span style={{ color: '#ffb300', fontWeight: 'bold' }}>{str}</span>;
  }
  return str;
};

// دالة فتح بحث جوجل للصور
const searchCarImage = (model, year, color) => {
  const searchQuery = `${model} ${year || ''} ${color || ''} car`.trim();
  const googleImageUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(searchQuery)}`;
  window.open(googleImageUrl, '_blank');
};

export default function FleetReportFinalFull({ enableSmartSearch, onDataLoaded }) {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [summary, setSummary] = useState(null);
  const [modelSummary, setModelSummary] = useState([]);
  const [showFiltered, setShowFiltered] = useState(false);
  const [showSummaryCards, setShowSummaryCards] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedMake, setSelectedMake] = useState(null);
  const [view, setView] = useState('search');
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [expiryModalOpen, setExpiryModalOpen] = useState(false);
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  // State لتحديد الموديل المختار في ملخص الموديلات
  const [selectedSummaryModel, setSelectedSummaryModel] = useState(null);
  // 1. أضف state جديد لعدد السيارات المنتهية حتى اليوم أو حسب الفلتر
  const [expiryCount, setExpiryCount] = useState(0);
  const [expiryFiltered, setExpiryFiltered] = useState(null); // null = لا يوجد فلتر، [] = فلتر مفعل
  const [showExpiryTable, setShowExpiryTable] = useState(false);
  // 1. أضف state لعرض جدول نتائج زر Cars Expiry
  const [expiryModalTable, setExpiryModalTable] = useState(null); // null = لا شيء، [] = نتائج
  // 1. State جديد لتاريخ الاكسبيري
  const [expiryDate, setExpiryDate] = useState(''); // yyyy-mm-dd
  const [expiryDateResult, setExpiryDateResult] = useState(null); // { cars: [], date: ... }
  const [showExpiryDateDetails, setShowExpiryDateDetails] = useState(false);
  // 1. State جديد للكروت الملخصة الدائمة
  const [summaryAll, setSummaryAll] = useState(null);
  const [modelSummaryAll, setModelSummaryAll] = useState([]);
  // 1. State جديد لتتبع أي جدول تفاصيل ملخص ظاهر
  const [showSummaryDetail, setShowSummaryDetail] = useState(null); // 'total' | 'invygo' | 'yelo' | null

  // إضافة states للفلاتر مثل الإكسيل لكل جدول
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

  // فلاتر لجدول Smart Navigation
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

  // فلاتر لجدول Summary
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

  // فلاتر لجدول Expiry
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

  // فلاتر لجدول تفاصيل الكروت
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

  const cardColors = ['#ffe082', '#ce93d8', '#b3e5fc', '#c8e6c9', '#ffccbc', '#f8bbd0', '#fff9c4', '#b2dfdb'];
  const [searchCardColor, setSearchCardColor] = useState(cardColors[0]);


  const formatDate = (value) => {
    if (typeof value === "number" && value > 10000) {
      return XLSX.SSF.format("yyyy-mm-dd", value);
    }
    return value;
  };

  const average = (arr) => {
    const valid = arr.filter(n => !isNaN(n));
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
  };

  const analyze = (rows) => {
    const validRows = rows.filter(r => r.Model && r["Plate No"]);
    const total = validRows.length;
    const invygo = validRows.filter(r => r.isInvygo).length;
    const modelCounts = {};
    const modelInvygo = {};
    validRows.forEach(r => {
      if (!r.Model || r.Model === "56" || r.Model === "") return;
      modelCounts[r.Model] = (modelCounts[r.Model] || 0) + 1;
      if (r.isInvygo) modelInvygo[r.Model] = (modelInvygo[r.Model] || 0) + 1;
    });

    const modelSummaryData = Object.keys(modelCounts).map(model => {
      const relatedCars = validRows.filter(r => r.Model === model);
      const daily = average(relatedCars.map(r => Number(r.RentPerDay)));
      const monthly = average(relatedCars.map(r => Number(r.RentPerMonth)));
      const yearly = average(relatedCars.map(r => Number(r.RentPerYear)));
      return {
        model,
        total: modelCounts[model],
        invygo: modelInvygo[model] || 0,
        daily: daily ? daily.toFixed(0) : '-',
        monthly: monthly ? monthly.toFixed(0) : '-',
        yearly: yearly ? yearly.toFixed(0) : '-',
        yellow: modelCounts[model] - (modelInvygo[model] || 0)
      };
    }).sort((a, b) => b.total - a.total);

    setSummary({ total, invygo });
    setModelSummary(modelSummaryData);
    setShowSummaryCards(true);
  };
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !(file instanceof Blob)) return alert("Invalid file.");
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "array" });
      const sheet = workbook.Sheets["Fleet DXB"];
      const raw = XLSX.utils.sheet_to_json(sheet);
      const cleaned = raw.map(r => ({
        ...r,
        PlateNoClean: String(r["Plate No"] || "").replace(/\s/g, "").toUpperCase(),
        RegDate: formatDate(r["Reg Date"]),
        ExpDate: formatDate(r["Exp Date"]),
        SaleDate: formatDate(r["Sale Date"]),
        Remarks: String(r.Remarks || "").toUpperCase(),
        isInvygo: String(r.Remarks || "").toUpperCase().includes("INVYGO")
      }));
      setData(cleaned);
      console.log("✅ Cleaned data loaded", cleaned.length, cleaned[0]);
      setFiltered([]);
      setSummary(null);
      setModelSummary([]);
      analyze(cleaned);
      setShowFiltered(false);
      setShowSmart(false);
      if (typeof onDataLoaded === "function") onDataLoaded(cleaned);


    };
    reader.readAsArrayBuffer(file);
  };

  // Export
  const handleExport = () => {
    let exportData = null;
    // 1. إذا كان جدول تفاصيل الكارت ظاهر
    if (showSummaryDetail) {
      if (showSummaryDetail === 'total') {
        exportData = data;
      } else if (showSummaryDetail === 'invygo') {
        exportData = data.filter(car => (car.Remarks || '').toUpperCase().includes('INVYGO'));
      } else if (showSummaryDetail === 'yelo') {
        exportData = data.filter(car => !(car.Remarks || '').toUpperCase().includes('INVYGO'));
      }
    }
    // 2. إذا كان جدول تفاصيل الاكسبيري (حسب التاريخ) ظاهر
    else if (expiryDateResult && expiryDateResult.cars && expiryDateResult.cars.length > 0) {
      exportData = expiryDateResult.cars;
    }
    // 3. إذا كان جدول الاكسبيري العام ظاهر
    else if (showExpiryTable) {
      exportData = (expiryFiltered && expiryFiltered.length > 0)
        ? expiryFiltered
        : data.filter(car => {
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
    // 4. إذا كان هناك نتائج بحث ظاهرة
    else if (showFiltered && filtered.length > 0) {
      exportData = filtered;
    }
    // إذا لا يوجد أي نتائج ظاهرة
    if (!exportData || exportData.length === 0) {
      alert('لا يوجد بيانات للتصدير!');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fleet Report');
    XLSX.writeFile(wb, `Fleet_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // دالة تطبيق فلاتر الجدول مثل الإكسيل (عامة)
  const applyFilters = (dataToFilter, filters) => {
    return dataToFilter.filter(row => {
      return Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue) return true; // إذا كان الفلتر فارغ، لا يطبق
        
        // دعم الفلترة المتعددة بالقيم المفصولة بفاصلة
        const filterValues = filterValue.split(',').map(v => v.toLowerCase().trim()).filter(Boolean);
        if (filterValues.length === 0) return true;
        
        // دالة مساعدة: هل أي قيمة من الفلاتر موجودة في قيمة الحقل؟
        const matchesAny = (fieldStr) => filterValues.some(val => fieldStr.includes(val));
        
        switch (key) {
          case 'model':
            return matchesAny(String(row.Model || row.model || '').toLowerCase());
          case 'year':
            return matchesAny(String(row["Year Model"] || row["Year"] || row.year || '').toLowerCase());
          case 'color':
            return matchesAny(String(row.Color || row[" color"] || row["COLOR"] || row.color || '').toLowerCase());
          case 'plateNo':
            return matchesAny(String(row["Plate No"] || row.plateNo || '').toLowerCase());
          case 'rentalRate':
            return matchesAny(String(row["Rental Rate"] || row.rentalRate || '').toLowerCase());
          case 'chassisNo':
            return matchesAny(String(row["Chassis no."] || row.chassisNo || '').toLowerCase());
          case 'regExp':
            return matchesAny(String(row["Reg Exp"] || row.regExp || '').toLowerCase());
          case 'insurExp':
            return matchesAny(String(row["Insur Exp"] || row.insurExp || '').toLowerCase());
          case 'remarks':
            return matchesAny(String(row.Remarks || row.remarks || '').toLowerCase());
          // دعم أعمدة السامري
          case 'total':
            return matchesAny(String(row.total || ''));
          case 'invygo':
            return matchesAny(String(row.invygo || ''));
          case 'yelo':
            return matchesAny(String(row.yelo || row.yellow || ''));
          default:
            return true;
        }
      });
    });
  };

  // دالة تطبيق فلاتر الجدول مثل الإكسيل (للجدول الرئيسي)
  const applyTableFilters = (dataToFilter) => {
    return applyFilters(dataToFilter, tableFilters);
  };

  // دالة تحديث فلتر معين
  const updateFilter = (filterKey, value) => {
    setTableFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  // دالة تحديث فلتر Smart Navigation
  const updateSmartFilter = (filterKey, value) => {
    setSmartTableFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  // دالة تحديث فلتر Summary
  const updateSummaryFilter = (filterKey, value) => {
    setSummaryTableFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  // دالة تحديث فلتر Expiry
  const updateExpiryFilter = (filterKey, value) => {
    setExpiryTableFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  // دالة تحديث فلتر تفاصيل الكروت
  const updateDetailFilter = (filterKey, value) => {
    setDetailTableFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  // دالة مسح جميع الفلاتر
  const clearAllFilters = () => {
    setTableFilters({
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
  };

  // دالة مسح فلاتر Smart Navigation
  const clearSmartFilters = () => {
    setSmartTableFilters({
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
  };

  // دالة مسح فلاتر Summary
  const clearSummaryFilters = () => {
    setSummaryTableFilters({
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
  };

  // دالة مسح فلاتر Expiry
  const clearExpiryFilters = () => {
    setExpiryTableFilters({
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
  };

  // دالة مسح فلاتر تفاصيل الكروت
  const clearDetailFilters = () => {
    setDetailTableFilters({
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
  };

  // تحديث الكروت الدائمة عند تحميل البيانات
  useEffect(() => {
    if (data && data.length > 0) {
      const validRows = data.filter(r => r.Model && r["Plate No"]);
      const total = validRows.length;
      const invygo = validRows.filter(r => r.isInvygo).length;
      const modelCounts = {};
      const modelInvygo = {};
      validRows.forEach(r => {
        if (!r.Model || r.Model === "56" || r.Model === "") return;
        modelCounts[r.Model] = (modelCounts[r.Model] || 0) + 1;
        if (r.isInvygo) modelInvygo[r.Model] = (modelInvygo[r.Model] || 0) + 1;
      });

      const modelSummaryData = Object.keys(modelCounts).map(model => {
        const relatedCars = validRows.filter(r => r.Model === model);
        const daily = average(relatedCars.map(r => Number(r.RentPerDay)));
        const monthly = average(relatedCars.map(r => Number(r.RentPerMonth)));
        const yearly = average(relatedCars.map(r => Number(r.RentPerYear)));
        return {
          model,
          total: modelCounts[model],
          invygo: modelInvygo[model] || 0,
          daily: daily ? daily.toFixed(0) : '-',
          monthly: monthly ? monthly.toFixed(0) : '-',
          yearly: yearly ? yearly.toFixed(0) : '-',
          yellow: modelCounts[model] - (modelInvygo[model] || 0)
        };
      }).sort((a, b) => b.total - a.total);

      setSummaryAll({ total, invygo });
      setModelSummaryAll(modelSummaryData);
    }
  }, [data]);

  // Search
  const handleSearch = () => {
    setSearchCardColor(cardColors[Math.floor(Math.random() * cardColors.length)]);
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      setFiltered([]);
      setShowFiltered(false);
      setExpiryDateResult(null);
      setShowExpiryDateDetails(false);
      setExpiryModalTable(null);
      setShowExpiryTable(false);
      setExpiryFiltered(null);
      return;
    }
    setExpiryDateResult(null);
    setShowExpiryDateDetails(false);
    setExpiryModalTable(null);
    setShowExpiryTable(false);
    setExpiryFiltered(null);

    // البحث المطور: تطابق كامل أولاً، ثم تطابق جزئي إذا لم يوجد
    const tokens = keyword.split(/\s+/);
    let results = [];
    if (tokens.length === 1) {
      // كلمة واحدة: ابحث عن تطابق كامل في كل الأعمدة أولاً
      const searchVal = tokens[0];
      // 1. تطابق كامل
      const exactMatches = data.filter(row =>
        Object.values(row).some(val => String(val || '').toLowerCase() === searchVal)
      );
      if (exactMatches.length > 0) {
        results = exactMatches;
      } else {
        // 2. تطابق جزئي (contains)
        results = data.filter(row =>
          Object.values(row).some(val => String(val || '').toLowerCase().includes(searchVal))
        );
      }
    } else if (tokens.length >= 2) {
      // تحقق إذا كان أول كلمة اسم حقل معروف
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
        // ابحث في الحقل فقط
        const value = tokens.slice(1).join(' ').trim();
        // 1. تطابق كامل
        const exactMatches = data.filter(row => String(row[field] || '').toLowerCase() === value);
        if (exactMatches.length > 0) {
          results = exactMatches;
        } else {
          // 2. تطابق جزئي
          results = data.filter(row => String(row[field] || '').toLowerCase().includes(value));
        }
      } else {
        // إذا لم يكن اسم حقل معروف، ابحث عن كل كلمة في كل الأعمدة (تطابق كامل أولاً)
        // 1. تطابق كامل لكل كلمة
        const exactMatches = data.filter(row =>
          tokens.every(token =>
            Object.values(row).some(val => String(val || '').toLowerCase() === token)
          )
        );
        if (exactMatches.length > 0) {
          results = exactMatches;
        } else {
          // 2. تطابق جزئي لكل كلمة
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

  // Google Sheet fetch
  const fetchFromGoogleSheet = async () => {
    const sheetUrl = "https://docs.google.com/spreadsheets/d/1sHvEQMtt3suuxuMA0zhcXk5TYGqZzit0JvGLk1CQ0LI/export?format=csv&gid=804568597";
    try {
      const res = await fetch(sheetUrl);
      const text = await res.text();
      const rows = text.split('\n').map(row => row.split(','));
      const headers = rows[0];
      const dataArr = rows.slice(1).map(row =>
        Object.fromEntries(row.map((cell, i) => [headers[i].trim(), cell]))
      );
      const cleaned = dataArr.map(r => ({
        ...r,
        PlateNoClean: String(r["Plate No"] || "").replace(/\s/g, "").toUpperCase(),
        RegExp: formatDate(r["Reg Exp"]),
        InsurExp: formatDate(r["Insur Exp"]),
        SaleDate: formatDate(r["Sale Date"]),
        Remarks: String(r.Remarks || "").toUpperCase(),
        isInvygo: String(r.Remarks || "").toUpperCase().includes("INVYGO")
      }));
      setData(cleaned);
      setFiltered([]);
      analyze(cleaned); // فقط للكروت الدائمة
      setShowFiltered(false);
      if (typeof onDataLoaded === "function") onDataLoaded(cleaned);
    } catch (err) {
      alert("Error fetching data from Google Sheets");
    }
  };

  useEffect(() => {
    fetchFromGoogleSheet();
    // eslint-disable-next-line
  }, []);

  // 2. احسب عدد السيارات المنتهية حتى اليوم عند تحميل البيانات أو عند تغيير الفلتر
  useEffect(() => {
    if (!data || !data.length) return;
    if (expiryFiltered) {
      setExpiryCount(expiryFiltered.length);
    } else {
      // احسب السيارات المنتهية حتى اليوم
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
    }
  }, [data, expiryFiltered]);

  // Unique values for smart navigation
  const uniqueClasses = [...new Set(data.map(row => row['Class']).filter(Boolean))];
  const uniqueMakes = selectedClass
    ? [...new Set(data.filter(r => r.Class === selectedClass).map(r => r['Manufacturer']).filter(Boolean))]
    : [];
  const filteredCars = selectedMake
    ? data.filter(r => r.Class === selectedClass && r.Manufacturer === selectedMake)
    : [];

  const yellowOnly = summary ? summary.total - summary.invygo : 0;

  // Cars expiring in month
  function getCarsExpiringInMonth(month, year) {
    if (!month || !year) return [];
    return data.filter(car => {
      const exp = car.RegExp || car["Reg Exp"];
      if (!exp) return false;
      let d;
      if (typeof exp === "string" && exp.includes("-")) d = new Date(exp);
      else if (typeof exp === "string" && exp.includes("/")) {
        const [day, mon, yr] = exp.split("/");
        d = new Date(`${yr}-${mon}-${day}`);
      } else if (exp instanceof Date) d = exp;
      else return false;
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });
  }

  // أضف هذا useEffect بعد تعريف كل الstates
  useEffect(() => {
    if (view !== 'search') {
      setFiltered([]);
      setShowFiltered(false);
      setExpiryDateResult(null);
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

  useEffect(() => {
    setShowSummaryDetail(null);
    setShowExpiryTable(false);
    setShowFiltered(false);
    setExpiryDateResult(null);
    setExpiryModalTable(null);
    setExpiryFiltered(null);
    setSelectedSummaryModel(null);
  }, [view]);

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* Navigation Buttons */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(255,255,255,0.95)',
          boxShadow: '0 2px 16px #fdd83533',
          padding: '24px 0 18px 0',
          marginBottom: '18px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '800px',
          margin: '0 auto 18px auto',
          borderRadius: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px' }}>
          <button
            onClick={() => { setView('search'); setSelectedClass(null); setSelectedMake(null); }}
            style={{
              fontSize: '1.35rem',
              fontWeight: 'bold',
              padding: '18px 38px',
              borderRadius: '14px',
              background: '#ffde38',
              color: '#111',
              border: 'none',
              boxShadow: '0 2px 8px #b39ddb55',
              cursor: 'pointer',
              transition: 'transform 0.13s, box-shadow 0.13s'
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.07)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Home
          </button>
          <button
            onClick={() => { setView('smart'); setSelectedClass(null); setSelectedMake(null); }}
            style={{
              fontSize: '1.35rem',
              fontWeight: 'bold',
              padding: '18px 38px',
              borderRadius: '14px',
              background: '#7b1fa2',
              color: '#ffde38',
              border: 'none',
              boxShadow: '0 2px 8px #b39ddb55',
              cursor: 'pointer',
              transition: 'transform 0.13s, box-shadow 0.13s'
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.07)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Smart
          </button>
          <button
            onClick={() => { setView('summary'); setSelectedClass(null); setSelectedMake(null); setSelectedSummaryModel(null); }}
            style={{
              fontSize: '1.35rem',
              fontWeight: 'bold',
              padding: '18px 38px',
              borderRadius: '14px',
              background: '#ffde38',
              color: '#111',
              border: 'none',
              boxShadow: '0 2px 8px #b39ddb55',
              cursor: 'pointer',
              transition: 'transform 0.13s, box-shadow 0.13s'
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.07)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Summary
          </button>
          {/* New Expiry Button */}
          <button
            onClick={() => setExpiryModalOpen(true)}
            style={{
              fontSize: '1.35rem',
              fontWeight: 'bold',
              padding: '18px 38px',
              borderRadius: '14px',
              background: '#7b1fa2',
              color: '#ffde38',
              border: 'none',
              boxShadow: '0 2px 8pxrgb(224, 221, 39)',
              cursor: 'pointer',
              transition: 'transform 0.13s, box-shadow 0.13s'
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.07)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Cars Expiry
          </button>
        </div>
      </div>

      {/* Expiry Modal */}
      <Modal open={expiryModalOpen} onClose={() => setExpiryModalOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 340,
          bgcolor: 'background.paper',
          border: '1px solid #ccc',
          boxShadow: 6,
          p: 4,
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <h2>Select Expiry Date</h2>
          <input
            type="date"
            value={expiryDate}
            onChange={e => setExpiryDate(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && expiryDate) {
                e.preventDefault();
                setExpiryModalOpen(false);
                setExpiryDateResult(null);
                setShowExpiryDateDetails(false);
                setExpiryModalTable(null);
                setShowExpiryTable(false);
                setExpiryFiltered(null);
                setView('search'); // إظهار الصفحة الرئيسية فقط
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
                });
                setExpiryDateResult({ cars, date: expiryDate });
                setFiltered([]);
                setShowFiltered(false);
              }
            }}
            style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', marginBottom: 18 }}
            max={new Date().toISOString().slice(0, 10)}
          />
          <button
            onClick={() => {
              if (!expiryDate) return;
              setExpiryModalOpen(false);
              setExpiryDateResult(null);
              setShowExpiryDateDetails(false);
              setExpiryModalTable(null);
              setShowExpiryTable(false);
              setExpiryFiltered(null);
              setView('search'); // إظهار الصفحة الرئيسية فقط
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
              });
              setExpiryDateResult({ cars, date: expiryDate });
              setFiltered([]);
              setShowFiltered(false);
            }}
            style={{
              padding: '10px 22px',
              borderRadius: '8px',
              background: '#6a1b9a',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              marginTop: '8px'
            }}
            disabled={!expiryDate}
          >
            Show Expiry Cars
          </button>
        </Box>
      </Modal>

      {/* SMART NAVIGATION */}
      {view === 'smart' && (
        <div>
          {/* كروت الفئات */}
          {!selectedClass && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '24px',
                margin: '0 auto',
                maxWidth: '1000px',
                justifyItems: 'center',
                marginTop: '32px'
              }}
            >
              {uniqueClasses.map((cls, i) => {
                const colors = ['#ffe082', '#ce93d8', '#b3e5fc', '#c8e6c9', '#ffccbc', '#f8bbd0', '#fff9c4', '#b2dfdb'];
                const bg = colors[i % colors.length];
                return (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    style={{
                      background: bg,
                      borderRadius: '18px',
                      fontWeight: 'bold',
                      border: 'none',
                      boxShadow: '0 4px 18px #b39ddb33',
                      cursor: 'pointer',
                      fontSize: '1.5rem',
                      width: '100%',
                      minHeight: '90px',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      textAlign: 'center',
                      padding: '18px 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 8px 28px #b39ddb';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 18px #b39ddb33';
                    }}
                  >
                    {cls}
                  </button>
                );
              })}
            </div>
          )}

          {/* اختيار المصنع */}
          {selectedClass && !selectedMake && (
            <div style={{ marginTop: '32px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{ color: '#6a1b9a', marginBottom: '18px' }}>
                Models in <span style={{ color: '#ffb300' }}>{selectedClass}</span>
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '24px',
                  maxWidth: '1000px',
                  width: '100%',
                  justifyItems: 'center'
                }}
              >
                {[...new Set(data.filter(car => car.Class === selectedClass).map(car => car.Model))]
                  .filter(Boolean)
                  .map((model, i) => {
                    const colors = ['#ffe082', '#ce93d8', '#b3e5fc', '#c8e6c9', '#ffccbc', '#f8bbd0', '#fff9c4', '#b2dfdb'];
                    const bg = colors[i % colors.length];
                    return (
                      <button
                        key={model}
                        onClick={() => setSelectedMake(model)}
                        style={{
                          background: bg,
                          borderRadius: '18px',
                          fontWeight: 'bold',
                          border: 'none',
                          boxShadow: '0 4px 18px #b39ddb33',
                          fontSize: '1.2rem',
                          width: '100%',
                          minHeight: '70px',
                          padding: '16px 0',
                          textAlign: 'center',
                          marginBottom: '8px',
                          transition: 'transform 0.15s, box-shadow 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 8px 28px #b39ddb';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 4px 18px #b39ddb33';
                        }}
                      >
                        {model}
                      </button>
                    );
                  })}
              </div>
              <button
                onClick={() => setSelectedClass(null)}
                style={{
                  marginTop: '28px',
                  color: '#d32f2f',
                  background: 'none',
                  border: 'none',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '1.1rem'
                }}
              >
                Back to Classes
              </button>
            </div>
          )}

          {/* جدول السيارات داخل الموديل */}
          {selectedClass && selectedMake && (
            <div style={{ marginTop: '32px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{ color: '#7b1fa2', fontWeight: 'bold', fontSize: '2rem', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px' }}>
                {colorizeInvygoYelo(`Cars in ${selectedMake} (${data.filter(car => car.Class === selectedClass && car.Model === selectedMake).length})`)}
                <button onClick={() => {
                  let exportData = data.filter(car => car.Class === selectedClass && car.Model === selectedMake);
                  if (!exportData.length) return alert('لا يوجد بيانات للتصدير!');
                  let count = data.filter(car => car.Class === selectedClass && car.Model === selectedMake).length;
                  let title = `Cars in ${selectedMake} (${count})`;
                  title = title.replace(/[^\w\d\-()]+/g, '_');
                  const ws = XLSX.utils.json_to_sheet(exportData);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, 'Fleet Report');
                  XLSX.writeFile(wb, `${title}_${new Date().toISOString().slice(0, 10)}.xlsx`);
                }} style={{ background: '#7b1fa2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 'bold', fontSize: '1.08rem', cursor: 'pointer', marginLeft: 18 }}>Export</button>
              </h2>
              <div style={{ width: '100%', maxWidth: '1100px', overflowX: 'auto' }}>
                <table style={{
                  borderCollapse: 'collapse',
                  width: '100%',
                  background: '#fffde7',
                  boxShadow: '0 2px 12px #b39ddb33',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  fontSize: '1.08rem',
                  minWidth: '1100px'
                }}>
                  <thead>
                    <tr style={{ background: '#ffe082', color: '#7b1fa2', fontWeight: 'bold' }}>
                      <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>#</th>
                      <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>{colorizeInvygoYelo('Model')}</th>
                      <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>Plate No</th>
                      <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>Class</th>
                      <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>{colorizeInvygoYelo('Color')}</th>
                      <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>{colorizeInvygoYelo('Year')}</th>
                      <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>Reg Expiry</th>
                      <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>Insur Expiry</th>
                      <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>Mortgage</th>
                      <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>{colorizeInvygoYelo('Remarks')}</th>
                    </tr>
                    {/* صف الفلاتر لجدول Smart Navigation */}
                    <tr style={{ background: '#f5f5f5' }}>
                      <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                        <button 
                          onClick={clearSmartFilters}
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
                      <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                        <input
                          type="text"
                          placeholder="Filter Model"
                          value={smartTableFilters.model}
                          onChange={(e) => updateSmartFilter('model', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px',
                            fontSize: '0.8rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                        <input
                          type="text"
                          placeholder="Filter Plate"
                          value={smartTableFilters.plateNo}
                          onChange={(e) => updateSmartFilter('plateNo', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px',
                            fontSize: '0.8rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                        <input
                          type="text"
                          placeholder="Filter Class"
                          value={smartTableFilters.class}
                          onChange={(e) => updateSmartFilter('class', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px',
                            fontSize: '0.8rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                        <input
                          type="text"
                          placeholder="Filter Color"
                          value={smartTableFilters.color}
                          onChange={(e) => updateSmartFilter('color', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px',
                            fontSize: '0.8rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                        <input
                          type="text"
                          placeholder="Filter Year"
                          value={smartTableFilters.year}
                          onChange={(e) => updateSmartFilter('year', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px',
                            fontSize: '0.8rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                        <input
                          type="text"
                          placeholder="Filter Reg"
                          value={smartTableFilters.regExp}
                          onChange={(e) => updateSmartFilter('regExp', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px',
                            fontSize: '0.8rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                        <input
                          type="text"
                          placeholder="Filter Insur"
                          value={smartTableFilters.insurExp}
                          onChange={(e) => updateSmartFilter('insurExp', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px',
                            fontSize: '0.8rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                        <input
                          type="text"
                          placeholder="Filter Mortgage"
                          value={smartTableFilters.mortgage}
                          onChange={(e) => updateSmartFilter('mortgage', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px',
                            fontSize: '0.8rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                        />
                      </td>
                      <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                        <input
                          type="text"
                          placeholder="Filter Remarks"
                          value={smartTableFilters.remarks}
                          onChange={(e) => updateSmartFilter('remarks', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '4px',
                            fontSize: '0.8rem',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                        />
                      </td>
                    </tr>
                  </thead>
                                      <tbody>
                      {applyFilters(data.filter(car => car.Class === selectedClass && car.Model === selectedMake), smartTableFilters).map((car, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f5f5f5' }}>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{i + 1}</td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                          {colorizeInvygoYelo(car.Model)}
                          <span 
                            onClick={() => searchCarImage(car.Model, car["Year Model"], car.Color)}
                            style={{ marginLeft: '5px', cursor: 'pointer', fontSize: '0.8rem' }}
                            title="Search car image on Google"
                          >
                            🔍
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Plate No"] || '-'}</td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car.Class || '-'}</td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car.Color || '-'}</td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Year Model"] || '-'}</td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car.RegExp || '-'}</td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car.InsurExp || '-'}</td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car.Mortgage || '-'}</td>
                        <td style={{ padding: '10px 8px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{colorizeInvygoYelo(car.Remarks || '-')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => setSelectedMake(null)}
                style={{
                  marginTop: '28px',
                  color: '#d32f2f',
                  background: 'none',
                  border: 'none',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '1.1rem'
                }}
              >
                Back to Models
              </button>
            </div>
          )}
        </div>
      )}

      {/* الصفحة الرئيسية - بحث */}
      {view === 'search' && (
        <div>
          <header
            style={{
              padding: '30px 40px',
              borderRadius: '20px',
              background: '#fdd835',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgb(92, 7, 248)',
              marginBottom: '30px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <h1 style={{ fontSize: '38px', margin: '0', color: '#6a1b9a' }}>YELO Fleet Report</h1>
            <p style={{ fontSize: '16px', marginTop: '6px', color: '#7b1fa2' }}>
              Smart fleet insight powered by future AI intelligence 🚗
            </p>
          </header>

          <div style={{
            padding: '15px 20px',
            borderRadius: '20px',
            background: '#fdd835',
            color: '#000',
            fontWeight: 'bold',
            fontSize: '16px',
            boxShadow: '0 4px 12px rgb(92, 7, 248)',
            marginBottom: '30px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '600px',
            margin: '20px auto 30px auto'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch}>Search</button>
              <button onClick={() => fetchFromGoogleSheet()}>Reload Google Sheet</button>
              <button onClick={handleExport}>Export</button>
              <button onClick={() => {
                setFiltered([]);
                setShowFiltered(false);
                setExpiryDateResult(null);
                setShowExpiryDateDetails(false);
                setExpiryModalTable(null);
                setShowExpiryTable(false);
                setExpiryFiltered(null);
              }}>Reset</button>
            </div>
          </div>

          {/* Cards Summary */}
          {showSummaryCards && summaryAll && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
              <div className="modal-card"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setShowSummaryDetail(prev => prev === 'total' ? null : 'total');
                  setShowExpiryTable(false);
                  setShowFiltered(false);
                  setExpiryDateResult(null);
                  setExpiryModalTable(null);
                  setExpiryFiltered(null);
                  setSelectedSummaryModel(null);
                }}
                title="Show all cars details"
              >
                <strong>Total Cars:</strong> {summaryAll.total}
              </div>
              <div className="modal-card"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setShowSummaryDetail(prev => prev === 'invygo' ? null : 'invygo');
                  setShowExpiryTable(false);
                  setShowFiltered(false);
                  setExpiryDateResult(null);
                  setExpiryModalTable(null);
                  setExpiryFiltered(null);
                  setSelectedSummaryModel(null);
                }}
                title="Show Invygo cars details"
              >
                <strong>Invygo Cars:</strong> {summaryAll.invygo}
              </div>
              <div className="modal-card"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setShowSummaryDetail(prev => prev === 'yelo' ? null : 'yelo');
                  setShowExpiryTable(false);
                  setShowFiltered(false);
                  setExpiryDateResult(null);
                  setExpiryModalTable(null);
                  setExpiryFiltered(null);
                  setSelectedSummaryModel(null);
                }}
                title="Show YELO cars details"
              >
                <strong>YELO Cars:</strong> {summaryAll.total - summaryAll.invygo}
              </div>
              <div
                className="modal-card"
                style={{ background: '#fffde7', border: '2px solid #ffe082', color: '#d32f2f', cursor: 'pointer', minWidth: 120 }}
                onClick={() => {
                  setShowExpiryTable(prev => !prev);
                  setShowSummaryDetail(null);
                  setShowFiltered(false);
                  setExpiryDateResult(null);
                  setExpiryModalTable(null);
                  setExpiryFiltered(null);
                  setSelectedSummaryModel(null);
                }}
                title="Show expired cars details"
              >
                <strong>Expiry:</strong> {expiryCount}
              </div>
            </div>
          )}

          {/* Filtered Results */}
          {showFiltered && filtered.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: 18, color: '#6a1b9a', textAlign: 'center' }}>🔍 Search Results
                <span style={{ fontSize: '1.2rem', color: '#7b1fa2', marginLeft: 10 }}>
                  ({applyTableFilters(filtered).length} of {filtered.length})
                </span>
              </h2>
              {filtered.length === 1 ? (
                // عرض كارت واحد فقط إذا كانت النتيجة واحدة
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <div
                    style={{
                      background: searchCardColor,
                      borderRadius: '22px',
                      boxShadow: '0 6px 24px #b39ddb33',
                      padding: '32px 28px',
                      minWidth: '0',
                      width: '100%',
                      maxWidth: '420px',
                      border: '2px solid #e1bee7',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      fontSize: '1.22rem',
                      transition: 'transform 0.18s, box-shadow 0.18s',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '1.45rem', color: '#6a1b9a', marginBottom: 12, letterSpacing: '1px' }}>
                      🚗 {filtered[0].Model || '-'}
                    </div>
                    <div><strong>Plate:</strong> <span style={{ color: '#222' }}>{filtered[0]["Plate No"] || '-'}</span></div>
                    <div><strong>Class:</strong> <span style={{ color: '#222' }}>{filtered[0].Class || '-'}</span></div>
                    <div><strong>Color:</strong> <span style={{ color: '#222' }}>{filtered[0].Color || '-'}</span></div>
                    <div><strong>Year:</strong> <span style={{ color: '#222' }}>{filtered[0]["Year Model"] || '-'}</span></div>
                    <div><strong>Reg Exp:</strong> <span style={{ color: '#222' }}>{filtered[0].RegExp || '-'}</span></div>
                    <div><strong>Insur Exp:</strong> <span style={{ color: '#222' }}>{filtered[0].InsurExp || '-'}</span></div>
                    <div><strong>Mortgage:</strong> <span style={{ color: '#222' }}>{filtered[0].Mortgage || '-'}</span></div>
                    <div><strong>Chassis no.:</strong> <span style={{ color: '#222' }}>{filtered[0]["Chassis no."] || '-'}</span></div>
                    <div><strong>Remarks:</strong> <span style={{ color: '#222' }}>{filtered[0].Remarks || '-'}</span></div>
                  </div>
                </div>
              ) : (
                // عرض جدول إذا كانت النتائج أكثر من واحدة
                <div style={{ width: '100%', maxWidth: '1100px', overflowX: 'auto' }}>
                  <table style={{
                    borderCollapse: 'collapse',
                    background: '#fffde7',
                    boxShadow: '0 2px 12px #b39ddb33',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    fontSize: '0.9rem',
                    tableLayout: 'auto'
                  }}>
                    <thead>
                      <tr style={{ background: '#ffe082', color: '#222', fontWeight: 'bold' }}>
                        <th style={{ padding: '6px 4px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>#</th>
                        <th style={{ padding: '6px 4px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>Model</th>
                        <th style={{ padding: '6px 4px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>Year</th>
                        <th style={{ padding: '6px 4px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>Color</th>
                        <th style={{ padding: '6px 4px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>Plate No</th>
                        <th style={{ padding: '6px 4px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>Rental Rate</th>
                        <th style={{ padding: '6px 4px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>Chassis no.</th>
                        <th style={{ padding: '6px 4px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>Reg Exp</th>
                        <th style={{ padding: '6px 4px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>Insur Exp</th>
                        <th style={{ padding: '6px 4px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>Remarks</th>
                      </tr>
                      {/* صف الفلاتر داخل الجدول */}
                      <tr style={{ background: '#f5f5f5' }}>
                        <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                          <button 
                            onClick={clearAllFilters}
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
                        <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                          <input
                            type="text"
                            placeholder="Filter Model"
                            value={tableFilters.model}
                            onChange={(e) => updateFilter('model', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '4px',
                              fontSize: '0.8rem',
                              border: '1px solid #ccc',
                              borderRadius: '4px'
                            }}
                          />
                        </td>
                        <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                          <input
                            type="text"
                            placeholder="Filter Year"
                            value={tableFilters.year}
                            onChange={(e) => updateFilter('year', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '4px',
                              fontSize: '0.8rem',
                              border: '1px solid #ccc',
                              borderRadius: '4px'
                            }}
                          />
                        </td>
                        <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                          <input
                            type="text"
                            placeholder="Filter Color"
                            value={tableFilters.color}
                            onChange={(e) => updateFilter('color', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '4px',
                              fontSize: '0.8rem',
                              border: '1px solid #ccc',
                              borderRadius: '4px'
                            }}
                          />
                        </td>
                        <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                          <input
                            type="text"
                            placeholder="Filter Plate"
                            value={tableFilters.plateNo}
                            onChange={(e) => updateFilter('plateNo', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '4px',
                              fontSize: '0.8rem',
                              border: '1px solid #ccc',
                              borderRadius: '4px'
                            }}
                          />
                        </td>
                        <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                          <input
                            type="text"
                            placeholder="Filter Rate"
                            value={tableFilters.rentalRate}
                            onChange={(e) => updateFilter('rentalRate', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '4px',
                              fontSize: '0.8rem',
                              border: '1px solid #ccc',
                              borderRadius: '4px'
                            }}
                          />
                        </td>
                        <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                          <input
                            type="text"
                            placeholder="Filter Chassis"
                            value={tableFilters.chassisNo}
                            onChange={(e) => updateFilter('chassisNo', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '4px',
                              fontSize: '0.8rem',
                              border: '1px solid #ccc',
                              borderRadius: '4px'
                            }}
                          />
                        </td>
                        <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                          <input
                            type="text"
                            placeholder="Filter Reg"
                            value={tableFilters.regExp}
                            onChange={(e) => updateFilter('regExp', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '4px',
                              fontSize: '0.8rem',
                              border: '1px solid #ccc',
                              borderRadius: '4px'
                            }}
                          />
                        </td>
                        <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                          <input
                            type="text"
                            placeholder="Filter Insur"
                            value={tableFilters.insurExp}
                            onChange={(e) => updateFilter('insurExp', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '4px',
                              fontSize: '0.8rem',
                              border: '1px solid #ccc',
                              borderRadius: '4px'
                            }}
                          />
                        </td>
                        <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                          <input
                            type="text"
                            placeholder="Filter Remarks"
                            value={tableFilters.remarks}
                            onChange={(e) => updateFilter('remarks', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '4px',
                              fontSize: '0.8rem',
                              border: '1px solid #ccc',
                              borderRadius: '4px'
                            }}
                          />
                        </td>
                      </tr>
                    </thead>
                    <tbody>
                      {applyTableFilters(filtered).map((car, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f5f5f5', textAlign: 'center' }}>
                          <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{i + 1}</td>
                          <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', color: '#7b1fa2', fontWeight: 'bold' }}>
                            {colorizeInvygoYelo(car.Model)}
                            <span 
                              onClick={() => searchCarImage(car.Model, car["Year Model"] || car["Year"], car["Color"] || car[" color"] || car["COLOR"])}
                              style={{ marginLeft: '5px', cursor: 'pointer', fontSize: '0.8rem' }}
                              title="Search car image on Google"
                            >
                              🔍
                            </span>
                          </td>
                          <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Year Model"] || car["Year"] || '-'}</td>
                          <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Color"] || car[" color"] || car["COLOR"] || '-'}</td>
                          <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Plate No"] || '-'}</td>
                          <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Rental Rate"] || '-'}</td>
                          <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Chassis no."] || '-'}</td>
                          <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Reg Exp"] || '-'}</td>
                          <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Insur Exp"] || '-'}</td>
                          <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{colorizeInvygoYelo(car.Remarks || '-')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUMMARY PAGE */}
      {view === 'summary' && modelSummaryAll.length > 0 && !selectedSummaryModel && (
        <div style={{ marginTop: '32px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ color: '#7b1fa2', fontWeight: 'bold', fontSize: '2.1rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span role="img" aria-label="box">📦</span> Summary by Model ({modelSummaryAll.length})
          </h2>
          <div style={{ width: '100%', maxWidth: '900px', overflowX: 'auto' }}>
            <table style={{
              borderCollapse: 'collapse',
              width: '100%',
              background: '#fffde7',
              boxShadow: '0 2px 12px #b39ddb33',
              borderRadius: '16px',
              overflow: 'hidden',
              fontSize: '1.08rem',
              minWidth: '600px'
            }}>
              <thead>
                <tr style={{ background: '#ffe082', color: '#222', fontWeight: 'bold' }}>
                  <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>#</th>
                  <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>Model</th>
                  <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>Total</th>
                  <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>{colorizeInvygoYelo('Invygo')}</th>
                  <th style={{ padding: '12px 8px', borderBottom: '2px solid #ffe082', textAlign: 'center' }}>{colorizeInvygoYelo('YELO')}</th>
                </tr>
                {/* صف الفلاتر لجدول Summary */}
                <tr style={{ background: '#f5f5f5' }}>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <button 
                      onClick={clearSummaryFilters}
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
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Model"
                      value={summaryTableFilters.model}
                      onChange={(e) => updateSummaryFilter('model', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Total"
                      value={summaryTableFilters.total}
                      onChange={(e) => updateSummaryFilter('total', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Invygo"
                      value={summaryTableFilters.invygo}
                      onChange={(e) => updateSummaryFilter('invygo', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter YELO"
                      value={summaryTableFilters.yelo}
                      onChange={(e) => updateSummaryFilter('yelo', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                </tr>
              </thead>
                              <tbody>
                  {applyFilters(modelSummaryAll, summaryTableFilters).map((item, i) => {
                  const rowBg = i % 2 === 0 ? '#fff' : '#f5f5f5';
                  return (
                    <tr key={item.model} style={{ background: rowBg, textAlign: 'center' }}>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid #ffe082', textAlign: 'center', background: rowBg, cursor: 'pointer' }}
                        onClick={() => setSelectedSummaryModel({ model: item.model, filter: 'all' })}
                      >{i + 1}</td>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid #ffe082', color: '#7b1fa2', fontWeight: 'bold', textAlign: 'center', background: rowBg, cursor: 'pointer' }}
                        onClick={() => searchCarImage(item.model)}
                        title="Click to search car images on Google"
                      >{item.model}</td>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid #ffe082', textAlign: 'center', background: rowBg, cursor: 'pointer' }}
                        onClick={() => setSelectedSummaryModel({ model: item.model, filter: 'all' })}
                      >{item.total}</td>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid #ffe082', textAlign: 'center', background: '#e3f2fd', cursor: 'pointer' }}
                        onClick={() => setSelectedSummaryModel({ model: item.model, filter: 'invygo' })}
                      >{item.invygo}</td>
                      <td style={{ padding: '10px 8px', borderBottom: '1px solid #ffe082', textAlign: 'center', background: '#fffde7', cursor: 'pointer' }}
                        onClick={() => setSelectedSummaryModel({ model: item.model, filter: 'yelo' })}
                      >{item.yellow}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* جدول تفاصيل السيارات لموديل مختار في السامري */}
      {view === 'summary' && selectedSummaryModel && (
        <div style={{ marginTop: '32px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ fontWeight: 'bold', fontSize: '2rem', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px' }}>
            {selectedSummaryModel && (
              <>
                <span style={{ color: '#7b1fa2', fontWeight: 'bold' }}>{selectedSummaryModel.model}</span>
                <span style={{ color: '#222' }}>-</span>
                {selectedSummaryModel.filter === 'invygo' && colorizeInvygoYelo('Invygo Cars Details')}
                {selectedSummaryModel.filter === 'yelo' && colorizeInvygoYelo('YELO Cars Details')}
                {selectedSummaryModel.filter === 'all' && 'All Cars Details'}
                <span style={{ color: '#7b1fa2', marginLeft: 8 }}>
                  (
                  {selectedSummaryModel.filter === 'all'
                    ? data.filter(car => car.Model === selectedSummaryModel.model).length
                    : selectedSummaryModel.filter === 'invygo'
                      ? data.filter(car => car.Model === selectedSummaryModel.model && (car.Remarks || '').toUpperCase().includes('INVYGO')).length
                      : data.filter(car => car.Model === selectedSummaryModel.model && !(car.Remarks || '').toUpperCase().includes('INVYGO')).length
                  }
                  )
                </span>
              </>
            )}
            <button onClick={() => {
              // تصدير تفاصيل السامري
              let exportData = data.filter(car => {
                if (selectedSummaryModel.filter === 'all') return car.Model === selectedSummaryModel.model;
                if (selectedSummaryModel.filter === 'invygo') return car.Model === selectedSummaryModel.model && (car.Remarks || '').toUpperCase().includes('INVYGO');
                if (selectedSummaryModel.filter === 'yelo') return car.Model === selectedSummaryModel.model && !(car.Remarks || '').toUpperCase().includes('INVYGO');
                return false;
              });
              if (!exportData.length) return alert('لا يوجد بيانات للتصدير!');
              // اسم الملف من العنوان مع العدد
              let count = 0;
              if (selectedSummaryModel.filter === 'all') count = data.filter(car => car.Model === selectedSummaryModel.model).length;
              else if (selectedSummaryModel.filter === 'invygo') count = data.filter(car => car.Model === selectedSummaryModel.model && (car.Remarks || '').toUpperCase().includes('INVYGO')).length;
              else if (selectedSummaryModel.filter === 'yelo') count = data.filter(car => car.Model === selectedSummaryModel.model && !(car.Remarks || '').toUpperCase().includes('INVYGO')).length;
              let title = `${selectedSummaryModel.model} - `;
              if (selectedSummaryModel.filter === 'invygo') title += 'Invygo Cars';
              if (selectedSummaryModel.filter === 'yelo') title += 'YELO Cars';
              if (selectedSummaryModel.filter === 'all') title += 'All Cars';
              title += ` (${count})`;
              title = title.replace(/[^ -\w\d\-()]+/g, '_');
              const ws = XLSX.utils.json_to_sheet(exportData);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, 'Fleet Report');
              XLSX.writeFile(wb, `${title}_${new Date().toISOString().slice(0, 10)}.xlsx`);
            }} style={{ background: '#7b1fa2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 'bold', fontSize: '1.08rem', cursor: 'pointer', marginLeft: 18 }}>Export</button>
          </h2>
          <div style={{ width: '100%', maxWidth: '1100px', overflowX: 'auto' }}>
            <table style={{
              borderCollapse: 'collapse',
              width: '100%',
              background: '#fffde7',
              boxShadow: '0 2px 12px #b39ddb33',
              borderRadius: '16px',
              overflow: 'hidden',
              fontSize: '1.02rem',
              minWidth: '1100px'
            }}>
              <thead>
                <tr style={{ background: '#ffe082', color: '#222', fontWeight: 'bold' }}>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '32px' }}>#</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '70px' }}>Model</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '48px' }}>Year</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '60px' }}>Color</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '70px' }}>Plate No</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '70px' }}>Rental Rate</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '110px' }}>Chassis no.</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '70px' }}>Reg Exp</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '70px' }}>Insur Exp</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '90px' }}>Remarks</th>
                </tr>
                {/* صف الفلاتر لجدول تفاصيل الموديل */}
                <tr style={{ background: '#f5f5f5' }}>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <button 
                      onClick={clearDetailFilters}
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
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Model"
                      value={detailTableFilters.model}
                      onChange={(e) => updateDetailFilter('model', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Year"
                      value={detailTableFilters.year}
                      onChange={(e) => updateDetailFilter('year', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Color"
                      value={detailTableFilters.color}
                      onChange={(e) => updateDetailFilter('color', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Plate"
                      value={detailTableFilters.plateNo}
                      onChange={(e) => updateDetailFilter('plateNo', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Rate"
                      value={detailTableFilters.rentalRate}
                      onChange={(e) => updateDetailFilter('rentalRate', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Chassis"
                      value={detailTableFilters.chassisNo}
                      onChange={(e) => updateDetailFilter('chassisNo', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Reg"
                      value={detailTableFilters.regExp}
                      onChange={(e) => updateDetailFilter('regExp', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Insur"
                      value={detailTableFilters.insurExp}
                      onChange={(e) => updateDetailFilter('insurExp', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Remarks"
                      value={detailTableFilters.remarks}
                      onChange={(e) => updateDetailFilter('remarks', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                </tr>
              </thead>
              <tbody>
                {applyFilters(
                  (selectedSummaryModel && selectedSummaryModel.filter === 'all'
                    ? data.filter(car => car.Model === selectedSummaryModel.model)
                    : selectedSummaryModel && selectedSummaryModel.filter === 'invygo'
                      ? data.filter(car => car.Model === selectedSummaryModel.model && (car.Remarks || '').toUpperCase().includes('INVYGO'))
                      : selectedSummaryModel && selectedSummaryModel.filter === 'yelo'
                        ? data.filter(car => car.Model === selectedSummaryModel.model && !(car.Remarks || '').toUpperCase().includes('INVYGO'))
                        : []
                  ), detailTableFilters
                ).map((car, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f5f5f5', textAlign: 'center' }}>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', color: '#7b1fa2', fontWeight: 'bold' }}>
                      {colorizeInvygoYelo(car.Model)}
                      <span 
                        onClick={() => searchCarImage(car.Model, car["Year Model"] || car["Year"], car["Color"] || car[" color"] || car["COLOR"])}
                        style={{ marginLeft: '5px', cursor: 'pointer', fontSize: '0.8rem' }}
                        title="Search car image on Google"
                      >
                        🔍
                      </span>
                    </td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Year Model"] || car["Year"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Color"] || car[" color"] || car["COLOR"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Plate No"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Rental Rate"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Chassis no."] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Reg Exp"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Insur Exp"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{colorizeInvygoYelo(car.Remarks || '-')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => setSelectedSummaryModel(null)}
            style={{
              marginTop: '22px',
              color: '#d32f2f',
              background: 'none',
              border: 'none',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            ← Back to Summary
          </button>
        </div>
      )}

      {/* جدول تفاصيل الاكسبيري */}
      {showExpiryTable && (
        <div style={{ marginTop: '32px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ color: '#7b1fa2', fontWeight: 'bold', fontSize: '2rem', marginBottom: '18px' }}>
            Expiry Details ({expiryCount})
            {(() => {
              const cars = expiryFiltered || data.filter(car => {
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
              const invygoCount = cars.filter(car => (car.Remarks || '').toUpperCase().includes('INVYGO')).length;
              const yeloCount = cars.length - invygoCount;
              return (
                <span style={{ fontSize: '1.1rem', marginLeft: 12 }}>
                   {colorizeInvygoYelo('Invygo')}: {invygoCount} / {colorizeInvygoYelo('YELO')}: {yeloCount}
                </span>
              );
            })()}
          </h2>
          <div style={{ width: '100%', maxWidth: '1100px', overflowX: 'auto' }}>
            <table style={{
              borderCollapse: 'collapse',
              width: '100%',
              background: '#fffde7',
              boxShadow: '0 2px 12px #b39ddb33',
              borderRadius: '16px',
              overflow: 'hidden',
              fontSize: '1.02rem',
              minWidth: '1100px'
            }}>
              <thead>
                <tr style={{ background: '#ffe082', color: '#222', fontWeight: 'bold' }}>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '32px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>#</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '70px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Model</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '48px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Year</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '60px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Color</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '70px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Plate No</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '70px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Rental Rate</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '110px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Chassis no.</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '70px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Reg Exp</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '70px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Insur Exp</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '90px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Remarks</th>
                </tr>
                {/* صف الفلاتر لجدول Expiry */}
                <tr style={{ background: '#f5f5f5' }}>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <button 
                      onClick={clearExpiryFilters}
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
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Model"
                      value={expiryTableFilters.model}
                      onChange={(e) => updateExpiryFilter('model', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Year"
                      value={expiryTableFilters.year}
                      onChange={(e) => updateExpiryFilter('year', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Color"
                      value={expiryTableFilters.color}
                      onChange={(e) => updateExpiryFilter('color', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Plate"
                      value={expiryTableFilters.plateNo}
                      onChange={(e) => updateExpiryFilter('plateNo', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Rate"
                      value={expiryTableFilters.rentalRate}
                      onChange={(e) => updateExpiryFilter('rentalRate', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Chassis"
                      value={expiryTableFilters.chassisNo}
                      onChange={(e) => updateExpiryFilter('chassisNo', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Reg"
                      value={expiryTableFilters.regExp}
                      onChange={(e) => updateExpiryFilter('regExp', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Insur"
                      value={expiryTableFilters.insurExp}
                      onChange={(e) => updateExpiryFilter('insurExp', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Remarks"
                      value={expiryTableFilters.remarks}
                      onChange={(e) => updateExpiryFilter('remarks', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                </tr>
              </thead>
              <tbody>
                {applyFilters((expiryFiltered || data.filter(car => {
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
                })), expiryTableFilters).map((car, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f5f5f5', textAlign: 'center' }}>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i + 1}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', color: '#7b1fa2', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{colorizeInvygoYelo(car.Model)}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car["Year Model"] || car["Year"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car["Color"] || car[" color"] || car["COLOR"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car["Plate No"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car["Rental Rate"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car["Chassis no."] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car["Reg Exp"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car["Insur Exp"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{colorizeInvygoYelo(car.Remarks || '-')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => setShowExpiryTable(false)}
            style={{ marginTop: '22px', color: '#d32f2f', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
          >
            ← Back
          </button>
        </div>
      )}

      {expiryDateResult && (
        <div style={{ marginTop: '32px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ color: '#7b1fa2', fontWeight: 'bold', fontSize: '2rem', marginBottom: '18px' }}>
            Expiry Details ({expiryDateResult.cars.length})
            {(() => {
              const invygoCount = expiryDateResult.cars.filter(car => (car.Remarks || '').toUpperCase().includes('INVYGO')).length;
              const yeloCount = expiryDateResult.cars.length - invygoCount;
              return (
                <span style={{ fontSize: '1.1rem', marginLeft: 12 }}>
                  | {colorizeInvygoYelo('Invygo')}: {invygoCount} | {colorizeInvygoYelo('YELO')}: {yeloCount}
                </span>
              );
            })()}
          </h2>
          <div style={{ width: '100%', maxWidth: '1100px', overflowX: 'auto' }}>
            <table style={{
              borderCollapse: 'collapse',
              width: '100%',
              background: '#fffde7',
              boxShadow: '0 2px 12px #b39ddb33',
              borderRadius: '16px',
              overflow: 'hidden',
              fontSize: '1.02rem',
              minWidth: '1100px'
            }}>
              <thead>
                <tr style={{ background: '#ffe082', color: '#222', fontWeight: 'bold' }}>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '32px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>#</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '70px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Model</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '48px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Year</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '60px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Color</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '70px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Plate No</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '70px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Rental Rate</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '110px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Chassis no.</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '70px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Reg Exp</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '70px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Insur Exp</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '90px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {expiryDateResult.cars.map((car, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f5f5f5', textAlign: 'center' }}>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i + 1}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', color: '#7b1fa2', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {colorizeInvygoYelo(car.Model)}
                      <span 
                        onClick={() => searchCarImage(car.Model, car["Year Model"] || car["Year"], car["Color"] || car[" color"] || car["COLOR"])}
                        style={{ marginLeft: '5px', cursor: 'pointer', fontSize: '0.8rem' }}
                        title="Search car image on Google"
                      >
                        🔍
                      </span>
                    </td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car["Year Model"] || car["Year"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car["Color"] || car[" color"] || car["COLOR"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car["Plate No"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car["Rental Rate"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car["Chassis no."] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car["Reg Exp"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car["Insur Exp"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{colorizeInvygoYelo(car.Remarks || '-')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => setExpiryModalTable(null)}
            style={{ marginTop: '22px', color: '#d32f2f', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
          >
            ← Back
          </button>
        </div>
      )}

      {/* جدول تفاصيل الكارت المختار */}
      {showSummaryDetail && (
        <div style={{ marginTop: '32px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ fontWeight: 'bold', fontSize: '2rem', marginBottom: '18px' }}>
            {showSummaryDetail === 'total' && `All Cars Details (${summaryAll.total})`}
            {showSummaryDetail === 'invygo' && colorizeInvygoYelo(`Invygo Cars Details (${summaryAll.invygo})`)}
            {showSummaryDetail === 'yelo' && colorizeInvygoYelo(`YELO Cars Details (${summaryAll.total - summaryAll.invygo})`)}
          </h2>
          <div style={{ width: '100%', maxWidth: '1100px', overflowX: 'auto' }}>
            <table style={{
              borderCollapse: 'collapse',
              width: '100%',
              background: '#fffde7',
              boxShadow: '0 2px 12px #b39ddb33',
              borderRadius: '16px',
              overflow: 'hidden',
              fontSize: '1.02rem',
              minWidth: '1100px'
            }}>
              <thead>
                <tr style={{ background: '#ffe082', color: '#222', fontWeight: 'bold' }}>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '32px' }}>#</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '70px' }}>Model</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '48px' }}>Year</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '60px' }}>Color</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '70px' }}>Plate No</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '70px' }}>Rental Rate</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '110px' }}>Chassis no.</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '70px' }}>Reg Exp</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '70px' }}>Insur Exp</th>
                  <th style={{ padding: '6px 2px', borderBottom: '2px solid #ffe082', textAlign: 'center', width: '90px' }}>Remarks</th>
                </tr>
                {/* صف الفلاتر لجدول تفاصيل الكروت */}
                <tr style={{ background: '#f5f5f5' }}>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <button 
                      onClick={clearDetailFilters}
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
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Model"
                      value={detailTableFilters.model}
                      onChange={(e) => updateDetailFilter('model', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Year"
                      value={detailTableFilters.year}
                      onChange={(e) => updateDetailFilter('year', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Color"
                      value={detailTableFilters.color}
                      onChange={(e) => updateDetailFilter('color', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Plate"
                      value={detailTableFilters.plateNo}
                      onChange={(e) => updateDetailFilter('plateNo', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Rate"
                      value={detailTableFilters.rentalRate}
                      onChange={(e) => updateDetailFilter('rentalRate', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Chassis"
                      value={detailTableFilters.chassisNo}
                      onChange={(e) => updateDetailFilter('chassisNo', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Reg"
                      value={detailTableFilters.regExp}
                      onChange={(e) => updateDetailFilter('regExp', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Insur"
                      value={detailTableFilters.insurExp}
                      onChange={(e) => updateDetailFilter('insurExp', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>
                    <input
                      type="text"
                      placeholder="Filter Remarks"
                      value={detailTableFilters.remarks}
                      onChange={(e) => updateDetailFilter('remarks', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px',
                        fontSize: '0.8rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                </tr>
              </thead>
              <tbody>
                {applyFilters(
                  (showSummaryDetail === 'total'
                    ? data
                    : showSummaryDetail === 'invygo'
                      ? data.filter(car => (car.Remarks || '').toUpperCase().includes('INVYGO'))
                      : data.filter(car => !(car.Remarks || '').toUpperCase().includes('INVYGO'))
                  ), detailTableFilters
                ).map((car, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f5f5f5' }}>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center', color: '#7b1fa2', fontWeight: 'bold' }}>
                      {colorizeInvygoYelo(car.Model)}
                      <span 
                        onClick={() => searchCarImage(car.Model, car["Year Model"] || car["Year"])}
                        style={{ marginLeft: '5px', cursor: 'pointer', fontSize: '0.8rem' }}
                        title="Search car image on Google"
                      >
                        🔍
                      </span>
                    </td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Year Model"] || car["Year"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Color"] || car[" color"] || car["COLOR"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Plate No"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Rental Rate"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Chassis no."] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Reg Exp"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{car["Insur Exp"] || '-'}</td>
                    <td style={{ padding: '6px 2px', borderBottom: '1px solid #ffe082', textAlign: 'center' }}>{colorizeInvygoYelo(car.Remarks || '-')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => setShowSummaryDetail(null)}
            style={{
              marginTop: '22px',
              color: '#d32f2f',
              background: 'none',
              border: 'none',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            ← Back to Summary
          </button>
        </div>
      )}

      {/* زر Top في كل الصفحات */}
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
          onClick={() => {
            setFiltered([]);
            setShowFiltered(false);
            setExpiryDateResult(null);
            setShowExpiryDateDetails(false);
            setExpiryModalTable(null);
            setShowExpiryTable(false);
            setExpiryFiltered(null);
          }}
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


