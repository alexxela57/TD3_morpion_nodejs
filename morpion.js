const express = require('express');
const app = express();
const port = 3000;
const { Pool } = require('pg');

// Configuration de la connexion à la base de données PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'morpion', // le nom de votre base de données
  password: 'password',
  port: 5432, // le port par défaut de PostgreSQL
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('home', { title: 'Accueil' });
});

app.post('/new-game', async (req, res) => {
  const initialState = JSON.stringify([['', '', ''], ['', '', ''], ['', '', '']]);
  const initialPlayer = 'X';
  const result = await pool.query('INSERT INTO games (state, player) VALUES ($1, $2) RETURNING id', [initialState, initialPlayer]);
  const gameId = result.rows[0].id;
  res.redirect(`/game/${gameId}`);
});

app.get('/game/:id', async (req, res) => {
  const gameId = req.params.id;
  const result = await pool.query('SELECT * FROM games WHERE id = $1', [gameId]);
  const game = result.rows[0];
  res.render('index', { title: 'Morpion', currentPlayer: game.player, boardState: JSON.parse(game.state), gameId });
});

app.post('/game/:id', async (req, res) => {
  const gameId = req.params.id;
  const { cell } = req.body;
  const [row, col] = cell.split('-').map(Number);

  const result = await pool.query('SELECT * FROM games WHERE id = $1', [gameId]);
  let game = result.rows[0];
  let boardState = JSON.parse(game.state);
  let currentPlayer = game.player;

  boardState[row][col] = currentPlayer;

  if (checkWinner(boardState, currentPlayer)) {
    res.render('win', { winner: currentPlayer });
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    await pool.query('UPDATE games SET state = $1, player = $2 WHERE id = $3', [JSON.stringify(boardState), currentPlayer, gameId]);
    res.render('index', { title: 'Morpion', currentPlayer, boardState, gameId });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

function checkWinner(board, player) {
  for (let i = 0; i < 3; i++) {
    if (board[i].every(cell => cell === player)) return true;
    if (board.every(row => row[i] === player)) return true;
  }
  if (board[0][0] === player && board[1][1] === player && board[2][2] === player) return true;
  if (board[0][2] === player && board[1][1] === player && board[2][0] === player) return true;
  return false;
}

