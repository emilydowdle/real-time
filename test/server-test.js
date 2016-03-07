var request = require('supertest');
var app = require('../server');
const fixtures = require('./fixtures');

describe('GET /', function(){
  it('responds with html', function(done){
    request(app)
      .get('/')
      .set('Accept', 'application/html')
      .expect('Content-Type', /html/, done)
  });

  it('responds with correct status', function(done){
    request(app)
      .get('/')
      .set('Accept', 'application/html')
      .expect(200, done);
  });

  it('responds with correct info', function(done){
    request(app)
      .get('/')
      .expect(hasCorrectText)
      .end(done);

    function hasCorrectText(res) {
      if (!res.text.includes("Real Time")) return "missing title";
      if (!res.text.includes("Create A New Poll")) throw new Error("missing poll form");
    }
  });
});

describe('GET /polls', function(){
  it('responds with html', function(done){
    request(app)
      .get('/polls')
      .set('Accept', 'application/html')
      .expect('Content-Type', /html/, done)
  })

  it('responds with correct status', function(done){
    request(app)
      .get('/polls')
      .set('Accept', 'application/html')
      .expect(200, done);
  })

  it('responds with correct info', function(done){
    request(app)
      .get('/')
      .expect(hasCorrectText)
      .end(done);

    function hasCorrectText(res) {
      if (!res.text.includes("Real Time")) return "missing title";
      if (!res.text.includes("Create A New Poll")) throw new Error("missing poll form");
    }
  });
})

describe('POST /', function(){
  it('responds with 400 when body is empty', function(done){
    request(app)
      .post('/')
      .send({})
      .expect(400, done);
  })

  it('gets and stores data', function(done){
    var payload = { poll: fixtures.validPoll }
    request(app)
      .post('/')
      .send(payload)
      .expect(301)
      .end(function (err, res) {
        if (err) return done(err);
        res.headers.location = 'poll';
        done();
      })
  });

  it('redirects to /polls/:id/admin', function(done){
    request(app)
      .post('/')
      .send({"testing":true})
      .expect(301, done);
  })
})

describe('GET /polls/:id', function(){
  it('responds with 404 when id does not exist', function(done){
    request(app)
      .get('/polls/1')
      .expect(404, done);
  })
})

describe('POST /polls/:id', function(){
  it('responds with 404 when id does not exist', function(done){
    request(app)
      .post('/polls/1')
      .expect(404, done);
  })
})

describe('POST /polls/', function(){
  it('creates a poll', function(done){
    var res = request(app)
      .post('/polls/')
      .send({
        "question": "Question",
        "a": "Option 1",
        "b": "Option 2",
        "c": "Option 3",
        "timer": 5
      })
      .expect(302, done);
    // console.log( res );
  })
})
