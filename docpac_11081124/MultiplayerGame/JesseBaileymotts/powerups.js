// Powerups are given to boxes by players

// Create an abstract powerup class that will be inherited by all powerups
class Powerup {
    // The constructor takes in the boxID of the button that the powerup is placed on, the player that placed the powerup, and the size of the board
    constructor(boxID, player, boardSize){
        // Set all the required information for the powerup
        this.name = "Powerup";
        this.boxID = boxID;
        this.player = player;
        this.boardSize = boardSize;
        this.boardRows = Math.sqrt(this.boardSize);
        this.boardCols = Math.sqrt(this.boardSize);
        this.boxCoords = this.boxIDToCoords(this.boxID);
        this.toBeRemoved = false;
        // Decideds if this powerup can be overwritten by another player attempting to place a powerup on the same button
        // This is just a flag used by outside code. Has no use within this class
        this.isOverwritable = false;
    };
    // Create an abstract function to set the powerup to be removed
    removePowerup() {
        this.toBeRemoved = true;
    };
    // Run when a powerup is used
    onUse(gameState) {
    };
    // Run when a box with a powerup is clicked
    onClick(gameState) {
    };
    //// Helper Functions
    // Create a function to convert coordinates to boxID
    coordsToBoxID(col, row) {
        // Get the size of the board and the number of rows and columns
        const boardSize = this.boardSize;
        const boardCols = this.boardCols;
        const boardRows = this.boardRows;
        // Normalize col and row to be within the bounds 0 to 7 using positive modulo
        col = ((col % boardCols) + boardCols) % boardCols;  // This ensures col is always between 0 and 7
        row = ((row % boardRows) + boardRows) % boardRows;  // This ensures row is always between 0 and 7
        // Calculate boxID based on the row and column and return it
        const boxID = row * boardCols + col;
        return boxID + 1;
    };
    // Create a function to convert boxID to coordinates
    boxIDToCoords(boxID) {
        // Get the size of the board and the number of rows and columns
        const boardSize = this.boardSize;
        const boardCols = this.boardCols;
        const boardRows = this.boardRows;
        // Normalize boxID to be within the range 0 to 63 using positive modulo
        boxID = (((boxID % boardSize) + boardSize) % boardSize) - 1;  // This ensures the boxID is always between 0 and 63
        const col = boxID % boardCols;  // Column is the remainder of boxID divided by the number of cols
        const row = Math.floor(boxID / boardRows);  // Row is the quotient of boxID divided by the number of rows
        // Return the column and row
        return {col, row};
    };
};
// Create a class for the InkRoller powerup from the abstract Powerup class
class InkRoller extends Powerup {
    constructor(boxID, player, boardSize){
        // Call the constructor of the Powerup class
        super(boxID, player, boardSize);
        // Set the name of the powerup to InkRoller
        this.name = "InkRoller";
    }
    // On using the power up...
    onUse(gameState){
        // Set the color of the player and the box ID the powerup is used on
        const color = this.player.color;
        const boxID = this.boxID;
        // Set the coordinates of the box
        const coords = this.boxCoords;
        // Coords for up, down, left, and right, respectively
        const directions = [
            {col: coords.col, row: coords.row-1}, // Up
            {col: coords.col, row: coords.row+1}, // Down
            {col: coords.col-1, row: coords.row}, // Right
            {col: coords.col+1, row: coords.row}  // Left
        ];
        // Set the color of the box the powerup is used on
        gameState[boxID].color = color; // Center
        // For each direction... 
        for (let d of directions) {
            // Set the color of the box in that direction
            gameState[this.coordsToBoxID(d.col, d.row)].color = color;
        };
        // Remove the powerup after it is used
        this.removePowerup();
    };
};
// Create a class for the InkWall powerup from the abstract Powerup class
class InkWall extends Powerup{
    constructor(boxID, player, boardSize) {
        // Call the constructor of the Powerup class
        super(boxID, player, boardSize);
        // Set the name of the powerup to InkWall
        this.name = "InkWall";
        // Set the size of the wall to a 3 and the duration to 5 seconds
        this.size = 3; // 3 x 3 wall
        this.time = 5;
    };
    // On using the powerup...
    onUse(gameState){
        // Set the color of the player and the box ID the powerup is used on
        const color = this.player.color;
        const boxID = this.boxID;
        // Set the coordinates of the box
        const coords = this.boxCoords;
        // Set the starting row and column offsets by dividing the size of the powerup by 2
        const startingRowOffset = Math.floor(this.size/2);
        const startingColOffset = Math.floor(this.size/2);
        // Create an empty array to store the boxes that are changed
        let changedBoxes = [];
        // Let row be 0. If the row is less than the size, increment row by one and...
        for (let row = 0; row < this.size; row++) {
            // Let col be 0. If the col is less than the size, increment col by one and...
            for (let col = 0; col < this.size; col++) {
                // Get the box ID of the box at the new row and column
                let boxID = this.coordsToBoxID(coords.col + col - startingColOffset, coords.row + row - startingRowOffset);
                // Set the box to the game's state at that box's ID
                let box = gameState[boxID];
                // Disable the box and push it to the changed boxes
                box.disabled = true;
                changedBoxes.push(box);
            };
        };
        // Set a timeout to unlock the boxes after the time
        setTimeout(() => { this.unlock(changedBoxes) }, this.time * 1000);
    };
    // Set a function to unlock the boxes
    unlock(changedBoxes) {
        // For each box in changed boxes...
        for (let box of changedBoxes) {
            // Enable the box
            box.disabled = false;
        };
        // Remove the powerup after it is used
        this.removePowerup();
    };
};
// Create a class for the InkMine powerup from the abstract Powerup class
class InkMine extends Powerup {
    constructor(boxID, player, boardSize){
        // Call the constructor of the Powerup class
        super(boxID, player, boardSize);
        // Set the name of the powerup to InkMine
        this.name = "InkMine";
        // Set the size of the mine to 3
        this.size = 3;
    };
    // On clicking the box with the powerup...
    onClick(gameState){
        // Set the color of the player and the box ID the powerup is used on
        const color = this.player.color;
        const boxID = this.boxID;
        // Set the coordinates of the box
        const coords = this.boxCoords;
        // If the player that placed the powerup is the same as the player that clicked the box, return
        if (this.player === gameState[boxID].player) return;
        // Coords for up, down, left, and right, respectively
        const directions = [
            {col: coords.col, row: coords.row-1}, // Up
            {col: coords.col, row: coords.row-2}, // Up 2
            {col: coords.col, row: coords.row+1}, // Down
            {col: coords.col, row: coords.row+2}, // Down 2
            {col: coords.col-1, row: coords.row}, // Right
            {col: coords.col-2, row: coords.row}, // Right 2
            {col: coords.col+1, row: coords.row},  // Left
            {col: coords.col+2, row: coords.row},  // Left 2
            {col: coords.col-1, row: coords.row-1}, // Up Right
            {col: coords.col-1, row: coords.row+1}, // Down Right
            {col: coords.col+1, row: coords.row-1}, // Up Left
            {col: coords.col+1, row: coords.row+1}  // Down Left
        ];
        // Set the color of the box the powerup is used on
        gameState[boxID].color = color; // Center
        // For each direction...
        for(let d of directions){
            // Set the color of the box in that direction
            gameState[this.coordsToBoxID(d.col, d.row)].color = color;
        }
        // Remove the powerup after it is used
        this.removePowerup();
    };
};
// Export the powerups
module.exports = {
    Powerup,
    InkRoller,
    InkWall,
    InkMine
}