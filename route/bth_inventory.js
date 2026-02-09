const express = require('express');
require('dotenv').config();
const router = express.Router();

const bodyParser = require('body-parser');
const path = require('path')
const pool = require('../database/mysqlpool');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookie = require('cookie-parser');

router.use(cookie());

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());



router.get('/inventory', (req, res) => {
    const msg = req.query.msg || null;
    const type = req.query.type || 'all';

    let sql = 'SELECT * ,(remain*unit_price) as total_price FROM inventory';
    let params = [];

    if (type !== 'all') {
        sql += ' WHERE item_type LIKE ?';
        params.push(type + '%');
    }

    pool.query(sql, params, (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect('/');
        }
        res.render('inventory', { inventory: result, msg: msg, type: type });
    });
});


router.get('/createitem', (req, res) => {
    const msg = req.query.msg || null;
    res.render('createitem', { msg: msg });
});

router.post('/createitem', (req, res) => {
    const { item_name, item_type, unit_price, unit, remain, Company_shop } = req.body;
    pool.query('INSERT INTO inventory (item_name, item_type, unit_price, unit, remain, Company_shop) VALUES (?, ?, ?, ?, ?, ?)', [item_name, item_type, unit_price, unit, remain, Company_shop], (err, result) => {
        if (err) {
            if (err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
                return res.redirect('/createitem?msg=' + encodeURIComponent('เกิดข้อผิดพลาดในการเพิ่มข้อมูล'));
            }
            console.log(err);
            return res.redirect('/inventory?msg=' + encodeURIComponent('เกิดข้อผิดพลาดในการเพิ่มข้อมูล'));
        }
        res.redirect('/inventory?msg=' + encodeURIComponent('เพิ่มข้อมูลสำเร็จ'));
    });
});

router.post('/deleteitem', (req, res) => {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
        return res.redirect('/inventory');
    }
    pool.query('DELETE FROM inventory WHERE item_Id IN (?)', [ids], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error deleting items');
        }
        res.json({ success: true });
    });
});

router.get('/edititem', (req, res) => {
    const msg = req.query.msg || null;
    const item_Id = req.query.item_Id;
    pool.query('SELECT * FROM inventory WHERE item_Id = ?', [item_Id], (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect('/inventory');
        }
        res.render('item_edits', { inventory: result[0], msg: msg });
    });
});

router.post('/edititem', (req, res) => {
    const { item_Id, item_name, item_type, unit_price, unit, remain, Company_shop } = req.body;
    pool.query('UPDATE inventory SET item_name = ?, item_type = ?, unit_price = ?, unit = ?, remain = ?, Company_shop = ? WHERE item_Id = ?', [item_name, item_type, unit_price, unit, remain, Company_shop, item_Id], (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect('/inventory');
        }
        res.redirect('/inventory');
    });
});


module.exports = router;