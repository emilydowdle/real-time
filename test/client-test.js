// const chai = require('chai');
// const assert = chai.assert;
var chai = require('chai');
var chaiHttp = require('chai-http');
// var server = require('../server/app');
var should = chai.should();

chai.use(chaiHttp);


describe('name and message from input fields is blank', function() {
  getNameAndMessageFromInputFields()
  it('should list a SINGLE blob on /blob/<id> GET');
  it('should add a SINGLE blob on /blobs POST');
  it('should update a SINGLE blob on /blob/<id> PUT');
  it('should delete a SINGLE blob on /blob/<id> DELETE');
});

// const assert = require('chai').assert;
// const Dingus = require('../lib/dingus');

// describe('Dingus', function() {
//
//   context('with default attributes', function() {
//
//     var dingus = new Dingus({});
//
//     it('should assign an x coordinate', function() {
//       assert.equal(dingus.x, 0);
//     });
//
//     it('should assign a y coordinate', function() {
//       assert.equal(dingus.y, 0);
//     });
//
//     it('should assign a height', function(){
//       assert.equal(dingus.height, 10);
//     });
//
//     it('should assign a width', function(){
//       assert.equal(dingus.width, 10);
//     });
//   });
//
//
// });
