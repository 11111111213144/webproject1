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

// Add PO page - displays form and existing POs
router.get('/add', isAuthenticated, (req, res) => {
    const msg = req.query.msg || null;
    
    // Query to get all existing POs
    const poSql = 'SELECT * FROM po_header ORDER BY po_date DESC';
    
    // Query to get approved plans for selection
    const planSql = 'SELECT plan_Id, plan_name, plan_date, plan_status FROM plan_header WHERE plan_status = "อนุมัติแล้ว" ORDER BY plan_date DESC';
    
    pool.query(poSql, (err, poResult) => {
        if (err) {
            console.error('Error fetching POs:', err);
            poResult = [];
        }
        
        pool.query(planSql, (err, planResult) => {
            if (err) {
                console.error('Error fetching plans:', err);
                planResult = [];
            }
            
            res.render('user/po/add', { 
                msg: msg, 
                po: poResult,
                plans: planResult
            });
        });
    });
});

// Handle PO creation
router.post('/addpo', isAuthenticated, isMember, (req, res) => {
    const { po_number, po_date, supplier_name, po_status, plan_header } = req.body;
    
    // Set default status if not provided
    const status = po_status || 'รอส่งใบสั่งซื้อ';
    
    const sql = 'INSERT INTO po_header (po_number, po_date, supplier_name, po_status) VALUES (?, ?, ?, ?)';
    
    pool.query(sql, [po_number, po_date, supplier_name, status], (err, result) => {
        if (err) {
            console.error('Error adding PO:', err);
            return res.redirect('/user/po/add?msg=' + encodeURIComponent('เกิดข้อผิดพลาดในการสร้างใบสั่งซื้อ: ' + err.message));
        }
        
        const newPoId = result.insertId;
        
        // If plan_header is selected, transfer items from plan_detail to po_detail
        if (plan_header && plan_header !== '') {
            const planDetailSql = `
                INSERT INTO po_detail (po_Id, item_Id, quantity, agreed_price, ref_plan_detail_id)
                SELECT ?, pd.item_Id, pd.quantity, i.unit_price, pd.id
                FROM plan_detail pd
                LEFT JOIN inventory i ON pd.item_Id = i.item_Id
                WHERE pd.plan_Id = ?
            `;
            
            pool.query(planDetailSql, [newPoId, plan_header], (err, transferResult) => {
                if (err) {
                    console.error('Error transferring plan items to PO:', err);
                    return res.redirect('/user/po/add?msg=' + encodeURIComponent('สร้างใบสั่งซื้อสำเร็จ แต่เกิดข้อผิดพลาดในการโอนย้ายรายการ: ' + err.message));
                }
                
                let msg = 'สร้างใบสั่งซื้อเรียบร้อยแล้ว';
                if (transferResult.affectedRows > 0) {
                    msg += ` (โอนรายการสินค้า ${transferResult.affectedRows} รายการ)`;
                }
                res.redirect('/user/po/add?msg=' + encodeURIComponent(msg));
            });
        } else {
            const msg = 'สร้างใบสั่งซื้อเรียบร้อยแล้ว';
            res.redirect('/user/po/add?msg=' + encodeURIComponent(msg));
        }
    });
});

// Get plan details for PO creation
router.get('/get_plan_details/:planId', isAuthenticated, (req, res) => {
    const planId = req.params.planId;
    
    const sql = `
        SELECT 
            pd.id AS plan_detail_Id,
            pd.plan_Id,
            pd.item_Id,
            pd.quantity,
            i.item_name,
            i.unit,
            i.unit_price,
            (pd.quantity * i.unit_price) AS total_price
        FROM plan_detail pd
        LEFT JOIN inventory i ON pd.item_Id = i.item_Id
        WHERE pd.plan_Id = ?
        ORDER BY pd.id
    `;
    
    pool.query(sql, [planId], (err, result) => {
        if (err) {
            console.error('Error fetching plan details:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายการแผน' 
            });
        }
        
        res.json({ 
            success: true, 
            planDetails: result 
        });
    });
});

// Delete selected POs
router.post('/deletepo', isAuthenticated, isMember, (req, res) => {
    const { ids } = req.body;
    
    if (!ids || ids.length === 0) {
        return res.status(400).json({ success: false, message: 'กรุณาเลือกรายการที่ต้องการลบ' });
    }
    
    const sql = 'DELETE FROM po_header WHERE po_Id IN (?)';
    
    pool.query(sql, [ids], (err, result) => {
        if (err) {
            console.error('Error deleting POs:', err);
            return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบรายการ' });
        }
        
        res.json({ success: true, message: 'ลบรายการสำเร็จ' });
    });
});

