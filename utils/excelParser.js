// const XLSX = require('xlsx');
// exports.parseExcel = buffer => {
//   const wb = XLSX.read(buffer, { type: 'buffer' });
//   const ws = wb.Sheets[wb.SheetNames[0]];
//   const data = XLSX.utils.sheet_to_json(ws);
//   return data.map(r => ({ email: r.email, data: r }));
// };
