var Joi = require('joi');
var server = require('../../index').hapi;
var handlers = require('./handlers');

server.route({
  method: 'GET',
  path: '/api/event',
  config: {
    handler: handlers.list,
    auth: false,
    validate: {
      params: {},
      query: {}
    }
  }
});

server.route({
  method: 'GET',
  path: '/api/event/{id}',
  config: {
    handler: handlers.get,
    auth: false,
    validate: {
      params: {
        id: Joi.string().required()
      },
      query: {}
    }
  }
});