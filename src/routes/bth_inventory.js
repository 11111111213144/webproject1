const express = require('express');

const router = express.Router();

const bodyParser = require('body-parser');
const path = require('path')

const { pool, total_inventory, total_money, total_plan, total_po, all_user } = require('../models/mysqlpool');

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookie = require('cookie-parser');
const { isAuthenticated, isAdmin, isMember } = require('./auth');

router.use(cookie());

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/dev_mem', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const [users] = await all_user();
        res.render('admin/dev_mem', { all_user: users });
    } catch (err) {
        console.error('Dev_mem error:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/deleteuser', isAuthenticated, isAdmin, async (req, res) => {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
        return res.redirect('/dev_mem');
    }
    pool.query('DELETE FROM User WHERE userId IN (?)', [ids], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error deleting users');
        }
        res.json({ success: true });
    });
});

router.get('/inventory', isAuthenticated, (req, res) => {
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
        res.render('user/inventory/index', { inventory: result, msg: msg, type: type });
    });
});


// ทุกคนที่ login ได้เพิ่มข้อมูล
router.get('/createitem', isAuthenticated, isMember, (req, res) => {
    const msg = req.query.msg || null;
    res.render('user/inventory/add', { msg: msg });
});

router.post('/createitem', isAuthenticated, isMember, (req, res) => {
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

router.post('/deleteitem', isAuthenticated, isMember, (req, res) => {
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

router.get('/item_edits', isAuthenticated, isMember, (req, res) => {
    const msg = req.query.msg || null;
    const item_Id = req.query.item_Id;
    pool.query('SELECT * FROM inventory WHERE item_Id = ?', [item_Id], (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect('/inventory');
        }
        res.render('user/inventory/edit', { inventory: result[0], msg: msg });
    });
});

router.post('/edititem', isAuthenticated, isMember, (req, res) => {
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