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
                                res.render('test/dash_board_test', {
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
    const sql = `
        SELECT 
            h.plan_name, 
            i.item_name, 
            d.quantity, 
            i.unit,
            i.unit_price,
            (d.quantity * i.unit_price) AS total_price
        FROM Plan_Header h
        JOIN Plan_Detail d ON h.plan_Id = d.plan_Id
        JOIN Inventory i ON d.item_Id = i.item_Id
        WHERE h.plan_Id = ?
    `;
    pool.query(sql, [plan_Id], (err, planDetail) => {
        if (err) {
            console.log('Error fetching plan detail:', err.message);
            return res.redirect('/dash_board_test');
        }
        res.render('test/plan_detail_test', {
            planDetail: planDetail
        });
    });
});
router.get('/po_detail_test/:po_Id', (req, res) => {
    const po_Id = req.params.po_Id;
    const sql = `
       SELECT 
        ph.po_number ,
        ph.supplier_name,
        ph.po_date ,
        i.item_name ,
        pod.quantity ,
        i.unit_price ,
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
        ORDER BY 
            ph.po_number;
    `;
    pool.query(sql, [po_Id], (err, poDetail) => {
        if (err) {
            console.log('Error fetching po detail:', err.message);
            return res.redirect('/dash_board_test');
        }
        res.render('test/po_detail_test', {
            poDetail: poDetail
        });
    });
});

router.post('/create_item', (req, res) => {
    const { item_name, item_type, unit, unit_price, remain, Company_shop } = req.body;

    // 1. ดักจับค่าว่างก่อน (Validation)
    if (!item_name || !unit_price) {
        return res.redirect('/dash_board_test?status=error&msg=' + encodeURIComponent('กรุณากรอกข้อมูลที่จำเป็นให้ครบ'));
    }

    const sql = 'INSERT INTO inventory (item_name, item_type, unit, unit_price, remain, Company_shop) VALUES (?, ?, ?, ?, ?, ?)';

    pool.query(sql, [item_name, item_type, unit, unit_price, remain, Company_shop], (err, result) => {
        if (err) {
            console.log(err); // ปริ้นท์ Error จริงดูใน Console (สำหรับ Dev)

            // 2. เช็คว่าเป็น Error ข้อมูลซ้ำหรือไม่? (เฉพาะ MySQL)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.redirect('/dash_board_test?status=error&msg=' + encodeURIComponent('ชื่อสินค้านี้มีอยู่แล้ว'));
            }

            // 3. ถ้าเป็น Error อื่นๆ ให้บอกกว้างๆ
            return res.redirect('/dash_board_test?status=error&msg=' + encodeURIComponent('เกิดข้อผิดพลาดทางระบบ กรุณาลองใหม่'));
        }

        // 4. สำเร็จ
        res.redirect('/dash_board_test?status=success&msg=' + encodeURIComponent('เพิ่มข้อมูลสำเร็จ'));
    });
});

