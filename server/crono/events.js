var CronJob  = require('cron').CronJob;
var scripts = require('../scripts');
var log = require('../helpers/logger');

module.exports = new CronJob({
  cronTime: '0 */6 * * *',
  onTick: function() {
    log.info('## Updating events ##');
    scripts.events.getAllEvents(function (err) {
      if(err) {
        return log.error({err: err}, 'error finding new events');
      }
      log.info('events search done');
    });
  },
  start: false
});