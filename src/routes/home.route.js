const express = require('express');

const router = express.Router();

const bodyParser = require('body-parser');
const path = require('path')

const { pool, total_inventory, total_money , total_plan, total_po} = require('../models/mysqlpool');

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookie = require('cookie-parser');

router.use(cookie());

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/homepage', async (req, res) => {
    try {
        const [totalitem] = await total_inventory();
        const [totalmoney] = await total_money();
        const [totalplan] = await total_plan();
        const [totalpo] = await total_po();
        
        res.render('user/homepage', {
            amt_item: totalitem[0].total || 0,
            total_money: totalmoney[0].total || 0,
            total_plan: totalplan[0].total || 0,
            total_po: totalpo[0].total || 0,
        });
    } catch (err) {
        console.error('Homepage error:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;