'use strict';

eventhubServices
  .factory('PageFactory', function ($resource) {
    return {
      Page: $resource(url_prefix+'/api/page/:id', null, {
        'getAll': {method: 'GET', isArray: true},
        'create': {method: 'POST'},
      })
    };
  });