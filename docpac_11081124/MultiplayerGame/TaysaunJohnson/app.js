const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

function newGameState() {
    return {
        ball: {
            x: {
                speed: 0,
                position: 683,
                direction: 'none'
            },
            y: {
                speed: 0,
                position: 392,
                direction: 'none'
            },
            r: 12,
            speed: 0,
            angle: 0,
            ray: {
                beginX: 0,
                beginY: 0,
                x: 0,
                y: 0
            }
        },
        players: {
            player1: {
                x: 0,
                y: 0,
                w: 20,
                h: 140,
                xdirection: '',
                ydirection: '',
                angle: 0,
                speed: 0,
                xSpeed: 0,
                ySpeed: 0,
                color: "blue",
                score: 0,
                playRay: {
                    beginX: 0,
                    beginY: 0,
                    x: 0,
                    y: 0
                }
            },
            player2: {
                x: 0,
                y: 0,
                w: 20,
                h: 140,
                xdirection: '',
                ydirection: '',
                angle: 0,
                speed: 0,
                xSpeed: 0,
                ySpeed: 0,
                color: "green",
                score: 0,
                playRay: {
                    beginX: 0,
                    beginY: 0,
                    x: 0,
                    y: 0
                }
            }
        },
        width: 1366,
        height: 784,
        goal1: 0,
        goal2: 1366,
        center: 683
    }
}

function gameLoop(state) {
    if (!state) {
        return
    }

    let ball = state.ball
    let player1 = state.players.player1
    let player2 = state.players.player2
    let goal1 = state.goal1
    let goal2 = state.goal2

    ball.speed = Math.sqrt(ball.x.speed**2 + ball.y.speed**2)

    if (playerBallCollision(player1, ball)) {
        if (player1.speed == 0) {
                if (playerBallCollision() == 'x') {
                    ball.x.speed = -ball.x.speed
                }
                if (playerBallCollision() == 'y') {
                    ball.y.speed = -ball.y.speed
                }
        } else if (player1.speed > ball.speed) {
            ball.x.speed += player1.xSpeed
            ball.y.speed += player1.ySpeed
        } else if (player1.speed < ball.speed) {
            if (ball.x.direction != player1.xdirection) {
                ball.x.speed += player1.xSpeed
                ball.x.speed = -ball.x.speed
            } 
            if (ball.y.direction != player1.ydirection) {
                ball.y.speed += player1.ySpeed
                ball.y.speed = -ball.y.speed
            } 
        }
    }

    if (ball.speed > 0) {
        ball.x.speed *= 0.99
        ball.y.speed *= 0.99
    }

    if (ball.y.position + ball.r > state.height || ball.y.position - ball.r < 0) {
        //bounce away y
        if (ball.y.position + ball.r > state.height) {
            ball.y.position = state.height - ball.r
        }
        if (ball.y.position - ball.r < 0) {
            ball.y.position = ball.r
        }
        ball.y.speed = -ball.y.speed
    }

    ball.x.position += ball.x.speed
    ball.y.position += ball.y.speed
    ball.ray.x = ball.x.position
    ball.ray.y = ball.y.position

    // console.log(player1.playRay)

    ball.ray.beginX = ball.x.position
    ball.ray.beginY = ball.y.position
    if (ball.x.speed < 0) {
        ball.ray.x = ball.ray.beginX + ball.x.speed - ball.r
    } else if (ball.x.speed > 0) {
        ball.ray.x = ball.ray.beginX + ball.x.speed + ball.r
    }
    if (ball.y.speed < 0) {
        ball.ray.y = ball.ray.beginY + ball.y.speed - ball.r
    } else if (ball.y.speed > 0) {
        ball.ray.y = ball.ray.beginY + ball.y.speed + ball.r
    }
    
    player1.playRay.beginX = ball.x.position
    player1.playRay.beginY = ball.y.position
    
    player1.playRay.x = player1.playRay.beginX - Math.cos(player1.angle) * 12 - player1.xSpeed
    player1.playRay.y = player1.playRay.beginY - Math.sin(player1.angle) * 12 - player1.ySpeed

    // console.log(player1.speed)
    
    if (player1.xSpeed > 0) {
        player1.xdirection = 'right'
    } else if (player1.xSpeed < 0) {
        player1.xdirection = 'left'
    } else {
        player1.xdirection = 'none'
    }

    if (player1.ySpeed > 0) {
        player1.ydirection = 'down'
    } else if (player1.ySpeed < 0) {
        player1.ydirection = 'up'
    } else {
        player1.ydirection = 'none'
    }

    if (ball.x.speed > 0) {
        ball.x.direction = 'right'
    } else if (ball.x.speed < 0) {
        ball.x.direction = 'left'
    } else {
        ball.x.direction = 'none'
    }

    if (ball.y.speed > 0) {
        ball.y.direction = 'down'
    } else if (ball.y.speed < 0) {
        ball.y.direction = 'up'
    } else {
        ball.y.direction = 'none'
    }

    // console.log(player1.xSpeed)

    // if (player1.ydirection == 'down' || player1.ydirection == 'none') {
    //     player1.angle = Math.acos(player1.xSpeed / player1.speed)
    // }
    // if (player1.ydirection == 'up') {
    //     player1.angle = -Math.acos(player1.xSpeed / player1.speed)
    // }

    if (player1.x + player1.w > state.width) {
        player1.x = state.width - player1.w
    }
    if (player1.y + player1.h > state.height) {
        player1.y = state.height - player1.h
    }

    if (ball.x.position - ball.r > goal2) {
        ball.x.position = 683
        ball.y.position = 392
        ball.x.speed = 0
        ball.y.speed = 0
        ball.ray.x = ball.x.position
        ball.ray.y = ball.y.position
        player1.score++;
        console.log(player1.score)
    }

    if (player1.score == 21) {
        return 1
    }

    if (player2.score == 21) {
        return 2
    }
}

