const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const { error } = require('console');
const path = require('path');


app.use(express.json());
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});