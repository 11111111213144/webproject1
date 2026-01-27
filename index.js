express = require('express');
const app = express();
const port = 3000;

const { error } = require('console');
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', `${__dirname}/public`);
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.get('/homepage', (req, res) => {
  res.render('homepage.ejs');
});

app.get('/checkorder', (req, res) => {
  res.render('checkorder.ejs');
});

app.get('/createplan', (req, res) => {
  res.render('createplan.ejs');
});

app.get('/createplan/mouth', (req, res) => {
  res.render('createplan_mouth.ejs');
});

app.get('/createplan/outplan', (req, res) => {
  res.render('createplan_outplan.ejs');
});

app.get('/makeplan', (req, res) => {
  res.render('makeplan.ejs');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});