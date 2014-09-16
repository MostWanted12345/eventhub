'use strict';

eventhubController.controller('EventController', function ($rootScope, $scope, $routeParams, EventFactory) {
  
  $scope.loading = true;

  EventFactory.Event.get({id: $routeParams.id}, function (response) {
    $scope.event = response;
    $scope.loading = false;
  });

  $scope.limit = 20;
});
