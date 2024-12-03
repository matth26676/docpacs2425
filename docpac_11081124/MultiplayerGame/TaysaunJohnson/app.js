const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const sqlite3 = require('sqlite3').verbose()

app.use(express.urlencoded({extended: true}))
app.use(express.text())

var db = new sqlite3.Database('public/db/highscore.db', (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log('opened database successfully')
    }
})



app.set('view engine', 'ejs')

var players = []

console.log(players)

io.on('connection', (socket) => {
    console.log('connection')
    // var playersLength = Object.keys(players).length 
    if (players.length == 0) {
        players.push({
            id: socket.id,
            player: 1
        })
        console.log(players)
    }  else if (players.length == 1) {
        players.push({
            id: socket.id,
            player: 2
        })
        io.emit('startgame')
    }

    socket.on('score', (data) => {
        players.forEach((player) => {
            if (player.id == socket.id) {
                player.score = data
            }
        })
        if (players[0].score && players[1].score) {
            if (players[0].score > players[1].score) {
                io.to(players[0].id).emit('winner')
                io.to(players[1].id).emit('loser')
            } else {
                io.to(players[1].id).emit('winner')
                io.to(players[0].id).emit('loser')
            }
        }
    })
})

app.get('/', (req, res) => {
    res.render('index')
})

app.get('/game', (req, res) => {
    res.render('game')
})

app.post('/hiscores', (req, res) => {
    var data = JSON.parse(req.body)
    try {
        if(data.name && data.score) {
            data.ip = req.ip
            console.log(data)
            db.run("INSERT INTO scores (score, ip, name) VALUES (?,?,?);", [data.score, data.ip, data.name])
        } else {
            if (!data.name) {
                throw new Error('Score not saved: No Name')
            }
            if (!data.score) {
                throw new Error('Score not saved: No Score')
            }
        }
    } catch(err) {
        console.log(err)
        res.render('error', {
            err : err,
            score: data.score
        })
    }
})

app.get('/hiscores', (req, res) => {
    var data;
    db.all("SELECT * FROM scores ORDER BY score DESC;", (err, row) => {
        if (err) {
            res.render('error', {err: err})
        } else {
            data = row
            if (data.length > 10) {
                data.splice(10, data.length - 10)
            }
            res.render('hiscores', {scores: data})
        }
    })
})

http.listen(3000, (err) => {
    if(err) {
        console.log(err)
    } else {
        console.log('server running on port 3000')
    }
})