function playerBallCollision(player, ball) {
    if (ball.y.position >= player.y && ball.y.position <= player.y + player.h) {
        if (ball.ray.beginX < player.x && ball.ray.x > player.x || ball.ray.beginX > player.x + player.w && ball.ray.x < player.x + player.w) {
            if (ball.x.direction == 'right' && ball.x.position > player.x + player.w) {
                ball.x.position = player.x - ball.r
            } else if (ball.x.direction == 'left' && ball.x.position < player.x) {
                ball.x.position = player.x + player.w + ball.r
            }
            return 'x'
        }
        if (player.playRay.beginX < player.x && player.playRay.x > player.x || player.playRay.beginX > player.x + player.w && player.playRay.x < player.x + player.w) {
            if (player.xdirection == 'right' && player.x > ball.x.position + ball.r) {
                player.x = ball.x.position - ball.r - player.w
            } else if (player.xdirection == 'left' && player.x < ball.x.position - ball.r - player.w) {
                player.x = ball.x.position + ball.r
            }
            return 'x'
        }
    } 
    if (ball.x.position >= player.x && ball.x.position <= player.x + player.w) {
        if (ball.ray.beginY < player.y && ball.ray.y > player.y || ball.ray.beginY > player.y + player.h && ball.ray.y < player.y + player.h) {
            if (ball.y.direction == 'down' && ball.y.position > player.y + player.h) {
                ball.y.position = player.y - ball.r
            } else if (ball.y.direction == 'up' && ball.y.position < player.y) {
                ball.y.position = player.y + player.h + ball.r
            }
            return 'y'
        }
    }
}

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index')
})

io.on('connection', (socket) => {
    console.log('connection')
    const state = newGameState()

    socket.on('mousemove', (mouseX, mouseY, xSpeed, ySpeed, speed, angle) => {
        state.players.player1.x = mouseX
        state.players.player1.y = mouseY
        state.players.player1.xSpeed = xSpeed
        state.players.player1.ySpeed = ySpeed
        state.players.player1.speed = speed
        state.players.player1.angle = angle
        // console.log(speed)
    })

    socket.emit('init', { data: 'hello world' })
    startGameInterval(socket, state)
})

function startGameInterval(socket, state) {
    const intervalID = setInterval(() => {
        const winner = gameLoop(state)

        if (!winner) {
            socket.emit('newstate', JSON.stringify(state))
        } else {
            socket.emit('gameover');
            clearInterval(intervalID)
        }
    }, 1000/60)
}


http.listen(3000, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('server running on port 3000')
    }
})