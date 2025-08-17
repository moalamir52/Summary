import './App.css';
import React from 'react';
import FleetReportFinalFull from './components/FleetReportFinalFull';

export default function App() {
  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <FleetReportFinalFull />
    </div>
  );
}