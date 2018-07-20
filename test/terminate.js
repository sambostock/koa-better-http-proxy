var assert = require('assert');
var Koa = require('koa');
var agent = require('supertest').agent;
var proxy = require('../');

describe('terminateAfterProxy', function() {
  'use strict';

  this.timeout(150);

  it('prevents next from being called after proxying if true', function(done) {
    var app = new Koa() ;
    var nextWasCalled = false;

    app.use(proxy('httpbin.org', {
      terminateAfterProxy: true,
    }));

    app.use(function() {
      nextWasCalled = true;
    });

    agent(app.callback())
      .get('/user-agent')
      .end(function(err) {
        assert(!nextWasCalled, 'next was called')
        done(err)
      });
  });

  it('does not prevent next from being called after proxying if false', function(done) {
    var app = new Koa() ;
    var nextWasCalled = false;

    app.use(proxy('httpbin.org', {
      terminateAfterProxy: false,
    }));

    app.use(function() {
      nextWasCalled = true;
    });

    agent(app.callback())
      .get('/user-agent')
      .end(function(err) {
        assert(nextWasCalled, 'next was not called');
        done(err);
      });
  });

  describe('when a filter prevents proxying', function() {
    var neverProxyFilter = function() { return false; }

    it('does not prevent next from being called when true', function(done) {
      var app = new Koa() ;
      var nextWasCalled = false;

      app.use(proxy('httpbin.org', {
        terminateAfterProxy: false,
        filter: neverProxyFilter,
      }));

      app.use(function() {
        nextWasCalled = true;
      });

      agent(app.callback())
        .get('/user-agent')
        .end(function(err) {
          assert(nextWasCalled, 'next was not called');
          done(err);
        });
    });

    it('does not prevent next from being called when false', function(done) {
      var app = new Koa() ;
      var nextWasCalled = false;

      app.use(proxy('httpbin.org', {
        terminateAfterProxy: true,
        filter: neverProxyFilter,
      }));

      app.use(function() {
        nextWasCalled = true;
      });

      agent(app.callback())
        .get('/user-agent')
        .end(function(err) {
          assert(nextWasCalled, 'next was not called');
          done(err);
        });
    });
  });
});
