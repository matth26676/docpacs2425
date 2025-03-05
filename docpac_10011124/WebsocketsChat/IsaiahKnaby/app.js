const express = require('express');
const app = express();
const { WebSocketServer } = require('ws');
const http = require('http').Server(app);
const wss = new WebSocketServer({ server: http });

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function broadcast(wss, message) {
  for (let client of wss.clients) {
    client.send(JSON.stringify(message));
  };
}

function userList(wss) {
  const users = [];
  for (let client of wss.clients) {
    if (client.name) {
      users.push(client.name);
    }
  };
  return {
    list: users
  };
}

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/chat', (req, res) => {
  let name = req.query.username;
  if (!name) {
    return res.redirect('/');
  }
  res.render('chat', { username: name });
});

wss.on('connection', (ws) => {
  ws.on('message', message => {
    message = JSON.parse(message)
    if (message.name) {
      ws.name = message.name;
      broadcast(wss, JSON.stringify({
        names: userList(wss).list, message
      }));
    }
    if (message.text) {
      message.push(`${message.name}: ${message.text}`);
      broadcast(wss, JSON.stringify({ message: message.text }))
    }
  })
  wss.on('close', () => {
    let users = userList(wss);
    broadcast(wss, JSON.stringify({ names: users }));
  });
})


http.listen(3000, () => {
  console.log(`Server is running on port 3000`);
});