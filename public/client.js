var socket = io();

var closePoll = document.getElementById('close-poll')
var instructions = document.getElementById('instructions')
var pollDisplay = document.getElementById('poll-display');
var statusMessage = document.getElementById('status-message')
var getResults = document.getElementById('current-tally')

if (getResults) {
  getResults.addEventListener('click', function () {
    socket.send('getResults', '')
  })
}

if (closePoll) {
  closePoll.addEventListener('click', function () {
    socket.send('closePoll', 'Close poll')
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
  numberVoted = {}
  totalVotes = 0
  for (var key in message){
    data = message[key][key.replace("/#","")]
    if (!numberVoted[data]) {
      numberVoted[data] = 1
      totalVotes++
    } else {
      numberVoted[data]++
      totalVotes++
    }
  }
  display = ''
  for (var key in numberVoted){
    display = display + ' ' + key + ": " + numberVoted[key] + ' (' + Math.round( numberVoted[key] / totalVotes  * 100 ) + '%)\n\n' ;
  }

  voteCount.innerHTML = display
});

var buttons = document.querySelectorAll('#choices button');

for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function () {
    vote = {}
    id = socket.io.engine.id
    vote[id] = this.innerText
    // console.log(this.socket.sessionid);
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
  socket.disconnect();
});
