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

const PIECE_SIZE = BOARD_WIDTH / COLS;

const GRID_THICKNESS = 4;

let board = new Array(ROWS).fill(0).map(() => new Array(COLS).fill(0));

let socket = io();

let mouseX = 0;
let mouseY = 0;

socket.on('playerConnected', function (data) {

});

socket.on('playerDisconnected', function (data) {

});

function gameStart(){
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('click', onClick);
}

function onMouseMove(event){
    let rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
}

function onClick(event){
        
}

function drawBoard(){
    
    ctx.lineThickness = GRID_THICKNESS;
    let pieceWidth = BOARD_WIDTH / COLS;
    let pieceHeight = BOARD_HEIGHT / ROWS;
    for(let i = 0; i < ROWS; i++){
        for(let j = 0; j < COLS; j++){
            ctx.strokeRect(j * pieceWidth, i * pieceHeight, pieceWidth, pieceHeight);
        }
    }

}

function drawPiece(x,y,c,a){
    ctx.beginPath();
    ctx.arc(x + PIECE_SIZE / 2, y + PIECE_SIZE / 2, PIECE_SIZE/2, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.alpha = a;
    ctx.fill();
    ctx.closePath();
    ctx.alpha = 1;
    ctx.fillStyle = '#000';
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawPiece(0,0,'#f00', 0.5);
    requestAnimationFrame(update);
}
update();
gameStart();