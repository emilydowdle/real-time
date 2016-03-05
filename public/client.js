var socket = io();

var closePoll = document.getElementById('close-poll')
var instructions = document.getElementById('instructions')
var pollDisplay = document.getElementById('poll-display');
var statusMessage = document.getElementById('status-message')
var getResults = document.getElementById('current-tally')
var voted = false

if (getResults) {
  getResults.addEventListener('click', function () {
    socket.send('getResults', '')
  })
}

if (closePoll) {
  closePoll.addEventListener('click', function () {
    socket.send('closePoll', window.location.pathname.split('/')[2])
  })
}

socket.on('pollDisplay', function (message) {
  for (var key in message){
    pollDisplay.innerText = pollDisplay.innerText + key.toUpperCase() + ": " + message[key] + '\n';
  }
  instructions.innerText = "Please cast your vote below.";
});

var voteCount = document.getElementById('vote-count');

socket.on('voteCount', function (message) {
  if (message['id'] === window.location.pathname.split('/')[2]) {

    totalVotes = 0
    for (var key in message['votes']){
      totalVotes = totalVotes + message['votes'][key]
    }

    display = ''
    for (var key in message['votes']){
      display = display + ' ' + key + ": " + message['votes'][key] + ' (' + Math.round( message['votes'][key] / totalVotes  * 100 ) + '%)\n\n' ;
    }

    voteCount.innerHTML = display
  }
});

var buttons = document.querySelectorAll('#choices button');

for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function () {
    if (voted) {
      return;
    }
    vote = {}
    id = socket.io.engine.id
    vote['socket'] = id
    vote['voteCast'] = this.innerText
    vote['option'] = this.id
    vote['poll'] = window.location.pathname.split('/')[2]
    voted = true
    socket.send('voteCast', vote);
  });
}

// var newPoll = document.getElementById('create-poll');
var pollData = document.querySelectorAll('#poll-data input')

// newPoll.addEventListener('click', function () {
//
//   poll = {}
//   for (var i = 0; i < pollData.length; i++) {
//     poll[pollData[i].id] = pollData[i].value
//     console.log(poll)
//   }
//   socket.send('newPoll', poll)
// })

// socket.on('newPoll', function (message) {
//   statusMessage.innerText = message;
// });

socket.on('statusMessage', function (message) {
  if (statusMessage) {
    statusMessage.innerText = message;
  }
});

socket.on('closePoll', function (message) {
  if (statusMessage) {
    statusMessage.innerText = message;
  }
});
