const pool = require('./src/models/mysqlpool').pool;
require('dotenv').config({ path: '.env' });

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'undefined');

pool.query('SELECT COUNT(*) as count FROM user', (err, results) => {
  if (err) {
    console.log('Database Error:', err);
  } else {
    console.log('Database OK - Users count:', results[0].count);
    // Show sample users
    pool.query('SELECT userName, role FROM user LIMIT 3', (err2, users) => {
      if (err2) {
        console.log('Error getting users:', err2);
      } else {
        console.log('Sample users:', users);
      }
      pool.end();
    });
  }
});