require('dotenv').config();
const mongoose = require('mongoose');
console.log('Attempting connection...');
const start = Date.now();
mongoose.connect(process.env.DB_URI, { serverSelectionTimeoutMS: 15000 })
  .then(() => { console.log('CONNECTED in', Date.now()-start, 'ms'); process.exit(0); })
  .catch((err) => { console.log('ERROR after', Date.now()-start, 'ms:', err.message); process.exit(1); });