router.post('/delete_item', (req, res) => {
    const { item_Id } = req.body;
    const sql = 'DELETE FROM inventory WHERE item_Id = ?';
    pool.query(sql, [item_Id], (err, result) => {
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

router.post('/update_item', (req, res) => {
    const { item_Id, item_name, item_type, unit, unit_price, remain, Company_shop } = req.body;
    const sql = 'UPDATE inventory SET item_name = ?, item_type = ?, unit = ?, unit_price = ?, remain = ?, Company_shop = ? WHERE item_Id = ?';
    pool.query(sql, [item_name, item_type, unit, unit_price, remain, Company_shop, item_Id], (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect('/dash_board_test?status=error&msg=' + encodeURIComponent('ไม่สามารถอัปเดตข้อมูลได้'));
        }
        res.redirect('/dash_board_test?status=success&msg=' + encodeURIComponent('อัปเดตข้อมูลสำเร็จ'));
    });
});

router.post('/create_plan', (req, res) => {
    const { plan_name, plan_date, plan_status, item_plan } = req.body;
    const sql = 'INSERT INTO plan_header (plan_name, plan_date, plan_status, item_plan) VALUES (?, ?, ?, ?)';
    pool.query(sql, [plan_name, plan_date, plan_status, item_plan], (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect('/dash_board_test?status=error&msg=' + encodeURIComponent('เกิดข้อผิดพลาดทางระบบ กรุณาลองใหม่'));
        }
        res.redirect('/dash_board_test?status=success&msg=' + encodeURIComponent('เพิ่มข้อมูลสำเร็จ'));
    });
});

router.post('/delete_plan', (req, res) => {
    const { plan_Id } = req.body;
    const sql = 'DELETE FROM plan_header WHERE plan_Id = ?';
    pool.query(sql, [plan_Id], (err, result) => {
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

router.post('/update_plan', (req, res) => {
    const { plan_Id, plan_status } = req.body;
    const sql = 'UPDATE plan_header SET plan_status = ? WHERE plan_Id = ?';
    pool.query(sql, [plan_status, plan_Id], (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect('/dash_board_test?status=error&msg=' + encodeURIComponent('ไม่สามารถอัปเดตข้อมูลได้'));
        }
        res.redirect('/dash_board_test?status=success&msg=' + encodeURIComponent('อัปเดตข้อมูลสำเร็จ'));
    });
});

router.post('/create_po', (req, res) => {
    const { po_number, po_date, po_status } = req.body;
    const sql = 'INSERT INTO po_header (po_number, po_date, po_status) VALUES (?, ?, ?)';
    pool.query(sql, [po_number, po_date, po_status], (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect('/dash_board_test?status=error&msg=' + encodeURIComponent('เกิดข้อผิดพลาดทางระบบ กรุณาลองใหม่'));
        }
        res.redirect('/dash_board_test?status=success&msg=' + encodeURIComponent('เพิ่มข้อมูลสำเร็จ'));
    });
});

router.post('/delete_po', (req, res) => {
    const { po_Id } = req.body;
    const sql = 'DELETE FROM po_header WHERE po_Id = ?';
    pool.query(sql, [po_Id], (err, result) => {
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

router.post('/update_po', (req, res) => {
    const { po_Id, po_status } = req.body;
    const sql = 'UPDATE po_header SET po_status = ? WHERE po_Id = ?';
    pool.query(sql, [po_status, po_Id], (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect('/dash_board_test?status=error&msg=' + encodeURIComponent('ไม่สามารถอัปเดตข้อมูลได้'));
        }
        res.redirect('/dash_board_test?status=success&msg=' + encodeURIComponent('อัปเดตข้อมูลสำเร็จ'));
    });
});

router.post('/update_user', (req, res) => {
    const { userId, Fname, Lname, userName, userPass, email, phone, role } = req.body;
    const sql = 'UPDATE user SET Fname = ?, Lname = ?, userName = ?, userPass = ?, email = ?, phone = ?, role = ? WHERE userId = ?';
    pool.query(sql, [Fname, Lname, userName, userPass, email, phone, role, userId], (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect('/dash_board_test?status=error&msg=' + encodeURIComponent('ไม่สามารถอัปเดตข้อมูลได้'));
        }
        res.redirect('/dash_board_test?status=success&msg=' + encodeURIComponent('อัปเดตข้อมูลสำเร็จ'));
    });
});

router.post('/delete_user', (req, res) => {
    const { userId } = req.body;
    const sql = 'DELETE FROM user WHERE userId = ?';
    pool.query(sql, [userId], (err, result) => {
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

router.get('/homepage', (req, res) => {
    const amount_item = "SELECT COUNT(*) AS total FROM inventory";
    pool.query(amount_item, (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect('/dash_board_test?status=error&msg=' + encodeURIComponent('เกิดข้อผิดพลาดทางระบบ'));
        }
        res.render('homepage', {
            amt_item: result[0].total
        });
    });
});


module.exports = router;