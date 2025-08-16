import { useState } from 'react';

export const useExpiry = () => {
  const [expiryModalOpen, setExpiryModalOpen] = useState(false);
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [expiryCount, setExpiryCount] = useState(0);
  const [expiryFiltered, setExpiryFiltered] = useState(null);
  const [showExpiryTable, setShowExpiryTable] = useState(false);
  const [expiryModalTable, setExpiryModalTable] = useState(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryDateResult, setExpiryDateResult] = useState(null);
  const [showExpiryDateDetails, setShowExpiryDateDetails] = useState(false);

  const getExpiredCars = (data, filterDate = null) => {
    return data.filter(car => {
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
      
      const compareDate = filterDate ? new Date(filterDate) : new Date();
      return d <= compareDate;
    });
  };

  return {
    expiryModalOpen,
    setExpiryModalOpen,
    expiryMonth,
    setExpiryMonth,
    expiryYear,
    setExpiryYear,
    expiryCount,
    setExpiryCount,
    expiryFiltered,
    setExpiryFiltered,
    showExpiryTable,
    setShowExpiryTable,
    expiryModalTable,
    setExpiryModalTable,
    expiryDate,
    setExpiryDate,
    expiryDateResult,
    setExpiryDateResult,
    showExpiryDateDetails,
    setShowExpiryDateDetails,
    getExpiredCars
  };
};