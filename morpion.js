const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index', { title: 'Morpion', message: 'JOUER' });
});

app.post('/', (req, res) => {
    console.log(req.body);
    res.render('index', { title: 'Morpion', message: 'JOUER' });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});