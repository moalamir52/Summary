import { useEffect } from 'react';
import * as XLSX from 'xlsx';

export const useGoogleSheets = (setData, analyze, onDataLoaded) => {
  const formatDate = (value) => {
    if (typeof value === "number" && value > 10000) {
      return XLSX.SSF.format("yyyy-mm-dd", value);
    }
    return value;
  };

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
      analyze(cleaned);
      if (typeof onDataLoaded === "function") onDataLoaded(cleaned);
    } catch (err) {
      alert("Error fetching data from Google Sheets");
    }
  };

  useEffect(() => {
    fetchFromGoogleSheet();
  }, []);

  return { fetchFromGoogleSheet };
};