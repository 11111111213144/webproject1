const express = require('express');

const router = express.Router();

const bodyParser = require('body-parser');
const path = require('path')
const { pool } = require('../models/mysqlpool');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookie = require('cookie-parser');

router.use(cookie());

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


router.get('/', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login?msg=Please login first');
    }

    const msg = req.query.msg || null;

    try {
        const decoded = jwt.verify(token, process.env.secret);
        const username = decoded.username;

        pool.query('SELECT role FROM user WHERE userName = ?', [username], (error, results) => {
            if (error) {
                console.log(error);
                return res.redirect('/homepage');
            }

            if (results.length > 0 && results[0].role === 'admin') {
                // User is admin, fetch all data
                pool.query('SELECT * FROM user', (err, allUsers) => {
                    if (err) { console.log(err); return res.redirect('/homepage'); }

                    pool.query('SELECT * ,(remain*unit_price) as total_price FROM inventory', (err, allInventory) => {
                        // Handle missing table gracefully (optional)
                        if (err) {
                            console.log('Error fetching inventory:', err.message);
                            allInventory = [];
                        }
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

                            pool.query('SELECT * FROM po_header', (err, allPo) => {
                                if (err) {
                                    console.log('Error fetching po:', err.message);
                                    allPo = [];
                                }
                                res.render('99test/dash_board_test', {
                                    user: allUsers,
                                    inventory: allInventory,
                                    plan: allPlan,
                                    order: allPo,
                                    msg: msg
                                });
                            });
                        });
                    });
                });
            } else {
                // User is not admin
                console.log('Access denied: User is not admin');
                res.redirect('/homepage?msg=Access Denied');
            }
        });

    } catch (err) {
        console.log(err);
        res.redirect('/login');
    }
});

