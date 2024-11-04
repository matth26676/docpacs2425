const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const lerp = (x, y, a) => x * (1 - a) + y * a;

const PIECE_SIZE = 120;

const BOARD_WIDTH = canvas.width;
const BOARD_HEIGHT = canvas.height - PIECE_SIZE;
const COLS = 7;
const ROWS = 6;

let socket = io();
let character = `<%- character %>`;

socket.on('playerConnected', function (data) {

});

socket.on('playerDisconnected', function (data) {

});

canvas.addEventListener('click', function (event) {
    
});

function drawBoard(){
    ctx.fillStyle = '#0073e6';
    ctx.fillRect(0, PIECE_SIZE, BOARD_WIDTH, BOARD_HEIGHT);


    //ctx.globalCompositeOperation = 'destination-out';

    ctx.beginPath();
    for(let i = 0; i < COLS; i++){
        for(let j = 0; j < ROWS; j++){
            ctx.arc(PIECE_SIZE * i, PIECE_SIZE * j, PIECE_SIZE / 2, 0, 2 * Math.PI);
        }
    }
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
}

function update() {
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    requestAnimationFrame(update);
}
update();