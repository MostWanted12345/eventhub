var Hapi = require('hapi');
var port = require('../config').port;
var updateOnStart = require('../config').updateOnStart;
var log = require('./helpers/logger');
var crono = require('./crono');

var scripts = require('./scripts');

log.error('### Starting EventDeck ###');

var db = require('./models');

var server = module.exports.hapi = new Hapi.Server(port);

server.start(function () {
  var routes = require('./routes');
  log.info('Server started at: ' + server.info.uri);

  crono.events.start();
  // crono.pages.start();
});


if(updateOnStart) {
  db.once('open', function (){
    log.info('## Updating pages ##');
    scripts.findPages(function (err) {
      if(err) {
        return log.error({err: err}, 'error finding new pages');
      }
      log.info('pages search done');

      log.info('## Updating events ##');
      scripts.findEvents(function (err) {
        if(err) {
          return log.error({err: err}, 'error finding new events');
        }
        log.info('events search done');
      });
    });
  });
}
