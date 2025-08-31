import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

const ExpiryModal = ({ expiryModalOpen, setExpiryModalOpen, expiryDate, setExpiryDate, handleExpiryDateSearch }) => {
  return (
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
              handleExpiryDateSearch();
            }
          }}
          style={{ padding: '8px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', marginBottom: 18 }}
          max={new Date().toISOString().slice(0, 10)}
        />
        <button
          onClick={() => {
            if (!expiryDate) return;
            handleExpiryDateSearch();
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
  );
};

export default ExpiryModal;
