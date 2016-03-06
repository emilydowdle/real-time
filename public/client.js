var socket = io();

var pollId = window.location.pathname.split('/')[2]

var closePoll = document.getElementById('close-poll')
var instructions = document.getElementById('instructions')
var pollDisplay = document.getElementById('poll-display');
var statusMessage = document.getElementById('status-message')
var getResults = document.getElementById('current-tally')
var sendMessageToGroup = document.getElementById('send-message-to-group')
var groupMessage = document.getElementById('group-message')
var voteCount = document.getElementById('vote-count');
var buttons = document.querySelectorAll('#choices button');
var pollData = document.querySelectorAll('#poll-data input')

var voted = false

if (getResults) {
  getResults.addEventListener('click', function () {
    socket.send('getResults', pollId)
  })
}

if (closePoll) {
  closePoll.addEventListener('click', function () {
    socket.send('closePoll', pollId)
  })
}

socket.on('voteCount', function (message) {
  if (message['id'] === pollId) {
    findVoteTotal (message)
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

for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener ('click', function () {
    if (voted) { return; }
    assignVoteValues (this)
    socket.send ('voteCast', vote);
  });
}

socket.on('statusMessage', function (message) {
  if (statusMessage && message['id'] === pollId) {
    statusMessage.innerText = message;
  }
});

socket.on('closePoll', function (message) {
  if (statusMessage && message['id'] === pollId) {
    statusMessage.innerText = 'This poll is now closed.';
  }
});

if (sendMessageToGroup) {
  sendMessageToGroup.addEventListener ('click', function () {
    getNameAndMessageFromInputFields ()

    socket.send('sendMessageToGroup', { poll: pollId, message: fullMessage })
  })
}

socket.on('sendMessageToGroup', function (message) {
  if (groupMessage && message['poll'] === pollId) {
    groupMessage.innerHTML = groupMessage.innerHTML + '<li>' + message['message'] + '</li>\r';
  }
});

function getNameAndMessageFromInputFields () {
  name = document.getElementById('name').value || "Unknown"
  message = document.getElementById('message-to-group').value || "No message"
  fullMessage = name + ': ' + message
}

function assignVoteValues (data) {
  vote = {}
  id = socket.io.engine.id
  vote['socket'] = id
  vote['voteCast'] = data.innerText
  vote['option'] = data.id
  vote['poll'] = pollId
  voted = true
}

function findVoteTotal (message) {
  totalVotes = 0
  countVotesForEachOption (totalVotes, message)
}

function countVotesForEachOption (total, message) {
  for (var key in message['votes']){
    totalVotes = totalVotes + message['votes'][key]
  }
}
