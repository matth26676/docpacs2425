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
const COLS = 7;
const ROWS = 6;

const PIECE_WIDTH = (BOARD_WIDTH / COLS) / 2;
const PIECE_HEIGHT = (BOARD_HEIGHT / ROWS) / 2;

const GHOST_PIECE_OPACITY = 0.5;

const GRID_THICKNESS = 4;

const PLAYER_COLORS = ['#f00', '#00f'];

let board = new Array(ROWS).fill(0).map(() => new Array(COLS).fill(0));

let socket = io();

let ghostPiece = {
    col: 0,
    row: 0,
};

let currentTurn = 1;

socket.on('playerConnected', function (data) {

});

socket.on('playerDisconnected', function (data) {

});

function gameStart(){
    document.addEventListener('keydown', onKeyDown);
}

function onKeyDown(event){
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
            dropPiece(ghostPiece.col);
            break;
    }
}

function getLowestAvailableRow(col){
    for(let i = ROWS - 1; i >= 0; i--){
        if(board[i][col] === 0){
            return i;
        }
    }
    return -1;
}

function dropPiece(col){
    let row = getLowestAvailableRow(col);
    if(row === -1){
        return;
    }
    board[row][col] = currentTurn;

    currentTurn = currentTurn === 1 ? 2 : 1;
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

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawGrid();

    if(ghostPiece.col < 0){
        ghostPiece.col = 0;
    } else if(ghostPiece.col >= COLS){
        ghostPiece.col = COLS - 1;
    }

    ghostPiece.row = getLowestAvailableRow(ghostPiece.col);
    drawPiece(ghostPiece.col, ghostPiece.row, PLAYER_COLORS[currentTurn - 1], GHOST_PIECE_OPACITY);
    requestAnimationFrame(update);
}
update();
gameStart();