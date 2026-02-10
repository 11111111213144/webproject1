require('dotenv').config({ path: '.env' });

const mysql = require('mysql2');

console.log('Environment Variables:');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD : 'undefined');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306
});

connection.connect((err) => {
  if (err) {
    console.error('Connection error:', err);
    return;
  }
  console.log('Connected to MySQL successfully!');
  
  connection.query('SELECT COUNT(*) as count FROM user', (err, results) => {
    if (err) {
      console.error('Query error:', err);
    } else {
      console.log('Users count:', results[0].count);
      
      // Test with specific user
      connection.query('SELECT * FROM user WHERE userName = ?', ['joe2'], (err, userResults) => {
        if (err) {
          console.error('User query error:', err);
        } else {
          console.log('Found user joe2:', userResults.length > 0 ? userResults[0] : 'Not found');
        }
        connection.end();
      });
    }
  });
});