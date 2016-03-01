const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const generateId = require('./lib/generate-id');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('static'));

app.set('port', process.env.PORT || 3000);
app.locals.title = 'Real Time Feedback';

app.set('view engine', 'jade');

app.get('/', (request, response) => {
  response.render('index');
});

app.listen(app.get('port'), () => {
  console.log(`${app.locals.title} is running on ${app.get('port')}.`);
});

if (!module.parent) {
  app.listen(app.get('port'), () => {
    console.log(`${app.locals.title} is running on ${app.get('port')}.`);
  });
}

app.post('/polls', (request, response) => {
  if (!request.body.poll) { return response.sendStatus(400); }

  var id = generateId();

  app.locals.polls[id] = request.body.poll;

  response.redirect('/polls/' + id);
});

app.get('/polls/:id', (request, response) => {
  var poll = app.locals.polls[request.params.id];

  response.render('poll', { poll: poll });
});

app.locals.pizzas = {};

module.exports = app;
