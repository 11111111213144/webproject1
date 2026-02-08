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
                                i.item_type,
                                i.item_name,
                                h.plan_status 
                            FROM Plan_Header h 
                            JOIN Plan_Detail d ON h.plan_Id = d.plan_Id 
                            JOIN Inventory i ON d.item_Id = i.item_Id
                            GROUP BY h.plan_Id
                        `;

                        pool.query(sqlPlan, (err, allPlan) => {
                            if (err) {
                                console.log('Error fetching plan:', err.message);
                                allPlan = [];
                            }

                            res.render('dash_board_test', {
                                user: allUsers,
                                inventory: allInventory,
                                plan: allPlan
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
        res.render('plan_detail_test', {
            planDetail: planDetail
        });
    });
});

module.exports = router;