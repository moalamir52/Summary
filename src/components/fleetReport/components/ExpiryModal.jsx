import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

const ExpiryModal = ({
  expiryModalOpen,
  setExpiryModalOpen,
  expiryDate,
  setExpiryDate,
  data,
  setExpiryDateResult,
  setShowExpiryDateDetails,
  setExpiryModalTable,
  setShowExpiryTable,
  setExpiryFiltered,
  setView,
  setFiltered,
  setShowFiltered
}) => {
  const handleExpirySearch = () => {
    if (!expiryDate) {
      alert('يرجى اختيار تاريخ');
      return;
    }
    
    const targetDate = new Date(expiryDate);
    const expiredCars = data.filter(car => {
      const exp = car.RegExp || car["Reg Exp"];
      if (!exp) return false;
      
      let d;
      if (typeof exp === "string" && exp.includes("-")) {
        d = new Date(exp);
      } else if (typeof exp === "string" && exp.includes("/")) {
        const [day, mon, yr] = exp.split("/");
        d = new Date(`${yr}-${mon}-${day}`);
      } else if (exp instanceof Date) {
        d = exp;
      } else {
        return false;
      }
      
      return d <= targetDate;
    });

    setExpiryDateResult({ cars: expiredCars, date: expiryDate });
    setShowExpiryDateDetails(true);
    setExpiryModalTable(expiredCars);
    setShowExpiryTable(false);
    setExpiryFiltered(null);
    setView('search');
    setFiltered([]);
    setShowFiltered(false);
    setExpiryModalOpen(false);
  };

  return (
    <Modal open={expiryModalOpen} onClose={() => setExpiryModalOpen(false)}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2
      }}>
        <h2 style={{ marginBottom: '20px', color: '#7b1fa2' }}>البحث عن السيارات المنتهية الصلاحية</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            اختر التاريخ:
          </label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setExpiryModalOpen(false)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            إلغاء
          </button>
          <button
            onClick={handleExpirySearch}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            بحث
          </button>
        </div>
      </Box>
    </Modal>
  );
};

export default ExpiryModal;