'use strict';

eventhubController.controller('EventsController', function ($rootScope, $scope, EventFactory) {
  
  EventFactory.Event.getAll(function (response) {
    $scope.events = response;
  });

  $scope.limit = 20;
  $scope.predicate = 'date';
});
