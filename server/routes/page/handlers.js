var Page = require('../../models/page');
var log = require('../../helpers/logger');

var handlers = module.exports;

handlers.list = function list(request, reply) {
  Page.findAll(function(err, result) {
    if (err) {
      log.error({err: err}, '[page] error listing pages');
      return reply({error: 'There was an error getting all the pages.'});
    }
    
    reply(result);
  });
};


handlers.get = function get(request, reply) {
  Page.findById(request.params.id, function(err, result) {
    if (err || !result || result.length < 1) {
      log.error({err: err}, '[page] error getting page %s', request.params.id);
      return reply({error: 'Unable to find page with id \'' + request.params.id + '\'.'});
    }
    
    reply(result[0]);
  });

};
