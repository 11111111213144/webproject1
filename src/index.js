// Load environment variables first
require('dotenv').config({ path: '.env' });

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cookie = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

const { error } = require('console');
const path = require('path');
const pool = require('./models/mysqlpool');


app.use(express.json());
app.use(cookie());
app.use(express.static(path.join(__dirname, '../public')));

const memberRouter = require('./routes/member');
app.use('/member', memberRouter);


const dash_board_testRouter = require('./routes/dash_board_test');
app.use('/dash_board_test', dash_board_testRouter);

const bth_inventoryRouter = require('./routes/bth_inventory');
app.use('/', bth_inventoryRouter);

const bth_create_planRouter = require('./routes/bth_create_plan');
app.use('/', bth_create_planRouter);

const bth_poRouter = require('./routes/bth_po');
app.use('/', bth_poRouter);

const homepageRouter = require('./routes/homepage');
app.use('/', homepageRouter);

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('auth/login');
});

app.get('/login', (req, res) => {
  res.render('auth/login');
});

app.get('/checkorder', (req, res) => {
  res.render('checkorder');
});


app.get('/makepo', (req, res) => {
  res.render('makepo');
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});



