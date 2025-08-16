import * as XLSX from 'xlsx';

export const handleExport = (
  showSummaryDetail,
  data,
  expiryDateResult,
  showExpiryTable,
  expiryFiltered,
  showFiltered,
  filtered
) => {
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