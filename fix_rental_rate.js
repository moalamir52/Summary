// Script to remove all Rental Rate columns from expiry tables
const fs = require('fs');

const filePath = 'd:\\project\\Summary\\src\\components\\FleetReportFinalFull.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Remove all Rental Rate headers
content = content.replace(/<th[^>]*>Rental Rate<\/th>/g, '');

// Remove all Rental Rate filter inputs
content = content.replace(/<input[^>]*placeholder="Filter Rate"[^>]*\/>/g, '');

// Remove all Rental Rate data cells
content = content.replace(/<td[^>]*>\{car\["Rental Rate"\][^}]*\}<\/td>/g, '');

fs.writeFileSync(filePath, content);
console.log('Rental Rate columns removed successfully');