const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

let currentPlayer = 'X';
let boardState = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
];

app.get('/', (req, res) => {
    currentPlayer = 'X';
    boardState = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];
    res.render('index', { title: 'Morpion', message: 'JOUER', currentPlayer, boardState });
});

app.post('/', (req, res) => {
    const { cell } = req.body;
    const [row, col] = cell.split('-').map(Number);

    // Add player's moove
        boardState[row][col] = currentPlayer;

    // Check win
    if (checkWinner(currentPlayer)) {
        res.render('win', { winner: currentPlayer });
    } else {
        // Switch to the next player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        res.render('index', { title: 'Morpion', message: 'JOUER', currentPlayer, boardState });
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

function checkWinner(player) {
    // Check rows, columns, and diagonals for a win
    for (let i = 0; i < 3; i++) {
        if (boardState[i].every(cell => cell === player)) return true;
        if (boardState.every(row => row[i] === player)) return true;
    }
    if (boardState[0][0] === player && boardState[1][1] === player && boardState[2][2] === player) return true;
    if (boardState[0][2] === player && boardState[1][1] === player && boardState[2][0] === player) return true;

    return false;
}