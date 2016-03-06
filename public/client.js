var socket = io();

var pollId = window.location.pathname.split('/')[2]
var closePoll = document.getElementById('close-poll')
var instructions = document.getElementById('instructions')
var pollDisplay = document.getElementById('poll-display');
var statusMessage = document.getElementById('status-message')
var getResults = document.getElementById('current-tally')
var voted = false

if (getResults) {
  getResults.addEventListener('click', function () {
    socket.send('getResults', pollId)
    console.log('clicked the button')
  })
}

if (closePoll) {
  closePoll.addEventListener('click', function () {
    socket.send('closePoll', pollId)
  })
}

socket.on('pollDisplay', function (message) {
  for (var key in message){
    pollDisplay.innerText = pollDisplay.innerText + key.toUpperCase() + ": " + message[key] + '\r';
  }
  instructions.innerText = "Please cast your vote below.";
});

var voteCount = document.getElementById('vote-count');

socket.on('voteCount', function (message) {
  if (message['id'] === pollId) {
    console.log('got to vote count')
    totalVotes = 0
    for (var key in message['votes']){
      totalVotes = totalVotes + message['votes'][key]
    }
    if (totalVotes === 0) {

      return voteCount.innerHTML = 'There are no votes to display.'
    }
    display = '<h4>Vote Results </h4>\r'
    for (var key in message['votes']){
      display = display + '<li><strong>' + key + ": </strong>" + message['votes'][key] + ' (' + Math.round( message['votes'][key] / totalVotes  * 100 ) + '%)</li>' ;
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
    vote['poll'] = pollId
    voted = true
    socket.send('voteCast', vote);
  });
}

var pollData = document.querySelectorAll('#poll-data input')

socket.on('statusMessage', function (message) {
  if (statusMessage && message['id'] === pollId) {
    statusMessage.innerText = message;
  }
});

// socket.on('closePoll', function (message) {
//   if (statusMessage && message['id'] === pollId) {
//     statusMessage.innerText = 'This poll is now closed.';
//   }
// });

socket.on('closePoll', function (message) {
  if (statusMessage && message['id'] === pollId) {
    statusMessage.innerText = 'This poll is now closed.';
  }
});

var sendMessageToGroup = document.getElementById('send-message-to-group')
var groupMessage = document.getElementById('group-message')

if (sendMessageToGroup) {
  sendMessageToGroup.addEventListener('click', function () {
    getNameAndMessageFromInputFields()

    socket.send('sendMessageToGroup', { poll: pollId, message: fullMessage })
  })
}

socket.on('sendMessageToGroup', function (message) {
  if (groupMessage && message['poll'] === pollId) {
    groupMessage.innerHTML = groupMessage.innerHTML + '<li>' + message['message'] + '</li>\r';
  }
  console.log()
});

function getNameAndMessageFromInputFields() {
  name = document.getElementById('name').value || "Unknown"
  message = document.getElementById('message-to-group').value || "No message"
  fullMessage = name + ': ' + message
}
