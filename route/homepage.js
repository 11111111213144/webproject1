const express = require('express');
require('dotenv').config();
const router = express.Router();

const bodyParser = require('body-parser');
const path = require('path')

const { pool, total_inventory, total_money , total_plan, total_po, plan_sucess,plan_wait, } = require('../database/mysqlpool');

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookie = require('cookie-parser');
const { isAuthenticated, isAdmin, isMember } = require('./auth');

router.use(cookie());

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());




router.get('/homepage', async (req, res) => {
    try {
        const [totalitem] = await total_inventory();
        const [totalmoney] = await total_money();
        const [totalplan] = await total_plan();
        const [totalpo] = await total_po();
        const [posuccess] = await po_sucess();
        const [planRows] = await pool.promise().query('SELECT * FROM plan_header LIMIT 5');
        
res.render('homepage', {
            amt_item: totalitem[0].total || 0,
            total_money: totalmoney[0].total || 0,
            total_plan: totalplan[0].total || 0,
            total_po: totalpo[0].total || 0,
po_sucess: posuccess,
            plan: planRows

        });
    } catch (err) {
        console.error('Homepage error:', err);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;