var Event = require('../../models/event');
var log = require('../../helpers/logger');

var handlers = module.exports;

handlers.list = function list(request, reply) {
  Event.findAll(function(err, result) {
    if (err) {
      log.error({err: err}, '[event] error listing events');
      return reply({error: 'There was an error getting all the events.'});
    }
    
    reply(result);
  });
};


handlers.get = function get(request, reply) {
  Event.findById(request.params.id, function(err, result) {
    if (err || !result || result.length < 1) {
      log.error({err: err}, '[event] error getting event %s', request.params.id);
      return reply({error: 'Unable to find event with id \'' + request.params.id + '\'.'});
    }
    
    reply(result[0]);
  });

};
