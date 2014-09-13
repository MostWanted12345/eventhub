'use strict';

angular.module('eventhub', [
  'ng',
  'ngRoute',
  'ngSanitize',
  'infinite-scroll',
  'eventhub.filters',
  'eventhub.services',
  'eventhub.directives',
  'eventhub.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {templateUrl: 'views/home.html', controller: 'HomeController'});
  $routeProvider.when('/events/', {templateUrl: 'views/event/list.html', controller: 'EventsController'});
  $routeProvider.when('/event/:id', {templateUrl: 'views/event/view.html', controller: 'EventController'});
  $routeProvider.otherwise({redirectTo: '/'});
}]);
