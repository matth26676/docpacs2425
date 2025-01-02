const { log } = require('console');
const express = require('express');
const { setTimeout } = require('timers/promises');
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
const minPlayerCount = 2
const maxPlayerCount = 4
const buttonCount = 551
var gameRunning = false
var gameOver = true
var initRunning = false
var time = 0
var scoreList = []
var buttonList = []
for (i = 0; i < buttonCount; i++) {
  buttonList[i] = 0
}
userList = []
playerNumberList = []

app.use(express.static('public'))

app.get('/', function (req, res) {
  res.sendFile('index.html');
});

io.on('connection', (socket) => {
  console.log('user connected');
  userList.push(socket.client.id)
  if (!initRunning) {
    initGame()
  }
  socket.on('senddata', function (message) {
    
    for (user in playerNumberList) {
      if (playerNumberList[user] == socket.client.id) {
        message.buttonValue = parseInt(user) + 1
        
      }
    }
    buttonList[message.buttonNumber] = message.buttonValue
    io.emit("recievedata", { buttonNumber: message.buttonNumber, buttonValue: buttonList[message.buttonNumber] })
  })

  socket.on('disconnect', function () {
    for (user in userList) {
      if (userList[user] == socket.client.id) {
        userList.splice(user, 1)
      }
    }
    console.log('user disconnected');
  });
})
server.listen(port, function () {
  console.log(`Listening on port ${port}`);
});



function initGame() {
  if (io.engine.clientsCount >= minPlayerCount && !gameRunning) {
    initRunning = true
    if (!gameOver) {
      gameRunning = true
      scoreList = []
      for (user in userList) {
        scoreList[user] = 0
      }
      time = 30;
      for (user in userList) {
        playerNumberList.splice(user, 1, userList[user])
        io.emit("recievedata", { playerNumber: user} )
      }

      var gameId = setInterval(() => { runGame(io, gameId) }, 1000);
    } else {
          gameOver = false
          initGame()
        }
    }
    initRunning = false
  }

function runGame(io, gameId) {
  if (time > 0) {
    time--
    console.log(time)

    io.emit("recievedata", { time: time})

    for (buttonNumber in buttonList) {
      io.emit("recievedata", { buttonNumber: buttonNumber, buttonValue: buttonList[buttonNumber] })
    }
  } else {
    for (user in userList) {
      for (score in buttonList) {
        if (buttonList[score] == parseInt(user) + 1) {
          scoreList[user]++
        }
      }
    }
    
    gameRunning = false
    gameOver = true
    for (user in playerNumberList) {
      playerNumberList.splice(user, 1)
    }
    io.emit("recievedata", { scoreList: scoreList, userList: userList})
    io.emit("recievedata", { clearboard: true})
    for (button in buttonList) {
      buttonList[button] = 0
      io.emit("recievedata", { buttonNumber: button, buttonValue: buttonList[button] })
    }
  
    clearInterval(gameId)
    initGame()
  }
}
