const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');
const app = express();
const port = 3001;

// Configuration de la connexion à la base de données PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'morpion',
  password: 'password',
  port: 5432,
});

// Configuration de la connexion à Redis
const redisClient = redis.createClient();
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});
redisClient.on('error', (err) => {
  console.log('Redis error: ', err);
});

app.use(cors());
app.use(express.json());

// Fonction pour vérifier le gagnant
function checkWinner(board) {
  const lines = [
    [board[0][0], board[0][1], board[0][2]],
    [board[1][0], board[1][1], board[1][2]],
    [board[2][0], board[2][1], board[2][2]],
    [board[0][0], board[1][0], board[2][0]],
    [board[0][1], board[1][1], board[2][1]],
    [board[0][2], board[1][2], board[2][2]],
    [board[0][0], board[1][1], board[2][2]],
    [board[0][2], board[1][1], board[2][0]],
  ];

  for (const line of lines) {
    if (line[0] && line[0] === line[1] && line[1] === line[2]) {
      return line[0];
    }
  }

  return null;
}

// Créer une nouvelle partie
app.post('/api/games', async (req, res) => {
  const initialState = JSON.stringify([['', '', ''], ['', '', ''], ['', '', '']]);
  const initialPlayer = 'X';
  const result = await pool.query('INSERT INTO games (state, player) VALUES ($1, $2) RETURNING id', [initialState, initialPlayer]);
  const gameId = result.rows[0].id;

  // Incrémenter le compteur de parties jouées dans Redis
  redisClient.incr('gamesPlayed', (err, reply) => {
    if (err) {
      console.error('Error incrementing gamesPlayed in Redis:', err);
    }
  });

  res.status(201).json({ id: gameId });
});

// Route pour jouer un coup
app.put('/api/games/:id', async (req, res) => {
  const gameId = req.params.id;
  const { row, col } = req.body;

  const result = await pool.query('SELECT * FROM games WHERE id = $1', [gameId]);
  let game = result.rows[0];
  let boardState = JSON.parse(game.state);
  let currentPlayer = game.player;

  if (boardState[row][col]) {
    return res.status(400).json({ message: 'Cell is already occupied' });
  }

  boardState[row][col] = currentPlayer;

  const winner = checkWinner(boardState);

  if (winner) {
    await pool.query('UPDATE games SET state = $1, player = $2, winner = $3 WHERE id = $4', [JSON.stringify(boardState), currentPlayer, winner, gameId]);
    return res.json({ message: `Player ${winner} has won!`, boardState, currentPlayer });
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    await pool.query('UPDATE games SET state = $1, player = $2 WHERE id = $3', [JSON.stringify(boardState), currentPlayer, gameId]);
    return res.json({ message: 'Move accepted', boardState, currentPlayer });
  }
});

// Récupérer l'état d'une partie
app.get('/api/games/:id', async (req, res) => {
  const gameId = req.params.id;
  const result = await pool.query('SELECT * FROM games WHERE id = $1', [gameId]);
  const game = result.rows[0];
  res.json(game);
});

// Récupérer le nombre de parties jouées
app.get('/api/games/count', (req, res) => {
  redisClient.get('gamesPlayed', (err, reply) => {
    if (err) {
      return res.status(500).json({ message: 'Error retrieving gamesPlayed from Redis' });
    }
    res.json({ gamesPlayed: reply });
  });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`API server listening at http://localhost:${port}`);
});
