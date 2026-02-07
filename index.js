const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cookie = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

const { error } = require('console');
const path = require('path');
const pool = require('./database/mysqlpool');


app.use(express.json());
app.use(cookie());
app.use(express.static(path.join(__dirname, 'public')));

const memberRouter = require('./route/member');
app.use('/member', memberRouter);

app.set('views', `${__dirname}/public`);
app.set('view engine', 'ejs');

require('dotenv').config();

app.get('/', (req, res) => {
  res.render('member/login');
});

app.get('/login', (req, res) => {
  res.render('member/login');
});

app.get('/homepage', (req, res) => {
  res.render('homepage');
});

app.get('/checkorder', (req, res) => {
  res.render('checkorder');
});

app.get('/createplan', (req, res) => {
  res.render('createplan_main');
});

app.get('/makeplan', (req, res) => {
  res.render('makeplan');
});

app.get('/dash_board', (req, res) => {
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
        // User is admin, fetch all users for dashboard
        pool.query('SELECT * FROM user', (err, allUsers) => {
          if (err) throw err;
          res.render('dash_board_test', { user: allUsers });
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});