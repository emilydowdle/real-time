const http = require('http');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const generateId = require('./lib/generate-id');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.locals.title = 'Real Time Feedback';
app.locals.polls = {};
app.locals.messages = {};

app.set('view engine', 'jade');

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/polls', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

app.post('/', (request, response) => {
  if ( isEmpty(request.body) ) { return response.sendStatus(400); }
  var id = generateId();
  addPollToLocals (request, id)
  setPollDefaults(poll, id)

  response.redirect(301, '/polls/' + id + '/admin')
});

app.post('/polls', (request, response) => {
  if (!request.body) { return response.sendStatus(400); }
  var id = generateId();
  addPollToLocals (request, id)
  setPollDefaults(poll, id)

  response.redirect('/polls/' + id + '/admin')
});

app.get('/polls/:id', (request, response) => {
  if( !app.locals.polls.hasOwnProperty(request.params.id) ) {
    return response.sendStatus(404);
  }
  var poll = app.locals.polls[request.params.id];

  response.render('poll', { poll: poll })
});

app.post('/polls/:id', (request, response) => {
  if( !app.locals.polls.hasOwnProperty(request.params.id) ) {
    return response.sendStatus(404);
  }

  var poll = app.locals.polls[request.params.id];
  formatAndAddMessageToPollMessages(request, poll)

  response.render('poll', { poll: poll })
});

app.get('/polls/:id/admin', (request, response) => {
  var poll = app.locals.polls[request.params.id];

  response.render('admin', { poll: poll, identifier: { id: request.params.id } })
});

app.post('/polls/:id/admin', (request, response) => {
  var poll = app.locals.polls[request.params.id];
  formatAndAddMessageToPollMessages(request, poll)

  response.render('admin', { poll: poll, identifier: { id: request.params.id } })
});

function formatAndAddMessageToPollMessages(request, poll) {
  if (!poll['messages']) { poll['messages'] = []; }name = request.body['name'] || "Unknown"
  message = request.body['message'] || "No message"
  fullMessage = name + ': ' + message
  poll['messages'].push(fullMessage)
}

const port = process.env.PORT || 3000;
const server = http.createServer(app)

server.listen(port, function () {
});

const socketIo = require('socket.io');
const io = socketIo(server);

io.on('connection', function (socket) {
  io.to(socket.id).emit('statusMessage', 'Thank you for joining this live poll.');

  io.sockets.emit('userConnection', io.engine.clientsCount); //emits to all connected clients

  socket.on('message', function (channel, message) {
    if (channel === 'voteCast') {
      poll = app.locals.polls[message['poll']]
      if (poll['retired']) { return; }
      addVoteToVoteTracker(poll, message)
      poll['voters'].push(message['socket'])

      io.to(socket.id).emit('statusMessage', 'Your vote has been cast! You chose "' + [message['voteCast']] + '".');
      io.sockets.emit('voteCount', poll);
    }
  });

  socket.on('message', function (channel, message) {
    if (channel === 'getResults') {
      poll = app.locals.polls[message]
      io.sockets.emit('voteCount', poll);
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

  socket.on('message', function (channel, message) {
    if (channel === 'sendMessageToGroup') {
      io.sockets.emit(channel, message);
    }
  })

  socket.on('disconnect', function () {
    io.sockets.emit('userConnection', io.engine.clientsCount);
  });
});

function startCountdown(poll){
  if(poll['timer'] !== 'Forever'){
    setTimeout(function(){
      poll['retired'] = true
      io.sockets.emit('closePoll', poll)
    }, (poll['timer'] * 1000 * 60))
  }
}

function addPollToLocals (request, id) {
  app.locals.polls[id] = request.body;
  poll = app.locals.polls[id]
}

function setPollDefaults(poll, id) {
  poll['id'] = id
  poll['votes'] = {}
  poll['retired'] = false;
  poll['voters'] = []
  startCountdown(poll)
}

function addVoteToVoteTracker(poll, message) {
  if (poll['votes'][message['voteCast']] == undefined) {
    poll['votes'][message['voteCast']] = 1
  } else {
    poll['votes'][message['voteCast']]++
  }
}

function isEmpty(obj) {
  for(var key in obj) {
    if(obj.hasOwnProperty(key)){
      return false;
    }
  }
  return true;
}

module.exports = server;
