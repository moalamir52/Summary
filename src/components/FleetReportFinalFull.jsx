// ✅ Fleet Report — YELO Themed with Header, Home Button, and Full UI

import React, { useState, useRef } from "react";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import * as XLSX from "xlsx"

export default function FleetReportFinalFull({ enableSmartSearch, onDataLoaded }) {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [summary, setSummary] = useState(null);
  const [modelSummary, setModelSummary] = useState([]);
  const [showModelSummary, setShowModelSummary] = useState(false);
  const [showSmart, setShowSmart] = useState(false);
  const [showFiltered, setShowFiltered] = useState(false);
  const [showSummaryCards, setShowSummaryCards] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

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

  const handleExport = () => {
    if (!filtered.length) return alert("No data to export!");
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fleet Report");
    XLSX.writeFile(wb, `Fleet_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleSearch = () => {
  const keyword = searchTerm.toLowerCase().trim();
  if (!keyword) return;

  const results = data.filter(row => {
    const combined = [
      row["Plate No"],
      row.Model,
      row.Class,
      row.Color,
      row.Remarks
    ]
      .map(val => String(val || "").toLowerCase())
      .join(" ");
    return combined.includes(keyword);
  });

  setFiltered(results);
  setShowFiltered(true);
  setShowSummaryCards(true);
  const total = results.length;
  const invygo = results.filter(r => r.isInvygo).length;
  setSummary({ total, invygo });
};


  const yellowOnly = summary ? summary.total - summary.invygo : 0;

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
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
  <img src="/logo.png" alt="YELO Logo" style={{ height: '50px', marginBottom: '10px' }} />
  <h1 style={{ fontSize: '38px', margin: '0', color: '#6a1b9a' }}>YELO Fleet Report</h1>
  <p style={{ fontSize: '16px', marginTop: '6px', color: '#7b1fa2' }}>
    Smart fleet insight powered by future AI intelligence 🚗
  </p>
</header>


      <div style={{ marginTop: '15px',
          padding: '15px 15px',
          borderRadius: '6px',
          background: '#fdd835',
          color: '#000',
          textDecoration: 'true',
          fontWeight: 'bold',
          fontSize: '16px',
          boxShadow: '0 2px 6px rgb(105, 32, 241)'}}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />
          <input
  type="text"
  placeholder="Search..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
/>
          <button onClick={handleSearch}>Search</button>
          <button onClick={() => setShowSmart(!showSmart)}>Smart</button>
          <button onClick={() => setShowModelSummary(!showModelSummary)}>Summary</button>
          <button onClick={() => {
            setFiltered([]);
            setShowFiltered(false);
            setSummary(null);
            setShowSummaryCards(false);
          }}>Reset</button>
          <button onClick={handleExport}>Export</button>
        </div>
      </div>

      {/* ✅ Cards Summary */}
      {showSummaryCards && summary && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="modal-card"><strong>Total Cars:</strong> {summary.total}</div>
          <div className="modal-card"><strong>Invygo Cars:</strong> {summary.invygo}</div>
          <div className="modal-card"><strong>YELO Cars:</strong> {yellowOnly}</div>
        </div>
      )}

      {/* ✅ Filtered Results */}
      {showFiltered && filtered.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>🔍 Search Results</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {filtered.map((car, index) => (
              <div key={index} className="modal-card">
                <strong>🚗 {car.Model}</strong>
                <p>Plate: {car["Plate No"]}</p>
                <p>Class: {car.Class}</p>
                <p>Color: {car.Color}</p>
                <p>Year: {car["Year Model"]}</p>
                <p>Reg: {car.RegDate}</p>
                <p>Exp: {car.ExpDate}</p>
                <p>Mortgage: {car.Mortgage}</p>
                <p>Remarks: {car.Remarks}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ Smart Summary */}
      {showSmart && data.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '20px' }}>
          {['Class', 'Color', 'Year Model', 'Mortgage'].map((key) => {
            const unique = Array.from(new Set(data.map(car => car[key]))).filter(Boolean);
            return (
              <div key={key} className="modal-card">
                <h3>🔍 {key}</h3>
                <ul>
                  {unique.map(value => (
                    <li key={value} style={{ cursor: 'pointer' }} onClick={() => {
                      const related = data.filter(car => car[key] === value);
                      const details = related.map(car => ({
                        model: car.Model,
                        class: car.Class,
                        color: car.Color,
                        plate: car['Plate No'],
                        invygo: car.isInvygo ? 'Invygo' : 'YELO'
                      }));
                      setModalContent({ details });
                      setModalOpen(true);
                    }}>{value} → {data.filter(car => car[key] === value).length} cars</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ Model Summary Table */}
      {showModelSummary && modelSummary.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2>📦 Cars per Model Summary</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ background: '#f2f2f2' }}>
                <th>Model</th>
                <th>Total</th>
                <th>Invygo</th>
                <th>YELO</th>
                <th>Daily</th>
                <th>Monthly</th>
                <th>Yearly</th>
              </tr>
            </thead>
            <tbody>
              {modelSummary.map(item => (
                <tr key={item.model} style={{ borderBottom: '1px solid #ddd', cursor: 'pointer' }} onClick={() => {
                  const match = data.filter(d => d.Model === item.model);
                  const details = match.map(c => ({
                    model: c.Model,
                    class: c.Class,
                    color: c.Color,
                    plate: c['Plate No'],
                    invygo: c.isInvygo ? 'Invygo' : 'YELO'
                  }));
                  setModalContent({ details });
                  setModalOpen(true);
                }}>
                  <td>{item.model}</td>
                  <td>{item.total}</td>
                  <td>{item.invygo}</td>
                  <td>{item.yellow}</td>
                  <td>{item.daily}</td>
                  <td>{item.monthly}</td>
                  <td>{item.yearly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80vw', maxHeight: '80vh', overflowY: 'auto', bgcolor: 'background.paper', border: '1px solid #ccc', boxShadow: 6, p: 4, borderRadius: 3 }}>
          <h2>Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {modalContent?.details?.map((car, i) => (
              <div key={i} className="modal-card">
                <div><strong>Model:</strong> {car.model}</div>
                <div><strong>Class:</strong> {car.class}</div>
                <div><strong>Color:</strong> {car.color}</div>
                <div><strong>Plate:</strong> {car.plate}</div>
                <div><strong>Type:</strong> {car.invygo}</div>
              </div>
            ))}
          </div>
          <button style={{ marginTop: '20px' }} onClick={() => setModalOpen(false)}>Close</button>
        </Box>
      </Modal>
    </div>
  );
}
