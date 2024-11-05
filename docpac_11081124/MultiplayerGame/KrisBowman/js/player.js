export default class Player {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = red;
        this.score = 0;
    }

    draw(ctx) {
        // Draw player paddle
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw player's score
        ctx.font = "20px Arial";
        ctx.fillStyle = "black";  //adjust score color if needed
        const scorePositionX = this.x < 400 
            ? 370 - ((this.score.toString().length - 1) * 12)  //left side
            : 420;  //right side
        ctx.fillText(this.score, scorePositionX, 30);

        const boundaryX = this.x < 400 ? 790 : 0; //draw boundary line
        ctx.fillRect(boundaryX, 0, 10, 500);
    }
}
