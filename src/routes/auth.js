

const jwt = require('jsonwebtoken');

// Middleware ตรวจสอบว่า login หรือยัง
const isAuthenticated = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login?msg=กรุณาเข้าสู่ระบบ');
    }
    try {
        const decoded = jwt.verify(token, process.env.secret || 'fallbacksecret');
        req.user = decoded;  // เก็บข้อมูล user ไว้ใน req
        res.locals.user = decoded;  // เก็บข้อมูล user ไว้ใน res.locals สำหรับ EJS
        next();
    } catch (err) {
        return res.redirect('/login?msg=Session หมดอายุ');
    }
};

// Middleware ตรวจสอบว่าเป็น Admin หรือไม่
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.redirect('/homepage?msg=คุณไม่มีสิทธิ์เข้าถึง');
    }
};

// Middleware ตรวจสอบว่าเป็น Member หรือไม่
const isMember = (req, res, next) => {
    if (req.user && (req.user.role === 'member' || req.user.role === 'admin')) {
        next();
    } else {
        return res.redirect('/login?msg=กรุณาเข้าสู่ระบบ');
    }
};

module.exports = { isAuthenticated, isAdmin, isMember };