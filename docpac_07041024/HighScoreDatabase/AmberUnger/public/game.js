var score = 0;
var direction = 0;
var timer = 21;
var laststate = false;
var way = "";
var isPressed = false;
var wasPressed = false;

// Function to refresh the page
function refreshPage(){
    window.location.reload();
}

// Change direction every 2 seconds
setInterval(() => {
    if (timer > 0) {
        way = Math.floor(Math.random() * 4);
        let directionImage = document.getElementById("direction-image");
        if (way === 0) {
            way = "up";
            directionImage.src = "up.gif";
        } else if (way === 2) {
            way = "down";
            directionImage.src = "down.gif";
        } else if (way === 3) {
            way = "left";
            directionImage.src = "left.gif";
        } else if (way === 1) {
            way = "right";
            directionImage.src = "right.gif";
        }
        document.getElementById("directionbox").innerHTML = "Direction = " + way;
    } else if (timer == 0) {
        let directionImage = document.getElementById("direction-image");
        document.getElementById("directionbox").innerHTML = "Game Over"
        directionImage.src = "go.gif";

    } else {
        let directionImage = document.getElementById("direction-image");
        document.getElementById("directionbox").innerHTML = "Game Over";
        directionImage.src = "go.gif";
    }
}, 2000);

// When a gamepad is connected
window.addEventListener('gamepadconnected', (event) => {
    const update = () => {
        const output = document.getElementById('axes');
        output.innerHTML = ''; // clear the output

        for (const gamepad of navigator.getGamepads()) {
            if (!gamepad) continue;

            if (gamepad.buttons[9].pressed) {
                window.location.reload();
            }

            if (gamepad.buttons[0].pressed != wasPressed) {
                wasPressed = gamepad.buttons[0].pressed;
                if (wasPressed) { // button pressed code
                    switch (true) {
                        case (gamepad.axes[1] <= -0.8 && way == "up" && timer > 0):
                            score++;
                            break;
                        case (gamepad.axes[1] >= 0.8 && way == "down" && timer > 0):
                            score++;
                            break;
                        case (gamepad.axes[0] == 1 && way == "right" && timer > 0):
                            score++;
                            break;
                        case (gamepad.axes[0] == -1 && way == "left" && timer > 0):
                            score++;
                            break;
                    }
                }
            }
            document.getElementById("scorebox").innerHTML = "Score = " + score;
        }
        requestAnimationFrame(update);
    };
    update();
});

// Decrease the timer every second
setInterval(() => {
    if (timer > 0) {
        timer--;
    }
    document.getElementById("timerbox").innerHTML = "Time = " + timer;
}, 1000);