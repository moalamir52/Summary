// 🎨 دالة تلوين النصوص - تحويل INVYGO و YELO لألوان مميزة
export const colorizeInvygoYelo = (text) => {
  if (!text) return text;
  const str = String(text);
  if (str.toUpperCase().includes('INVYGO')) {
    return <span style={{ color: '#1976d2', fontWeight: 'bold' }}>INVYGO</span>;
  }
  if (str.toUpperCase().includes('YELO')) {
    return <span style={{ color: '#ffb300', fontWeight: 'bold' }}>{str}</span>;
  }
  return str;
};

// 🔍 دالة البحث عن صور السيارات في جوجل
export const searchCarImage = (model, year, color) => {
  const searchQuery = `${model} ${year || ''} ${color || ''} car`.trim();
  const googleImageUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(searchQuery)}`;
  window.open(googleImageUrl, '_blank');
};

export const formatDate = (value) => {
    if (typeof value === "number" && value > 10000) {
      return XLSX.SSF.format("yyyy-mm-dd", value);
    }
    return value;
  };

  export const average = (arr) => {
    const valid = arr.filter(n => !isNaN(n));
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
  };
