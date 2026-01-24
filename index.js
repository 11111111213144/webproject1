express = require('express');
const app = express();
const port = 3000;

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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});