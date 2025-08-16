import { useState } from 'react';

export const useView = () => {
  const [view, setView] = useState('search');
  const [showSummaryCards, setShowSummaryCards] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [showSummaryDetail, setShowSummaryDetail] = useState(null);

  const switchView = (newView) => {
    setView(newView);
    // إعادة تعيين الحالات عند تغيير العرض
    if (newView !== 'summary') {
      setShowSummaryCards(false);
      setShowSummaryDetail(null);
    }
  };

  return {
    view,
    setView,
    showSummaryCards,
    setShowSummaryCards,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    showSummaryDetail,
    setShowSummaryDetail,
    switchView
  };
};