// PO detail page
router.get('/detail/:id', isAuthenticated, (req, res) => {
    const poId = req.params.id;
    
    // Get PO header
    const headerSql = 'SELECT * FROM po_header WHERE po_Id = ?';
    
    pool.query(headerSql, [poId], (err, headerResult) => {
        if (err) {
            console.error('Error fetching PO header:', err);
            return res.status(500).send('Database error');
        }
        
        if (headerResult.length === 0) {
            return res.status(404).send('PO not found');
        }
        
        const po = headerResult[0];
        
        // Get PO details with item information using the specified query
        // Use INNER JOIN to only get PO items that have valid details
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
            
            console.log('=== PO Detail Debug ===');
            console.log('PO ID:', poId);
            console.log('Detail Query:', detailSql);
            console.log('Detail Query Result:', detailResult);
            console.log('Number of items:', detailResult ? detailResult.length : 0);
            console.log('=======================');
            
            res.render('user/po/detail', { 
                po: po, 
                poDetails: detailResult || []
            });
        });
    });
});

// Add item to PO
router.post('/add-item/:poId', isAuthenticated, isMember, (req, res) => {
    const poId = req.params.poId;
    const { item_Id, quantity, agreed_price } = req.body;
    
    if (!item_Id || !quantity) {
        return res.status(400).json({ 
            success: false, 
            message: 'กรุณาระบุสินค้าและจำนวน' 
        });
    }
    
    const sql = 'INSERT INTO po_detail (po_Id, item_Id, quantity, agreed_price) VALUES (?, ?, ?, ?)';
    
    pool.query(sql, [poId, item_Id, quantity, agreed_price || null], (err, result) => {
        if (err) {
            console.error('Error adding PO item:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'เกิดข้อผิดพลาดในการเพิ่มรายการ' 
            });
        }
        
        res.redirect('/po/detail/' + poId);
    });
});

// Update PO item
router.post('/update-item/:detailId', isAuthenticated, isMember, (req, res) => {
    const detailId = req.params.detailId;
    const { quantity, agreed_price } = req.body;
    
    const sql = 'UPDATE po_detail SET quantity = ?, agreed_price = ? WHERE id = ?';
    
    pool.query(sql, [quantity, agreed_price || null, detailId], (err, result) => {
        if (err) {
            console.error('Error updating PO item:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'เกิดข้อผิดพลาดในการอัพเดตรายการ' 
            });
        }
        
        res.json({ success: true, message: 'อัพเดตรายการสำเร็จ' });
    });
});

// Delete PO item
router.delete('/delete-item/:detailId', isAuthenticated, isMember, (req, res) => {
    const detailId = req.params.detailId;
    
    const sql = 'DELETE FROM po_detail WHERE id = ?';
    
    pool.query(sql, [detailId], (err, result) => {
        if (err) {
            console.error('Error deleting PO item:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'เกิดข้อผิดพลาดในการลบรายการ' 
            });
        }
        
        res.json({ success: true, message: 'ลบรายการสำเร็จ' });
    });
});

// Test route to check PO details
router.get('/check-details/:poId', (req, res) => {
    const poId = req.params.poId;
    
    console.log('=== Checking PO Details ===');
    console.log('PO ID:', poId);
    
    // Check if PO exists
    const poSql = 'SELECT * FROM po_header WHERE po_Id = ?';
    pool.query(poSql, [poId], (err, poResult) => {
        console.log('PO Result:', poResult);
        
        // Check PO details
        const detailSql = 'SELECT * FROM po_detail WHERE po_Id = ?';
        pool.query(detailSql, [poId], (err, detailResult) => {
            console.log('Detail Result:', detailResult);
            
            // Check full join
            const fullSql = `
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
            `;
            pool.query(fullSql, [poId], (err, fullResult) => {
                console.log('Full Join Result:', fullResult);
                console.log('========================');
                
                res.json({
                    po: poResult,
                    details: detailResult,
                    fullJoin: fullResult
                });
            });
        });
    });
});

// Test route to add sample PO details
router.get('/test-add-details', (req, res) => {
    const sampleData = [
        { po_Id: 6, item_Id: 1, quantity: 10, agreed_price: 100.00 },
        { po_Id: 6, item_Id: 2, quantity: 20, agreed_price: 12.00 }
    ];
    
    sampleData.forEach(data => {
        const sql = 'INSERT INTO po_detail (po_Id, item_Id, quantity, agreed_price) VALUES (?, ?, ?, ?)';
        pool.query(sql, [data.po_Id, data.item_Id, data.quantity, data.agreed_price], (err, result) => {
            if (err) {
                console.error('Error adding sample data:', err);
            } else {
                console.log('Sample data added:', result);
            }
        });
    });
    
    res.send('Sample data added. Check the detail page for PO ID 6');
});

router.get('/detail', (req, res) => {
  // Query to get a PO (you might want to add logic to select a specific PO)
  pool.query('SELECT * FROM po_header LIMIT 1', (err, poResult) => {
    if (err) {
      console.error('Error fetching PO:', err);
      return res.status(500).send('Database error');
    }
    
    // Provide empty PO object if no PO exists
    const po = poResult.length > 0 ? poResult[0] : {
      po_Id: '',
      po_number: '',
      supplier_name: '',
      po_date: ''
    };
    
    res.render('user/po/detail', { po: po });
  });
});


module.exports = router;