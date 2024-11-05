class Board {
    constructor(rows, cols){
        this.rows = rows;
        this.cols = cols;
        this.board = new Array(rows).fill(0).map(() => new Array(cols).fill(0));
    }

    dropPiece(col, turn){
        let row = this.getLowestAvailableRow(col);
        if(row === -1){
            return;
        }
        this.board[row][col] = turn;
    }

    getLowestAvailableRow(col){
        for(let i = ROWS - 1; i >= 0; i--){
            if(this.board[i][col] === 0){
                return i;
            }
        }
        return -1;
    }
}

module.exports = {
    Board
}