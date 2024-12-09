class Board {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.board = new Array(rows).fill(0).map(() => new Array(cols).fill(0));
    }

    dropPiece(col, row, turn) {
        //let row = this.getLowestAvailableRow(col);
        if (row === -1) {
            return;
        }
        this.board[row][col] = turn;
    }

    getLowestAvailableRow(col) {
        for (let i = this.rows - 1; i >= 0; i--) {
            if (this.board[i][col] === 0) {
                return i;
            }
        }
        return -1;
    }

    getCell(col, row) {
        if (col < 0 || col > this.cols - 1 || row < 0 || row > this.rows - 1) {
            return -1;
        }

        return this.board[row][col];
    }

    checkFull(){
        for (let i = 0; i < this.cols; i++) {
            if (this.board[0][i] === 0) {
                return false;
            }
        }
        return true;
    }

    checkWin() {
        let board = this.board;

        //not efficient at all but it ok
        for (let r = 0; r < board.length; r++) { // loops through every cell
            for (let c = 0; c < board[r].length; c++) {

                let turn = board[r][c];

                if (turn === 0) {
                    continue;
                }

                // horizontal
                if (this.getCell(c + 1, r) === turn &&
                    this.getCell(c + 2, r) === turn &&
                    this.getCell(c + 3, r) === turn) {
                    return turn;
                }

                // verticle
                if (this.getCell(c, r + 1) === turn &&
                    this.getCell(c, r + 2) === turn &&
                    this.getCell(c, r + 3) === turn) {
                    return turn;
                }

                // right diagonal
                if (this.getCell(c + 1, r + 1) === turn &&
                    this.getCell(c + 2, r + 2) === turn &&
                    this.getCell(c + 3, r + 3) === turn) {
                    return turn;
                }

                // left diagonal
                if (this.getCell(c - 1, r + 1) === turn &&
                    this.getCell(c - 2, r + 2) === turn &&
                    this.getCell(c - 3, r + 3) === turn) {
                    return turn;
                }

            }
        }

        return false;
    }
}

module.exports = {
    Board
}