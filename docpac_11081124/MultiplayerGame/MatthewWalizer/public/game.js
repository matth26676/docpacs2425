
var buttonList = []
var userList = []

const socket = io();
socket.on('recievedata', function (message) {
    for (data in message) {
        if (message.scoreList) {
            console.log(message.scoreList);
            console.log(message.userList);


            document.getElementById('scoreBox').innerHTML = ''
            for (user in userList) {
                document.getElementById('scoreBox').innerHTML += 'Player' + (parseInt(user) + 1) + ': ' + message.scoreList[user] + '<br>'
            }
        }

        if (message.time) {
            document.getElementById('timerBox').innerHTML = 'Time Left: ' + message.time
        } else if (message.cooldownTime) {
            document.getElementById('timerBox').innerHTML = 'Time Before Next Game: ' + message.cooldownTime
        }

        if (message.userList) {
            for (i in message.userList) {
                userList[i] = message.userList[i]
            }
        }

        if (message.buttonValue) {
            var gameButtonNumber = 'gameButton' + message.buttonNumber
            var gameButton = document.getElementById(gameButtonNumber);
            buttonList[message.buttonNumber] = message.buttonValue
            switch (message.buttonValue) {

                case 0:
                    gameButton.style.backgroundColor = 'white';
                    break;

                case 1:
                    gameButton.style.backgroundColor = 'red';
                    break;

                case 2:
                    gameButton.style.backgroundColor = 'orange';
                    break;

                case 3:
                    gameButton.style.backgroundColor = 'yellow';
                    break;

                case 4:
                    gameButton.style.backgroundColor = 'lime';
                    break;

                case 5:
                    gameButton.style.backgroundColor = 'green';
                    break;

                case 5:
                    gameButton.style.backgroundColor = 'blue';
                    break;
                case 6:
                    gameButton.style.backgroundColor = 'violet';
                    break;
                case 7:
                    gameButton.style.backgroundColor = 'purple';
                    break;
                case 8:
                    gameButton.style.backgroundColor = 'black';
                    break;
            }

        }
    }

})

for (let i = 0; i <= 63; i++) {

    let game = document.getElementById('buttonPage')
    let newButton = document.createElement('button');
    newButton.classList.add('gameButton');
    newButton.id = "gameButton" + i;
    newButton.backgroundColor = 'white'

    newButton.addEventListener('click', () => { socket.emit('senddata', { buttonNumber: i }) })
    document.getElementById('buttonPage').appendChild(newButton)

}