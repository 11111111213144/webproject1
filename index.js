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

const bth_inventoryRouter = require('./route/bth_inventory');
app.use('/', bth_inventoryRouter);

const bth_create_planRouter = require('./route/bth_create_plan');
app.use('/', bth_create_planRouter);

const bth_poRouter = require('./route/bth_po');
app.use('/', bth_poRouter);


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



app.get('/makepo', (req, res) => {
  res.render('makepo');
});

app.get('/dev_mem', (req, res) => {
  res.render('dev_mem');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});



