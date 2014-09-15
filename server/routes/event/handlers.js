var Event = require('../../models/event');
var log = require('../../helpers/logger');
var scripts = require('../../scripts');

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
  var eventId = request.params.id;

  Event.findById(eventId, function(err, result) {
    if (err) {
      log.error({err: err}, '[event] error getting event %s', eventId);
      return reply({error: 'Error getting event with id \'' + eventId + '\'.'});
    }
    
    if (result && result.length > 0) {
      return reply(result[0]);
    }
    
    scripts.events.getEvent(eventId, function(err, newEvent) {
      if (err) {
        log.error({err: err}, '[event] error creating event %s', eventId);
        return reply({error: 'Error finding event with id \'' + eventId + '\'.'});
      }

      reply(newEvent);
    });
  });

};
