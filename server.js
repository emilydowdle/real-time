const http = require('http');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const generateId = require('./lib/generate-id');
// const server = http.createServer(app)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

// app.set('port', process.env.PORT || 3000);
app.locals.title = 'Real Time Feedback';

app.set('view engine', 'jade');

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/public/index.html');
});

// app.listen(app.get('port'), () => {
//   console.log(`${app.locals.title} is running on ${app.get('port')}.`);
// });

// if (!module.parent) {
//   app.listen(app.get('port'), () => {
//     console.log(`${app.locals.title} is running on ${app.get('port')}.`);
//   });
// }
//
// app.post('/polls', (request, response) => {
//   if (!request.body.poll) { return response.sendStatus(400); }
//
//   var id = generateId();
//
//   app.locals.polls[id] = request.body.poll;
//
//   response.redirect('/polls/' + id);
// });
//
// app.get('/polls/:id', (request, response) => {
//   var poll = app.locals.polls[request.params.id];
//
//   response.render('poll', { poll: poll });
// });
//
// app.locals.pizzas = {};
//
// module.exports = app;

const port = process.env.PORT || 3000;

const server = http.createServer(app)

server.listen(port, function () {
  console.log('Listening on port ' + port + '.');
});

const socketIo = require('socket.io');
const io = socketIo(server);
var votes = {};

io.on('connection', function (socket) {
  console.log('A user has connected.', io.engine.clientsCount);

  io.sockets.emit('userConnection', io.engine.clientsCount); //emits to all connected clients

  socket.emit('statusMessage', 'You have connected.'); //emits to one client

  socket.on('message', function (channel, message) {
    if (channel === 'voteCast') {
      votes[socket.id] = message;
      socket.emit('voteCount', countVotes(votes));
      console.log(countVotes(votes))
      socket.emit('statusMessage', 'Your vote has been cast! You chose option ' + message + '.'); //emits to one client
      console.log('Your vote has been cast: ' + message)
    }
  });

  socket.on('message', function (channel, message) {
    if (channel === 'newPoll') {
      console.log(message)
    }
  })

  socket.on('disconnect', function () {
    console.log(votes)
    console.log('A user has disconnected.', io.engine.clientsCount);
    delete votes[socket.id];
    socket.emit('voteCount', countVotes(votes));
    io.sockets.emit('userConnection', io.engine.clientsCount);
  });

  socket.on('voteCount', function (votes) {
    console.log(votes);
  });
});

function countVotes(votes) {
  var voteCount = {
      A: 0,
      B: 0,
      C: 0,
      D: 0
  };
  for (var vote in votes) {
    voteCount[votes[vote]]++
  }
  return voteCount;
}

module.exports = server;