router.get('/plan_detail_test/:plan_Id', (req, res) => {
    const plan_Id = req.params.plan_Id;

    // 1. Fetch Plan Header
    pool.query('SELECT * FROM Plan_Header WHERE plan_Id = ?', [plan_Id], (err, headerResult) => {
        if (err) {
            console.log('Error fetching plan header:', err.message);
            return res.redirect('/dash_board_test');
        }
        if (headerResult.length === 0) {
            return res.redirect('/dash_board_test?msg=' + encodeURIComponent('Plan not found'));
        }
        const planHeader = headerResult[0];

        // 2. Fetch Plan Details (Items)
        const sqlDetails = `
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
        pool.query(sqlDetails, [plan_Id], (err, planDetail) => {
            if (err) {
                console.log('Error fetching plan details:', err.message);
                // Continue with empty details if error? Or fail? Better fail or show empty.
                planDetail = [];
            }

            // 3. Fetch Inventory for Dropdown
            pool.query('SELECT * FROM Inventory', (err, inventoryItems) => {
                if (err) {
                    console.log('Error fetching inventory:', err.message);
                    inventoryItems = [];
                }

                res.render('99test/plan_detail_test', {
                    planHeader: planHeader,
                    planDetail: planDetail,
                    inventoryItems: inventoryItems,
                    plan_Id: plan_Id
                });
            });
        });
    });
});

router.post('/addplan', (req, res) => {
    const { plan_name, plan_date, item_plan } = req.body;
    const sql = 'INSERT INTO plan_header (plan_name, plan_date, item_plan) VALUES (?, ?, ?)';
    pool.query(sql, [plan_name, plan_date, item_plan], (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect('/dash_board_test?msg=' + encodeURIComponent('Error adding plan'));
        }
        res.redirect('/dash_board_test?msg=' + encodeURIComponent('Plan added successfully'));
    });
})

router.post('/add_plan_detail', (req, res) => {
    const { plan_Id, item_Id, quantity } = req.body;
    // Insert using plan_Id and item_Id. database should handle the rest via joins or triggers if needed, 
    // but typically we just need the foreign keys.
    const sql = 'INSERT INTO plan_detail (plan_Id, item_Id, quantity) VALUES (?, ?, ?)';
    pool.query(sql, [plan_Id, item_Id, quantity], (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect('/dash_board_test/plan_detail_test/' + plan_Id + '?msg=' + encodeURIComponent('Error adding item'));
        }
        res.redirect('/dash_board_test/plan_detail_test/' + plan_Id);
    });
});

router.post('/delete_plan_detail', (req, res) => {
    const { plan_detail_Id } = req.body;
    const sql = 'DELETE FROM plan_detail WHERE plan_detail_Id = ?';
    pool.query(sql, [plan_detail_Id], (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect('/dash_board_test?status=error');
        }
        if (result.affectedRows === 0) {
            console.log('No rows affected');
            return res.redirect('/dash_board_test?status=error&msg=' + encodeURIComponent('ไม่สามารถลบได้ เนื่องจากไม่มีข้อมูลอ้างอิงอยู่'));
        }
        else {
            return res.redirect('/dash_board_test?status=success&msg=' + encodeURIComponent('ลบข้อมูลสำเร็จ'));
        }
    });
});

router.post('/update_plan_detail', (req, res) => {
    const { plan_detail_Id, plan_Id, quantity } = req.body;
    const sql = 'UPDATE Plan_Detail SET quantity = ? WHERE id = ?';
    pool.query(sql, [quantity, plan_detail_Id], (err, result) => {
        if (err) {
            console.log(err);
            // If plan_Id is missing, fallback to dashboard
            const redirectUrl = plan_Id ? `/dash_board_test/plan_detail_test/${plan_Id}` : '/dash_board_test';
            return res.redirect(`${redirectUrl}?status=error&msg=` + encodeURIComponent('ไม่สามารถอัปเดตข้อมูลได้'));
        }
        const redirectUrl = plan_Id ? `/dash_board_test/plan_detail_test/${plan_Id}` : '/dash_board_test';
        res.redirect(`${redirectUrl}?status=success&msg=` + encodeURIComponent('อัปเดตข้อมูลสำเร็จ'));
    });
});



router.post('/deleteitem_plan_detail', (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.json({ success: false, message: 'No items selected' });
    }

    // Using 'id' to delete (assuming Plan_Detail table has 'id' column based on previous code context)
    const sql = 'DELETE FROM Plan_Detail WHERE id IN (?)';

    // Safety check: ensure ids are integers to prevent SQL injection if using concatenated string (though (?) and [ids] handles it safely)
    // But since req.body.ids comes from client, it's good practice.
    // However, with mysql/mysql2 driver, passing array for IN (?) is safe.

    pool.query(sql, [ids], (err, result) => {
        if (err) {
            console.error('Error deleting items:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        res.json({ success: true });
    });
});

router.get('/po_detail_test/:po_Id', (req, res) => {
    const po_Id = req.params.po_Id;
    const sqlDetails = `
        SELECT 
            pod.id AS po_detail_Id,
            ph.po_number,
            ph.supplier_name,
            ph.po_date,
            pod.item_Id,
            i.item_name,
            pod.quantity,
            i.unit,
            i.unit_price,
            pod.agreed_price,
            (pod.quantity * pod.agreed_price) AS total_price,
            pl.plan_name
        FROM 
            PO_Header ph
        JOIN 
            PO_Detail pod ON ph.po_Id = pod.po_Id
        JOIN 
            Inventory i ON pod.item_Id = i.item_Id
        LEFT JOIN 
            Plan_Detail pd ON pod.ref_plan_detail_id = pd.id
        LEFT JOIN 
            Plan_Header pl ON pd.plan_Id = pl.plan_Id
        WHERE 
            ph.po_Id = ?
    `;
    pool.query(sqlDetails, [po_Id], (err, poDetails) => {
        if (err) {
            console.log('Error fetching PO details:', err.message);
            return res.redirect('/dash_board_test');
        }

        // Fetch PO Header info
        pool.query('SELECT * FROM PO_Header WHERE po_Id = ?', [po_Id], (err, poHeader) => {
            if (err) {
                console.log('Error fetching PO header:', err.message);
                poHeader = [];
            }

            // Fetch Inventory for dropdown
            pool.query('SELECT * FROM Inventory', (err, inventoryItems) => {
                if (err) {
                    console.log('Error fetching inventory:', err.message);
                    inventoryItems = [];
                }

                // Fetch unique suppliers from PO_Header
                pool.query('SELECT DISTINCT supplier_name FROM PO_Header', (err, suppliers) => {
                    if (err) {
                        console.log('Error fetching suppliers:', err.message);
                        suppliers = [];
                    }

                    res.render('99test/po_detail_test', {
                        poDetails: poDetails,
                        poHeader: poHeader.length > 0 ? poHeader[0] : null,
                        inventoryItems: inventoryItems,
                        suppliers: suppliers,
                        po_Id: po_Id
                    });
                });
            });
        });
    });
});

// Add PO Detail
router.post('/add_po_detail', (req, res) => {
    const { po_Id, item_Id, quantity, agreed_price } = req.body;
    const sql = 'INSERT INTO PO_Detail (po_Id, item_Id, quantity, agreed_price) VALUES (?, ?, ?, ?)';
    pool.query(sql, [po_Id, item_Id, quantity, agreed_price], (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect('/dash_board_test/po_detail_test/' + po_Id + '?msg=' + encodeURIComponent('Error adding item'));
        }
        res.redirect('/dash_board_test/po_detail_test/' + po_Id + '?msg=' + encodeURIComponent('เพิ่มรายการสำเร็จ'));
    });
});

// Delete PO Detail items
router.post('/deleteitem_po_detail', (req, res) => {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.json({ success: false, message: 'No items selected' });
    }

    const sql = 'DELETE FROM PO_Detail WHERE id IN (?)';
    pool.query(sql, [ids], (err, result) => {
        if (err) {
            console.error('Error deleting PO items:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        res.json({ success: true });
    });
});




router.get('/homepage', (req, res) => {
    const amount_item = "SELECT COUNT(*) AS total FROM inventory";
    pool.query(amount_item, (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect('/dash_board_test?status=error&msg=' + encodeURIComponent('เกิดข้อผิดพลาดทางระบบ'));
        }
        res.render('user/homepage', {
            amt_item: result[0].total
        });
    });
});


module.exports = router;