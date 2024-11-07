const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 690; // DO NOT TOUCH
canvas.height = 570;

let modal = document.getElementById('modal');
let modalText = document.getElementById('modal-text');

/*
    spongebob patrick
    squidward sandy
    mr krabs
    plankton gary
*/

const lerp = (x, y, a) => x * (1 - a) + y * a;
const clamp = (x, i, a) => (x < i) ? i : (x > a) ? a : x;

const BOARD_WIDTH = canvas.width;
const BOARD_HEIGHT = canvas.height;
let COLS;
let ROWS;

let PIECE_WIDTH;
let PIECE_HEIGHT;

let GHOST_PIECE_OPACITY = 0.5;

let GRID_THICKNESS = 4;

let PLAYER_COLORS = ['#f00', '#00f'];

let socket = io();

let ghostPiece = {
    col: 0,
    row: 0,
};

let currentTurn = 1;
let gameRunning = false;

let board;
let myTurn;

let message = 'Waiting for opponent';

socket.emit('playerConnected', { gameCode: GAME_CODE });

socket.on('init', function (data) {
    board = data.board;
    myTurn = data.myTurn;
    console.log(board);

    COLS = board[0].length;
    ROWS = board.length;

    PIECE_WIDTH = (BOARD_WIDTH / COLS) / 2;
    PIECE_HEIGHT = (BOARD_HEIGHT / ROWS) / 2;
});

socket.on('opponentConnected', function (data) {
});

socket.on('hostDisconnected', function (data) {
    endGame('Host Disconnected');
});

socket.on('opponentDisconnected', function (data) {
    endGame('Opponent Disconnected');
});

socket.on('startGame', startGame);


socket.on('newTurn', function (data) {
    currentTurn = data.turn;
    message = (currentTurn === myTurn) ? 'Your turn' : 'Opponent\'s turn';
    ghostPiece.col = Math.floor(COLS / 2);
    ghostPiece.row = 0;
});

socket.on('moveGhostPiece', function (data) {
    ghostPiece.col = data.col;
});

socket.on('updateBoard', function (data) {
    board = data.newBoard;
});

socket.on('win', function (data) {
    let winner = (data.winner === myTurn) ? 'You' : 'Opponent';
    let grammar = (data.winner === myTurn) ? '' : 's';
    endGame(`${winner} Win${grammar}`);
});

function startGame(data) {
    hideModal();
    board = data.board;
    document.addEventListener('keydown', onKeyDown);
    gameRunning = true;
}

function endGame(outcomeMessage) {

    if (!gameRunning) return

    message = '';
    showModal(outcomeMessage);

    gameRunning = false;
}

function showModal(text) {
    modalText.innerText = text;
    modal.style.display = 'block';
}

function hideModal() {
    modal.style.display = 'none';
}

function onKeyDown(event) {

    if (currentTurn !== myTurn || !gameRunning) {
        return;
    }

    let key = event.key.toLowerCase(); // lol
    switch (key) {
        case 'a':
        case 'arrowleft':
            // decrements and clamps
            ghostPiece.col = clamp(ghostPiece.col - 1, 0, COLS - 1);
            socket.emit('ghostPieceMove', { gameCode: GAME_CODE, col: ghostPiece.col });
            break;
        case 'd':
        case 'arrowright':
            // increments and clamps
            ghostPiece.col = clamp(ghostPiece.col + 1, 0, COLS - 1);
            socket.emit('ghostPieceMove', { gameCode: GAME_CODE, col: ghostPiece.col });
            break;
        case ' ':
            socket.emit('pieceDrop', { gameCode: GAME_CODE, col: ghostPiece.col, turn: myTurn });
            break;
    }
}

function getLowestAvailableRow(col) {
    for (let i = ROWS - 1; i >= 0; i--) {
        if (board[i][col] === 0) {
            return i;
        }
    }
    return -1;
}

function drawGrid() {

    ctx.lineThickness = GRID_THICKNESS;

    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            ctx.strokeRect(j * PIECE_WIDTH * 2, i * PIECE_HEIGHT * 2, PIECE_WIDTH * 2, PIECE_HEIGHT * 2);
        }
    }

    ctx.lineThickness = 1;

}

function drawBoard() {
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            let player = board[i][j];
            if (player !== 0) {
                drawPiece(j, i, PLAYER_COLORS[player - 1], 1);
            }
        }
    }
}

function drawPiece(col, row, c, a) {

    let x = col * (PIECE_WIDTH * 2);
    let y = row * (PIECE_HEIGHT * 2);
    ctx.beginPath();
    ctx.arc(x + PIECE_WIDTH, y + PIECE_HEIGHT, PIECE_WIDTH, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.globalAlpha = a;
    ctx.fill();
    ctx.closePath();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000';
}

function drawGhostPiece() {

    ghostPiece.row = getLowestAvailableRow(ghostPiece.col);
    let color = PLAYER_COLORS[currentTurn - 1];

    drawPiece(ghostPiece.col, ghostPiece.row, color ? color : '#000', GHOST_PIECE_OPACITY);
}

function drawMessage() {
    ctx.font = '30px Arial';
    ctx.fillText(message, 10, 30);
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBoard();
    drawGrid();
    if (gameRunning) drawGhostPiece();
    drawMessage();
    console.log('crazy');
    requestAnimationFrame(update);
}

update();