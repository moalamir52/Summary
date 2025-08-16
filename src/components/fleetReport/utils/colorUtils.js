import React from 'react';

export const colorizeInvygoYelo = (text) => {
  if (!text) return '';
  
  // إذا كان النص فيه INVYGO COMMITTED أو مشابه، أرجع فقط كلمة INVYGO ملونة
  if (/invygocommitted|invygo committed/i.test(String(text).replace(/\s+/g, ''))) {
    return <span style={{ color: '#1976d2', fontWeight: 'bold' }}>INVYGO</span>;
  }
  
  return String(text).split(/(Invygo|INVYGO|YELO)/i).map((part, idx) => {
    if (/^Invygo$/i.test(part)) return <span key={idx} style={{ color: '#1976d2', fontWeight: 'bold' }}>{part}</span>;
    if (/^YELO$/i.test(part)) return <span key={idx} style={{ color: '#fbc02d', fontWeight: 'bold' }}>{part}</span>;
    return part;
  });
};