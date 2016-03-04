var socket = io();

var closePoll = document.getElementById('close-poll')
var instructions = document.getElementById('instructions')
var pollDisplay = document.getElementById('poll-display');
var statusMessage = document.getElementById('status-message')

if (closePoll) {
  closePoll.addEventListener('click', function () {
    socket.send('closePoll', 'Close poll')
  })
}

socket.on('pollDisplay', function (message) {
  debugger
  for (var key in message){
    pollDisplay.innerText = pollDisplay.innerText + key.toUpperCase() + ": " + message[key] + '\n';
  }
  instructions.innerText = "Please cast your vote below.";
});

var voteCount = document.getElementById('vote-count');

socket.on('voteCount', function (message) {
  if (localStorage["voteCount"] != undefined) {
    totalVotes = JSON.parse(localStorage["voteCount"])
    for (var key in totalVotes){
      totalVotes[key] = totalVotes[key] + message[key];
    }
  } else {
    totalVotes = message
  };

  voteCount.innerText = 'Total Votes: \n';
  numberVoted = 0

  for (var key in totalVotes){
    numberVoted = numberVoted + totalVotes[key]
  }

  for (var key in totalVotes){
    voteCount.innerText = voteCount.innerText + ' ' + key + ": " + totalVotes[key] + ' (' + Math.round( totalVotes[key] / numberVoted  * 100 ) + '%)\n' ;
  }
  localStorage["voteCount"] = JSON.stringify(totalVotes)
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
  statusMessage.innerText = message;
});

socket.on('pollClosed', function (message) {
  statusMessage.innerText = message;
});
