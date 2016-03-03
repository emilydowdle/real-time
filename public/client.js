var socket = io();

var connectionCount = document.getElementById('connection-count');

socket.on('usersConnected', function (count) {
  connectionCount.innerText = 'Connected Users: ' + count;
});

var statusMessage = document.getElementById('status-message');

socket.on('statusMessage', function (message) {
  statusMessage.innerText = message;
});

var voteCount = document.getElementById('vote-count');

socket.on('voteCount', function (message) {
  console.log(localStorage["voteCount"])
  if (localStorage["voteCount"] != undefined) {
    totalVotes = JSON.parse(localStorage["voteCount"])
    for (var key in totalVotes){
      totalVotes[key] = totalVotes[key] + message[key];
    }
  } else {
    totalVotes = message
  };

  voteCount.innerText = 'Total Votes: ';
  for (var key in totalVotes){
    voteCount.innerText = voteCount.innerText + ' ' + key + ": " + totalVotes[key];
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

// for (var i = 0; i < pollData.length; i++) {
//   pollData[i].addEventListener('click', function () {
//     socket.send('voteCast', this.innerText);
//   });
// }

socket.on('newPoll', function (message) {
  statusMessage.innerText = message;
});
