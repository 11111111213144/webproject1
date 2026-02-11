const express = require('express');

const router = express.Router();

const bodyParser = require('body-parser');
const path = require('path')
const { pool } = require('../models/mysqlpool');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookie = require('cookie-parser');
const { url } = require('url');
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
        res.render('user/plan/index', { plan: allPlan });
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
        res.render('user/plan/add', { plan: result });
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
            res.render('admin/admin_main', { plans: plans, pos: pos });
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

// Add new plan page
router.get('/addplan', isAuthenticated, (req, res) => {
    const msg = req.query.msg || null;
    const plan_Id = req.query.plan_Id || null;
    
    // Fetch inventory items for dropdown
    const inventorySql = 'SELECT item_Id, item_name, remain, unit FROM Inventory WHERE remain > 0 ORDER BY item_name';
    
    pool.query(inventorySql, (err, inventoryItems) => {
        if (err) {
            console.log('Error fetching inventory:', err.message);
            inventoryItems = [];
        }
        
        // If plan_Id exists, fetch plan details
        if (plan_Id) {
            const detailSql = `
                SELECT 
                    pd.id AS plan_detail_Id,
                    pd.plan_Id,
                    pd.item_Id,
                    pd.quantity,
                    i.item_name,
                    i.unit,
                    i.unit_price,
                    (pd.quantity * i.unit_price) AS total_price
                FROM Plan_Detail pd
                LEFT JOIN Inventory i ON pd.item_Id = i.item_Id
                WHERE pd.plan_Id = ?
                ORDER BY pd.id
            `;
            
            pool.query(detailSql, [plan_Id], (err, planDetail) => {
                if (err) {
                    console.log('Error fetching plan details:', err.message);
                    planDetail = [];
                }
                
                res.render('user/plan/add', { 
                    msg: msg, 
                    plan_Id: plan_Id,
                    inventoryItems: inventoryItems,
                    planDetail: planDetail
                });
            });
        } else {
            res.render('user/plan/add', { 
                msg: msg, 
                inventoryItems: inventoryItems
            });
        }
    });
});

// Edit plan page  
router.get('/editplan/:id', isAuthenticated, (req, res) => {
    const planId = req.params.id;
    const sql = 'SELECT * FROM plan_header WHERE plan_Id = ?';
    
    pool.query(sql, [planId], (err, result) => {
        if (err) {
            console.log('Error fetching plan:', err.message);
            return res.redirect('/createplan?msg=' + encodeURIComponent('Plan not found'));
        }
        if (result.length === 0) {
            return res.redirect('/createplan?msg=' + encodeURIComponent('Plan not found'));
        }
        res.render('user/plan/edit', { plan: result[0] });
    });
});

// Update plan
router.post('/updateplan/:id', isAuthenticated, isMember, (req, res) => {
    const planId = req.params.id;
    const { plan_name, plan_date, item_plan } = req.body;
    const sql = 'UPDATE plan_header SET plan_name = ?, plan_date = ?, item_plan = ? WHERE plan_Id = ?';
    
    pool.query(sql, [plan_name, plan_date, item_plan, planId], (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect(`/editplan/${planId}?msg=` + encodeURIComponent('Error updating plan'));
        }
        res.redirect('/createplan?msg=' + encodeURIComponent('Plan updated successfully'));
    });
});

module.exports = router;