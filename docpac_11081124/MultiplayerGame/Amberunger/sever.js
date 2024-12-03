const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const app = express();

// Middleware and routes can be added here
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    return res.sendFile(path.join(__dirname, 'index.html'));
});

const server = http.createServer(app);
const io = socketio(server);

let players = [];
let games = [];

io.on("connection", (socket) => {
    console.log('New WebSocket connection');

    socket.on("find", (e) => {
        if (e.name) {
            players.push({ id: socket.id, name: e.name });

            if (players.length >= 2) {
                const player1 = players.shift();
                const player2 = players.shift();

                const game = {
                    id: `${player1.id}-${player2.id}`,
                    player1: { ...player1, symbol: 'X' },
                    player2: { ...player2, symbol: 'O' },
                    turn: 'X',
                    board: Array(9).fill(null)
                };

                games.push(game);

                io.to(player1.id).emit('startGame', { opponent: player2.name, symbol: 'X', gameId: game.id });
                io.to(player2.id).emit('startGame', { opponent: player1.name, symbol: 'O', gameId: game.id });
            }
        }
    });

    socket.on('makeMove', ({ gameId, index, symbol }) => {
        const game = games.find(g => g.id === gameId);
        if (game && game.board[index] === null) {
            const currentPlayer = game.turn === 'X' ? game.player1 : game.player2;
            if (socket.id === currentPlayer.id) {
                game.board[index] = symbol;
                game.turn = game.turn === 'X' ? 'O' : 'X';

                io.to(game.player1.id).emit('moveMade', { index, symbol, turn: game.turn });
                io.to(game.player2.id).emit('moveMade', { index, symbol, turn: game.turn });

                const winner = checkWinner(game.board);
                if (winner) {
                    io.to(game.player1.id).emit('gameOver', { winner });
                    io.to(game.player2.id).emit('gameOver', { winner });
                    games = games.filter(g => g.id !== game.id); // Remove finished game
                } else if (game.board.every(cell => cell !== null)) {
                    io.to(game.player1.id).emit('gameOver', { winner: 'Draw' });
                    io.to(game.player2.id).emit('gameOver', { winner: 'Draw' });
                    games = games.filter(g => g.id !== game.id); // Remove finished game
                }
            }
        }
    });

    socket.on('disconnect', () => {
        players = players.filter(player => player.id !== socket.id);
        games = games.filter(game => game.player1.id !== socket.id && game.player2.id !== socket.id);
        console.log('User disconnected');
    });

    // Handle socket errors
    socket.on('error', (err) => {
        console.error('Socket error:', err);
    });
});

// Handle server errors
server.on('error', (err) => {
    console.error('Server error:', err);
});

const checkWinner = (board) => {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    return null;
};
const localMachineIP = '172.16.3.122';
const PORT = process.env.PORT || 4040;
server.listen(4040, localMachineIP, () => {
    console.log(`Server is running on http://${localMachineIP}:4040`);
});