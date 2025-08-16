import { useState } from 'react';
import * as XLSX from 'xlsx';

export const useFleetData = (onDataLoaded) => {
  const [data, setData] = useState([]);
  const [summaryAll, setSummaryAll] = useState(null);
  const [modelSummaryAll, setModelSummaryAll] = useState([]);

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

    setSummaryAll({ total, invygo });
    setModelSummaryAll(modelSummaryData);
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
        RegExp: formatDate(r["Reg Exp"]),
        InsurExp: formatDate(r["Insur Exp"]),
        SaleDate: formatDate(r["Sale Date"]),
        Remarks: String(r.Remarks || "").toUpperCase(),
        isInvygo: String(r.Remarks || "").toUpperCase().includes("INVYGO")
      }));
      
      setData(cleaned);
      analyze(cleaned);
      if (typeof onDataLoaded === "function") onDataLoaded(cleaned);
    };
    reader.readAsArrayBuffer(file);
  };

  return {
    data,
    summaryAll,
    modelSummaryAll,
    handleFileUpload,
    setData,
    setSummaryAll,
    setModelSummaryAll
  };
};