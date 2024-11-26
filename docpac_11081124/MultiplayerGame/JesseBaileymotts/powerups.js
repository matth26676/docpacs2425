//powerups are given to boxes by players

class Powerup { // abstract class

    constructor(boxID, player, boardSize){
        this.name = "Powerup";
        this.boxID = boxID;
        this.player = player;
        this.boardSize = boardSize;
        this.boardRows = Math.sqrt(this.boardSize);
        this.boardCols = Math.sqrt(this.boardSize);
        this.boxCoords = this.boxIDToCoords(this.boxID);
        this.toBeRemoved = false;
        // if this powerup can be overwritten by another player attempting to place a powerup on the same button
        // This is just a flag used by outside code. Has no use within this class.
        this.isOverwritable = false;
    }

    removePowerup(){ // just some abstraction
        this.toBeRemoved = true;
    }

    onUse(gameState){ // ran when a powerup is created
    }

    onClick(gameState){ // ran when a button with a powerup is clicked
    }

    //helper functions
    
    coordsToBoxID(col, row) {
        const boardSize = this.boardSize;
        const boardCols = this.boardCols;
        const boardRows = this.boardRows;
        // Normalize col and row to be within the bounds 0 to 7 using positive modulo
        col = ((col % boardCols) + boardCols) % boardCols;  // This ensures col is always between 0 and 7
        row = ((row % boardRows) + boardRows) % boardRows;  // This ensures row is always between 0 and 7
    
        const boxID = row * boardCols + col;  // Calculate boxID based on row and col
        return boxID + 1;
    }

    boxIDToCoords(boxID) {
        const boardSize = this.boardSize;
        const boardCols = this.boardCols;
        const boardRows = this.boardRows;
        // Normalize boxID to be within the range 0 to 63 using positive modulo
        boxID = (((boxID % boardSize) + boardSize) % boardSize) - 1;  // This ensures the boxID is always between 0 and 63
        const col = boxID % boardCols;  // Column is the remainder of boxID divided by the number of cols.
        const row = Math.floor(boxID / boardRows);  // Row is the quotient of boxID divided by the number of rows.
        return {col, row};
    }
    
}

class InkRoller extends Powerup{
    constructor(boxID, player, boardSize){
        super(boxID, player, boardSize);
        this.name = "InkRoller";
    }

    onUse(gameState){

        const color = this.player.color;
        const boxID = this.boxID;

        const coords = this.boxCoords;
        //coords for up, down, left, right
        const directions = [{col: coords.col, row: coords.row-1}, {col: coords.col, row: coords.row+1}, {col: coords.col-1, row: coords.row},{col: coords.col+1, row: coords.row}]

        gameState[boxID].color = color; // center

        //loops through all the directions and places the color at the coordinates
        for(let d of directions){
            gameState[this.coordsToBoxID(d.col, d.row)].color = color;
        }

        this.removePowerup() // Remove this powerup after it creates the splat.

    }
}

class InkWall extends Powerup{
    constructor(boxID, player, boardSize){
        super(boxID, player, boardSize);

        this.name = "InkWall";
        this.size = 3;
        this.time = 5; //5 seconds
    }

    onUse(gameState){

        const color = this.player.color;
        const boxID = this.boxID;

        const coords = this.boxCoords;

        const startingRowOffset = Math.floor(this.size/2);
        const startingColOffset = Math.floor(this.size/2);

        let changedBoxes = [];

        //does the thing
        for(let row = 0; row < this.size; row++){
            for(let col = 0; col < this.size; col++){
                let boxID = this.coordsToBoxID(coords.col + col - startingColOffset, coords.row + row - startingRowOffset);
                let box = gameState[boxID];
                box.disabled = true;
                changedBoxes.push(box);
            }
        }

        //unlock the buttons and remove the powerup after 5 seconds
        setTimeout(() => { this.unlock(changedBoxes) }, this.time * 1000);

    }

    unlock(changedBoxes){
        for(let box of changedBoxes){
            box.disabled = false;
        }

        this.removePowerup();

    }
}

class InkMine extends Powerup {
    constructor(boxID, player, boardSize){
        super(boxID, player, boardSize);

        this.name = "InkMine";
        this.size = 3;

    }

    onUse(gameState){
        /*const color = this.player.color;
        const boxID = this.boxID;
        gameState[boxID].color = color;*/
    }

    onClick(gameState){

        const color = this.player.color;
        const boxID = this.boxID;

        const coords = this.boxCoords;

        //coords for up, down, left, right
        const directions = [{col: coords.col, row: coords.row-1}, {col: coords.col, row: coords.row+1}, {col: coords.col-1, row: coords.row},{col: coords.col+1, row: coords.row}]

        gameState[boxID].color = color; // center

        //loops through all the directions and places the color at the coordinates
        for(let d of directions){
            gameState[this.coordsToBoxID(d.col, d.row)].color = color;
        }

        this.removePowerup();

    }
}

module.exports = {
    Powerup,
    InkRoller,
    InkWall,
    InkMine
}