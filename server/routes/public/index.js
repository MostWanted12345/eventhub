var server = require('../../index.js').hapi;

var publicAssets = { 
  method: 'GET', 
  path: '/{path*}', 
  config: {
    handler: {
      directory: { 
        path: './public/', 
        listing: true, 
        index: true 
      }
    }
  } 
};

server.route(publicAssets);