var socket = io();

var connectionCount = document.getElementById('connection-count');

socket.on('usersConnected', function (count) {
  connectionCount.innerText = 'Connected Users: ' + count;
});

var pollDisplay = document.getElementById('poll-display');

socket.on('pollDisplay', function (message) {
  for (var key in message){
    pollDisplay.innerText = pollDisplay.innerText + key.toUpperCase() + ": " + message[key] + '\n';
  }
  document.getElementById('poll-display').innerText = "Please cast your vote below.";
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
    socket.send('voteCast', this.innerText);
  });
}

var newPoll = document.getElementById('create-poll');
var pollData = document.querySelectorAll('#poll-data input')

newPoll.addEventListener('click', function () {
  poll = {}
  for (var i = 0; i < pollData.length; i++) {
    poll[pollData[i].id] = pollData[i].value
    console.log(poll)
  }
  socket.send('newPoll', poll)
})

socket.on('newPoll', function (message) {
  statusMessage.innerText = message;
});
