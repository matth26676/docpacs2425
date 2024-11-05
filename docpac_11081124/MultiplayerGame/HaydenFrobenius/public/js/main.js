const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 690; // DO NOT TOUCH
canvas.height = 570;

/*
    spongebob patrick
    squidward sandy
    mr krabs
    plankton gary
*/

const lerp = (x, y, a) => x * (1 - a) + y * a;

const BOARD_WIDTH = canvas.width;
const BOARD_HEIGHT = canvas.height;
const COLS = board[0].length;
const ROWS = board.length;

const PIECE_WIDTH = (BOARD_WIDTH / COLS) / 2;
const PIECE_HEIGHT = (BOARD_HEIGHT / ROWS) / 2;

const GHOST_PIECE_OPACITY = 0.5;

const GRID_THICKNESS = 4;

const PLAYER_COLORS = ['#f00', '#00f'];

console.log(board);

let socket = io();

let ghostPiece = {
    col: 0,
    row: 0,
};

let currentTurn = 1;

let message = 'Waiting for opponent';

socket.emit('playerConnected', {gameCode: GAME_CODE});

socket.on('opponentConnected', function(data){
    alert('game start');
    startGame();
});

socket.on('newTurn', function(data){
    currentTurn = data.turn;
    message = (currentTurn === MY_TURN) ? 'Your turn' : 'Opponent\'s turn';
    ghostPiece.col = Math.round(COLS / 2);
    ghostPiece.row = 0;
});

function startGame(){
    document.addEventListener('keydown', onKeyDown);
}

function onKeyDown(event){

    if(currentTurn !== MY_TURN){
        return;
    }

    let key = event.key.toLowerCase(); // lol
    switch (key){
        case 'a':
        case 'arrowleft':
            ghostPiece.col--;
            break;
        case 'd':
        case 'arrowright':
            ghostPiece.col++;
            break;
        case ' ':
            socket.emit('dropPiece', {gameCode: GAME_CODE, col: ghostPiece.col});
            break;
    }
}

function drawGrid(){
    
    ctx.lineThickness = GRID_THICKNESS;

    for(let i = 0; i < ROWS; i++){
        for(let j = 0; j < COLS; j++){
            ctx.strokeRect(j * PIECE_WIDTH * 2, i * PIECE_HEIGHT * 2, PIECE_WIDTH * 2, PIECE_HEIGHT * 2);
        }
    }

    ctx.lineThickness = 1;

}

function drawBoard(){
    for(let i = 0; i < ROWS; i++){
        for(let j = 0; j < COLS; j++){
            let player = board[i][j];
            if(player !== 0){
                drawPiece(j, i, PLAYER_COLORS[player - 1], 1);
            }
        }
    }
}

function drawPiece(col, row, c, a){

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

function drawGhostPiece(){
    if(ghostPiece.col < 0){
        ghostPiece.col = 0;
    } else if(ghostPiece.col >= COLS){
        ghostPiece.col = COLS - 1;
    }

    drawPiece(ghostPiece.col, ghostPiece.row, PLAYER_COLORS[currentTurn - 1], GHOST_PIECE_OPACITY);
}

function drawMessage(){
    ctx.font = '30px Arial';
    ctx.fillText(message, 10,30);
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBoard();
    drawGrid();
    drawGhostPiece();
    drawMessage();

    requestAnimationFrame(update);
}

update();