const express = require('express');

const router = express.Router();

const bodyParser = require('body-parser');
const path = require('path')
const { pool } = require('../models/mysqlpool');
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
            res.render('user/po/index', { po: results });
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


router.get('/po_add', (req, res) => {
    // Get existing PO data
    pool.query('SELECT * FROM po_header', (err, poResults) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error retrieving po_header data');
        }

        // Get plan headers for selection - only show plans with status "รออนุมัติ"
        const planQuery = `
            SELECT plan_Id, plan_name, plan_date, plan_status 
            FROM Plan_Header 
            WHERE plan_status = 'อนุมัติแล้ว'
            ORDER BY plan_date DESC
        `;

        pool.query(planQuery, (err, planResults) => {
            if (err) {
                console.error('Error fetching plan headers:', err);
                planResults = []; // Continue with empty plans if error
            }

            console.log('Plans found:', planResults.length); // Debug line
            if (planResults.length > 0) {
                planResults.forEach(plan => {
                    console.log(`Plan: ${plan.plan_Id} - ${plan.plan_name} - Status: ${plan.plan_status}`);
                });
            } else {
                console.log('No plans found in Plan_Header table');
                // Try a simpler query to see if table exists and has any data
                pool.query('SELECT COUNT(*) as count FROM Plan_Header', (err2, countResult) => {
                    if (err2) {
                        console.error('Error counting plans:', err2);
                    } else {
                        console.log('Plan_Header table has', countResult[0].count, 'records');
                    }
                });
            }

            res.render('user/po/add', {
                po: poResults,
                plans: planResults
            });
        });
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


// Update PO Status (from select dropdown)
router.post('/updatepostatus', isAuthenticated, isAdmin, (req, res) => {
    const { ids, status } = req.body;
    if (!ids || ids.length === 0 || !status) {
        return res.redirect('/admin_main');
    }
    pool.query('UPDATE po_header SET po_status = ? WHERE po_Id IN (?)', [status, ids], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error updating PO status');
        }

        // ถ้าสถานะเป็น "รับของแล้ว" ให้อัปเดตคงคลัง
        if (status === 'รับของแล้ว') {
            const detailSql = `
                SELECT pod.item_Id, pod.quantity 
                FROM PO_Detail pod 
                WHERE pod.po_Id IN (?)
            `;

            pool.query(detailSql, [ids], (err2, details) => {
                if (err2) {
                    console.log('Error fetching PO details:', err2);
                    return res.json({ success: true, warning: 'PO updated but inventory not updated' });
                }

                // วนลูปอัปเดตคงคลังแต่ละ item
                details.forEach(detail => {
                    const updateInventorySql = 'UPDATE inventory SET remain = remain + ? WHERE item_Id = ?';
                    pool.query(updateInventorySql, [detail.quantity, detail.item_Id], (err3) => {
                        if (err3) console.log('Error updating inventory:', err3);
                    });

                });
            });
        }

        res.json({ success: true });
    });
});

// Get plan details for selected plan
router.get('/get_plan_details/:plan_Id', isAuthenticated, (req, res) => {
    const plan_Id = req.params.plan_Id;

    const planDetailQuery = `
        SELECT 
            d.id AS plan_detail_Id,
            d.plan_Id,
            d.item_Id,
            i.item_name, 
            d.quantity, 
            i.unit,
            i.unit_price,
            (d.quantity * i.unit_price) AS total_price
        FROM Plan_Detail d
        JOIN Inventory i ON d.item_Id = i.item_Id
        WHERE d.plan_Id = ?
    `;

    pool.query(planDetailQuery, [plan_Id], (err, planDetails) => {
        if (err) {
            console.error('Error fetching plan details:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        res.json({
            success: true,
            planDetails: planDetails
        });
    });
});

// PO Edit Page
router.get('/editpo/:id', isAuthenticated, (req, res) => {
    const poId = req.params.id;
    const sql = 'SELECT * FROM po_header WHERE po_Id = ?';

    pool.query(sql, [poId], (err, result) => {
        if (err) {
            console.log('Error fetching PO:', err.message);
            return res.redirect('/makepo?msg=' + encodeURIComponent('PO not found'));
        }
        if (result.length === 0) {
            return res.redirect('/makepo?msg=' + encodeURIComponent('PO not found'));
        }
        res.render('user/po/edit', { po: result[0] });
    });
});

// Update PO
router.post('/updatepo/:id', isAuthenticated, isMember, (req, res) => {
    const poId = req.params.id;
    const { po_number, supplier_name, po_date } = req.body;
    const sql = 'UPDATE po_header SET po_number = ?, supplier_name = ?, po_date = ? WHERE po_Id = ?';

    pool.query(sql, [po_number, supplier_name, po_date, poId], (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect(`/editpo/${poId}?msg=` + encodeURIComponent('Error updating PO'));
        }
        res.redirect('/makepo?msg=' + encodeURIComponent('PO updated successfully'));
    });
});

// PO Detail Page
router.get('/podetail/:id', isAuthenticated, (req, res) => {
    const poId = req.params.id;

    // Get PO header
    const headerSql = 'SELECT * FROM po_header WHERE po_Id = ?';

    pool.query(headerSql, [poId], (err, headerResult) => {
        if (err) {
            console.log('Error fetching PO header:', err.message);
            return res.redirect('/makepo?msg=' + encodeURIComponent('PO not found'));
        }
        if (headerResult.length === 0) {
            return res.redirect('/makepo?msg=' + encodeURIComponent('PO not found'));
        }

        const po = headerResult[0];

        // Get PO details with item information
        const detailSql = `
            SELECT 
                h.po_Id,
                h.po_number,
                h.po_date,
                h.supplier_name,
                i.item_name,
                d.quantity,
                d.agreed_price,
                (d.quantity * IFNULL(d.agreed_price, 0)) AS total_line_price
            FROM po_header h
            INNER JOIN po_detail d ON h.po_Id = d.po_Id
            INNER JOIN inventory i ON d.item_Id = i.item_Id
            WHERE h.po_Id = ?
            ORDER BY d.id ASC
        `;

        pool.query(detailSql, [poId], (err, detailResult) => {
            if (err) {
                console.error('Error fetching PO details:', err);
                detailResult = [];
            }

            console.log('=== BTH PO Detail Debug ===');
            console.log('PO ID:', poId);
            console.log('Detail Query Result:', detailResult);
            console.log('Number of items:', detailResult ? detailResult.length : 0);
            console.log('=============================');

            // Also fetch ALL items summary as requested by user
            const allItemsSql = `
                SELECT 
                    h.po_Id,
                    h.po_number,
                    h.po_date,
                    h.supplier_name,
                    i.item_name,
                    d.quantity,
                    d.agreed_price,
                    (d.quantity * d.agreed_price) AS total_line_price
                FROM po_header h
                JOIN po_detail d ON h.po_Id = d.po_Id
                JOIN inventory i ON d.item_Id = i.item_Id
                ORDER BY h.po_Id ASC
            `;

            pool.query(allItemsSql, (err, allResults) => {
                res.render('user/po/detail', {
                    po: po,
                    poDetails: detailResult || [],
                    poItems: allResults || []
                });
            });
        });
    });
});

// PO Report function has been merged into PO Detail page.
// The data for the summary table is now fetched within the /podetail/:id route.

module.exports = router;