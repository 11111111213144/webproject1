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

router.get('/login', (req, res) => {
    const msg = req.query.msg
    const username = req.cookies.username;
    if (username)
        res.redirect('/login')
    else
        res.render('auth/login', { registerStatus: msg })
});

router.get('/register', (req, res) => {
    res.render('auth/register')
})

router.post('/register', (req, res) => {
    const { username, password, fullname, lastname, email, phone } = req.body
    const sql = "INSERT INTO user (userName, userPass, Fname, Lname, email, phone) VALUES (?, ?, ?, ?, ?, ?)"

    bcrypt.hash(password, 12, (err, hash) => {
        if (err) {
            console.log(err)
            res.render('auth/register', { msg: 'Something went wrong, please contact admin' })
        } else {
            pool.query(sql, [username, hash, fullname, lastname, email, phone], (err, results) => {
                if (err) {
                    console.log(err)

                    // ตรวจสอบว่าเป็น error จากข้อมูลซ้ำหรือไม่
                    if (err.code === 'ER_DUP_ENTRY') {
                        let msg = 'ข้อมูลนี้มีอยู่ในระบบแล้ว'

                        // ตรวจสอบว่า field ไหนซ้ำ
                        if (err.message.includes('unique_userName')) {
                            msg = 'ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว'
                        } else if (err.message.includes('unique_Fname')) {
                            msg = 'ชื่อจริงนี้มีอยู่ในระบบแล้ว'
                        } else if (err.message.includes('unique_Lname')) {
                            msg = 'นามสกุลนี้มีอยู่ในระบบแล้ว'
                        } else if (err.message.includes('unique_phone')) {
                            msg = 'เบอร์โทรศัพท์นี้มีอยู่ในระบบแล้ว'
                        } else if (err.message.includes('unique_email')) {
                            msg = 'อีเมลนี้มีอยู่ในระบบแล้ว'
                        }

                        res.render('auth/register', { msg: msg })
                    } else {
res.render('auth/register', { msg: 'Something went wrong, please contact admin' })
                    }
                } else {
                    res.redirect('/?msg=Register Success')
                }
            })
        }
    })
})

router.post('/register-api', (req, res) => {
    const { username, password, fullname, lastname, email, phone } = req.body
    const sql = "INSERT INTO user (userName, userPass, Fname, Lname, email, phone) VALUES (?, ?, ?, ?, ?, ?)"

    console.log(username, password, fullname, lastname, email, phone)

    if (username == '' || password == '' || fullname == '' || lastname == '' || email == '' || phone == '') {
        res.json({ 'msg': 'failed' })
        return
    }

    if (!username || !password) {
        res.json({ 'msg': 'failed' })
        return
    }

    if (username.includes(' ') || password.includes(' ')) {
        res.json({ 'msg': 'failed' })
        return
    }

    if (username.length < 4 || password.length < 4) {
        res.json({ 'msg': 'failed' })
        return
    }

    bcrypt.hash(password, 12, (err, hash) => {
        if (err) {
            console.log(err)
            res.json({ 'msg': 'error' })
        } else {
            pool.query(sql, [username, hash, fullname, lastname, email, phone], (err, results) => {
                if (err) {
                    console.log(err)

                    // ตรวจสอบว่าเป็น error จากข้อมูลซ้ำหรือไม่
                    if (err.code === 'ER_DUP_ENTRY') {
                        let error = 'ข้อมูลนี้มีอยู่ในระบบแล้ว'

                        // ตรวจสอบว่า field ไหนซ้ำ
                        if (err.message.includes('unique_userName')) {
                            error = 'Username already exists'
                        } else if (err.message.includes('unique_Fname')) {
                            error = 'First name already exists'
                        } else if (err.message.includes('unique_Lname')) {
                            error = 'Last name already exists'
                        } else if (err.message.includes('unique_phone')) {
                            error = 'Phone number already exists'
                        } else if (err.message.includes('unique_email')) {
                            error = 'Email already exists'
                        }

                        res.json({ 'msg': 'duplicate', 'error': error })
                    } else {
                        res.json({ 'msg': 'failed', 'error': 'Database error' })
                    }
                } else {
                    res.json({ 'msg': 'success' })
                }
            })
        }
    })
})

router.post('/verify-api', (req, res) => {
    const { username, password } = req.body
    const sql = "SELECT * FROM user WHERE userName = ?"

    pool.query(sql, [username], (err, results) => {
        if (err) {
            console.log(err)
            res.json({ 'msg': 'failed' })
        } else {
            if (results.length == 0)
                res.json({ 'msg': 'failed' })
            else {
                // Check if userPass matches (handling both bcrypt and plain text)
                const dbPass = results[0].userPass;
                let match = false;
                try {
                    match = bcrypt.compareSync(password, dbPass);
                } catch (e) {
                    match = (password === dbPass);
                }

                if (!match) {
                    res.json({ 'msg': 'failed' })
                    return
                }
                res.json({ 'msg': 'success' })
            }

        }
    })
})


router.post('/verify', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM user WHERE userName = ?";

    pool.query(sql, [username], (err, results) => {
        if (err) {
            console.log(err);
            res.render('auth/login', { username: username, msg: 'Something went wrong, please contact admin' });
        } else {
            if (results.length == 0) {
                res.render('auth/login', { msg: 'Wrong Username or Password' });
            } else {
                const dbUser = results[0];
                console.log('Login attempt:', { username, hasPassword: !!password });
                console.log('DB User:', dbUser);

                if (!password || !dbUser.userPass) {
                    console.error('Missing password for comparison');
                    return res.render('auth/login', { msg: 'System Error: Credentials missing' });
                }

                // Try comparison (supporting both hash and plain text)
                let match = false;
                try {
                    match = bcrypt.compareSync(password, dbUser.userPass);
                } catch (e) {
                    console.log('Bcrypt threw error:', e.message);
                }

                // Fallback to plain text if bcrypt failed (returned false OR threw error)
                if (!match && password === dbUser.userPass) {
                    console.log('Plain text password match');
                    match = true;
                }

                if (!match) {
                    console.log('Password mismatch');
                    res.render('auth/login', { username: username, msg: 'Wrong Username or Password' });
                    return;
                }

                const token = jwt.sign({
                    username: username,
                    role: dbUser.role
                }, process.env.secret);
                res.cookie('username', username, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
                res.cookie('token', token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });

                // Redirect based on role
                if (dbUser.role === 'admin') {
                    res.redirect('/admin_main?msg=Login Success');
                } else {
                    res.redirect('/homepage?msg=Login Success');
                }
            }
        }
    });
});

router.get('/member', (req, res) => {
    const userName = req.cookies.username;
    if (userName)
        res.render('user/profile', { username: userName })
    else
        res.redirect('member/login')
});

router.get('/logout', (req, res) => {
    const userName = req.cookies.username;
    if (userName)
        res.clearCookie('token')
    res.clearCookie('username')

    res.redirect('/login')
});


module.exports = router;