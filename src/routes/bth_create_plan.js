const express = require('express');
require('dotenv').config();
const router = express.Router();

const bodyParser = require('body-parser');
const path = require('path')
const { pool } = require('../models/mysqlpool');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookie = require('cookie-parser');
const { url } = require('inspector');
const { isAuthenticated, isAdmin, isMember } = require('./auth');

router.use(cookie());

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/createplan', isAuthenticated, (req, res) => {
    const msg = req.query.msg || null;
    const sqlPlan = `
        SELECT 
            h.plan_Id,
            h.plan_name,
            h.plan_date,
            h.item_plan,
            i.item_type,
            i.item_name,
            h.plan_status 
        FROM Plan_Header h 
        LEFT JOIN Plan_Detail d ON h.plan_Id = d.plan_Id 
        LEFT JOIN Inventory i ON d.item_Id = i.item_Id
        GROUP BY h.plan_Id
    `;
    pool.query(sqlPlan, (err, allPlan) => {
        if (err) {
            console.log('Error fetching plan:', err.message);
            allPlan = [];
        }
        res.render('../views/user/plan/index', { plan: allPlan, msg: msg });
    });
});

router.get('/plan_detail', isAuthenticated, (req, res) => {
    const sql = `
        SELECT 
            h.plan_Id,
            h.plan_name,
            h.plan_date,
            h.item_plan,
            i.item_type,
            i.item_name,
            h.plan_status 
        FROM Plan_Header h 
        LEFT JOIN Plan_Detail d ON h.plan_Id = d.plan_Id 
        LEFT JOIN Inventory i ON d.item_Id = i.item_Id
        GROUP BY h.plan_Id
    `;
    pool.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect('/homepage');
        }
        res.render('user/plan/detail', { plan: result });
    });
});

router.post('/addplan', isAuthenticated, isMember, (req, res) => {
    const { plan_name, plan_date, item_plan } = req.body;
    const sql = 'INSERT INTO plan_header (plan_name, plan_date, item_plan) VALUES (?, ?, ?)';
    pool.query(sql, [plan_name, plan_date, item_plan], (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect('/createplan?msg=' + encodeURIComponent('Error adding plan'));
        }
        res.redirect('/createplan?msg=' + encodeURIComponent('Plan added successfully'));
    });
})

router.post('/deleteplan', isAuthenticated, isMember, (req, res) => {
    const { ids } = req.body;
    if (!ids || ids.length === 0) {
        return res.redirect('/createplan');
    }
    pool.query('DELETE FROM Plan_Header WHERE plan_Id IN (?)', [ids], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error deleting plans');
        }
        res.json({ success: true });
    });
});

router.get('/admin_main', isAuthenticated, isAdmin, (req, res) => {
    const msg = req.query.msg || null;
    // Query plans
    pool.query('SELECT * FROM plan_header ORDER BY plan_date DESC', (err, plans) => {
        if (err) {
            console.log(err);
            plans = [];
        }
        // Query POs
        pool.query('SELECT * FROM po_header ORDER BY po_date DESC', (err2, pos) => {
            if (err2) {
                console.log(err2);
                pos = [];
            }
            res.render('../views/admin/admin_main', { plans: plans, pos: pos, msg: msg });
        });
    });
});

// Update Plan Status (from select dropdown)
router.post('/updateplanstatus', isAuthenticated, isAdmin, (req, res) => {
    const { ids, status } = req.body;
    if (!ids || ids.length === 0 || !status) {
        return res.redirect('/admin_approve');
    }
    pool.query('UPDATE Plan_Header SET plan_status = ? WHERE plan_Id IN (?)', [status, ids], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error updating plan status');
        }
        res.json({ success: true });
    });
});

module.exports = router;