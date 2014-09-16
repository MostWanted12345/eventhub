var config = {
  url: process.env.EVENTHUB_URL || 'http://localhost:8080',
  port: process.env.EVENTHUB_PORT || 8080,
  updateOnStart: (process.env.EVENTHUB_UPDATE_ON_START && process.env.EVENTHUB_UPDATE_ON_START=='true') || false
};

config.mongo = {
  url: process.env.EVENTDECK_MONGO_URL || 'mongodb://localhost/eventhub'
};

config.facebook = {
  accessToken : process.env.EVENTHUB_FACEBOOK_TOKEN || 'YOUR ACCESS TOKEN'
};

config.bunyan = {
  name: require('./package.json').name,
  level: process.env.EVENTHUB_LOG_LEVEL || 'trace'
};

module.exports = config;
