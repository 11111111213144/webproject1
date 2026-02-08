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

const dash_board_testRouter = require('./route/dash_board_test');
app.use('/dash_board_test', dash_board_testRouter);

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


app.get('/inventory', (req, res) => {
  res.render('inventory');
});

app.get('/createitem', (req, res) => {
  res.render('createitem');
});



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});