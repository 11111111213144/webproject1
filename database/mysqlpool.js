const mysql = require('mysql2');
require('dotenv').config();

// Create a MySQL connection pool
const pool = mysql.createPool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 3306,
});

async function total_inventory() {
    const query = 'SELECT COUNT(*) as total FROM inventory';
    return pool.promise().query(query);
}

async function total_money() {
    const query = 'SELECT SUM(remain * unit_price) AS total FROM inventory';
    return pool.promise().query(query);
}

async function total_plan() {
    const query = 'SELECT COUNT(*) AS total FROM plan_header';
    return pool.promise().query(query);
}

async function total_po() {
    const query = 'SELECT COUNT(*) AS total FROM po_header'
    return pool.promise().query(query);
}

async function all_user() {
    const query = 'SELECT * FROM User'
    return pool.promise().query(query);
}

async function delete_user(user_id) {
    const query = 'DELETE FROM User WHERE userId = ?'
    return pool.promise().query(query, [user_id]);
}

module.exports = {
    pool,
    total_inventory,
    total_money,
    total_plan,
    total_po,
    all_user
};