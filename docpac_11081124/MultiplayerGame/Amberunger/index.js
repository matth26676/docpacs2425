      document.getElementById("loading").style.display = "none";
        document.getElementById("bigCont").style.display = "none";
        document.getElementById("userCont").style.display = "none";
        document.getElementById("ennCont").style.display = "none";
        document.getElementById("valueCont").style.display = "none";
        document.getElementById("whosTurn").style.display = "none";

        const socket = io();
        let name;
        let gameId;
        let symbol;
        let myTurn = false;

        document.getElementById("find").addEventListener("click", () => {
            name = document.getElementById("name").value;
            if (name) {
                document.getElementById("user").innerText = name;
                if (name == null || name == "") {
                    alert("Please enter a name");
                } else {
                    socket.emit("find", { name: name });
                    document.getElementById("loading").style.display = "block";
                    document.getElementById("find").disabled = true;
                }
            }
        });

        socket.on("startGame", ({ opponent, symbol: playerSymbol, gameId: serverGameId }) => {
            symbol = playerSymbol;
            gameId = serverGameId;
            myTurn = (symbol === 'X');

            document.getElementById("userCont").style.display = "block";
            document.getElementById("ennCont").style.display = "block";
            document.getElementById("valueCont").style.display = "block";
            document.getElementById("loading").style.display = "none";
            document.getElementById("name").style.display = "none";
            document.getElementById("find").style.display = "none";
            document.getElementById("enterName").style.display = "none";
            document.getElementById("bigCont").style.display = "block";
            document.getElementById("whosTurn").style.display = "none";

            document.getElementById("ennName").innerText = opponent;
            document.getElementById("value").innerText = symbol;
            updateTurnDisplay();
        });

        const buttons = document.querySelectorAll('.btn');
        buttons.forEach((button, index) => {
            button.addEventListener('click', () => {
                if (button.innerText === '' && myTurn) {

                    socket.emit('makeMove', { gameId, index, symbol });
                    myTurn = false; // Disable the player's turn until the server confirms the move
                    updateTurnDisplay();
                }
            });
        });

        socket.on('moveMade', ({ index, symbol, turn }) => {
            buttons[index].innerText = symbol;
            myTurn = (turn !== symbol); // Update myTurn based on the turn information from the server

        });

        socket.on('gameOver', ({ winner }) => {
            if (winner === 'Draw') {
                alert('The game is a draw!');
                location.reload();
            } else {
                alert(`${winner} wins!`);
                location.reload();
            }
            location.reload();
        });

        function updateTurnDisplay() {
            const turnText = myTurn ? "Your turn" : "Opponent's turn";
            document.getElementById("whosTurn").innerText = turnText;
        }
