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
app.locals.polls = {};

app.set('view engine', 'jade');

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/polls', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

app.post('/polls', (request, response) => {
  if (!request.body) { return response.sendStatus(400); }
  var id = generateId();
  // var socketId = generateId();
  app.locals.polls[id] = request.body;
  poll = app.locals.polls[id]
  poll['id'] = id
  poll['votes'] = {}
  poll['retired'] = false;
  startCountdown(poll)

  response.redirect('/polls/' + id + '/admin')

  // response.render('admin', { poll: poll, identifier: { id: id } })

  // response.redirect('/polls/' + id + '/admin', { poll: poll });
});

app.get('/polls/:id', (request, response) => {
  var poll = app.locals.polls[request.params.id];

  // response.sendFile(__dirname + '/views/index.html', { poll: poll });
  // console.log(poll)
  response.render('poll', { poll: poll })
});

app.get('/polls/:id/admin', (request, response) => {
  var poll = app.locals.polls[request.params.id];

  // response.sendFile(__dirname + '/views/index.html', { poll: poll });
  // console.log(poll)
  response.render('admin', { poll: poll, identifier: { id: request.params.id } })
});

const port = process.env.PORT || 3000;

const server = http.createServer(app)

server.listen(port, function () {
  console.log('Listening on port ' + port + '.');
});

const socketIo = require('socket.io');
const io = socketIo(server);
// var votes = {};
var clients = {};

io.on('connection', function (socket) {
  io.to(socket.id).emit('statusMessage', 'Thank you for joining this live poll.');

  // io.sockets.emit('voteCount', votes);

  io.sockets.emit('userConnection', io.engine.clientsCount); //emits to all connected clients

  socket.on('message', function (channel, message) {
    if (channel === 'voteCast') {
      poll = app.locals.polls[message['poll']]
      if (!poll['retired']) {
        if (poll['votes'][message['voteCast']] == undefined) {
          poll['votes'][message['voteCast']] = 1
        } else {
          poll['votes'][message['voteCast']]++
        }
        io.to(socket.id).emit('statusMessage', 'Your vote has been cast! You chose "' + [message['voteCast']] + '".');
        io.sockets.emit('voteCount', poll);
      }
    }
  });

  socket.on('message', function (channel, message) {
    if (channel === 'getResults') {
      console.log('got to server')
      poll = app.locals.polls[message]
      io.sockets.emit('voteCount', poll);
      console.log(poll)
    }
  })

  socket.on('message', function (channel, message) {
    if (channel === 'newPoll') {
    }
  })

  socket.on('message', function (channel, message) {
    if (channel === 'closePoll') {
      poll = app.locals.polls[message]
      poll['retired'] = true;
      io.sockets.emit(channel, poll);
      socket.disconnect();
    }
  })

  socket.on('disconnect', function () {
    console.log('A user has disconnected.', io.engine.clientsCount);
    // delete votes[socket.id];
    // socket.emit('voteCount', countVotes(votes));
    io.sockets.emit('userConnection', io.engine.clientsCount);
  });

  // socket.on('voteCount', function (votes) {
  //
  // });
});

function startCountdown(poll){
  console.log(poll['timer'])
  if(poll['timer'] !== 'Forever'){
    setTimeout(function(){
      poll['retired'] = true
      io.sockets.emit('closePoll', poll)
    }, (poll['timer'] * 1000 * 60))
  }
}

function countVotes(votes) {
  var voteCount = {
      A: 0,
      B: 0,
      C: 0
    };
  for (var vote in votes) {
    // voteCount[votes[vote]]++
  }
  return voteCount;
}

module.exports = server;
