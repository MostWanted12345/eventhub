var CronJob  = require('cron').CronJob;
var scripts = require('../scripts');
var log = require('../helpers/logger');

module.exports = new CronJob({
  cronTime: '0 0 */6 * *',
  onTick: function() {
    log.info('## Updating pages ##');
    scripts.findPages(function (err) {
      if(err) {
        return log.error({err: err}, 'error finding new pages');
      }
      log.info('pages search done');
    });
  },
  start: false,
  timeZone: 'Portugal'
});