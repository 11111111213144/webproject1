const pool = require('./src/models/mysqlpool').pool;

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