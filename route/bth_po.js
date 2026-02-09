const express = require('express');
require('dotenv').config();
const router = express.Router();

const bodyParser = require('body-parser');
const path = require('path')
const pool = require('../database/mysqlpool');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookie = require('cookie-parser');
const { isAuthenticated, isAdmin, isMember } = require('./auth');

router.use(cookie());

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


router.get('/makepo', isAuthenticated, (req, res) => {
    pool.query('SELECT * FROM po_header', (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving po_header data');
        } else {
            res.render('makepo', { po: results });
        }
    });
});

router.post('/deletepo', isAuthenticated, isMember, (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid or empty IDs array' });
    }

    const placeholders = ids.map(() => '?').join(',');
    const query = `DELETE FROM po_header WHERE po_Id IN (${placeholders})`;

    pool.query(query, ids, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Error deleting records' });
        }
        res.json({ success: true, message: 'Records deleted successfully' });
    });
});


router.get('/po_add', isAuthenticated, isMember, (req, res) => {
    pool.query('SELECT * FROM po_header', (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving po_header data');
        }
        res.render('create_po', { po: results });
    });
});

// Add new PO
router.post('/addpo', isAuthenticated, isMember, (req, res) => {
    const { po_number, supplier_name, po_date } = req.body;
    const sql = 'INSERT INTO po_header (po_number, supplier_name, po_date) VALUES (?, ?, ?)';
    pool.query(sql, [po_number, supplier_name, po_date], (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect('/po_add?msg=' + encodeURIComponent('เกิดข้อผิดพลาดในการเพิ่มใบสั่งซื้อ'));
        }
        res.redirect('/po_add?msg=' + encodeURIComponent('เพิ่มใบสั่งซื้อสำเร็จ'));
    });
});

module.exports = router;