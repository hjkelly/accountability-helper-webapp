'use strict';


// Declare app level module which depends on filters, and services
angular.module('accountabilityHelper', [
  'ngRoute',
  'accountabilityHelper.filters',
  'accountabilityHelper.services',
  'accountabilityHelper.directives',
  'accountabilityHelper.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {templateUrl: 'partials/welcome.html', controller: 'WelcomeCtrl'});
  $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'LoginCtrl'});
  $routeProvider.when('/register', {templateUrl: 'partials/register.html', controller: 'RegisterCtrl'});
  $routeProvider.when('/overview', {templateUrl: 'partials/overview.html', controller: 'OverviewCtrl'});
  $routeProvider.when('/submit-checkin', {templateUrl: 'partials/submit-checkin.html', controller: 'SubmitCheckinCtrl'});
  $routeProvider.when('/settings', {templateUrl: 'partials/settings.html', controller: 'SettingsCtrl'});
  $routeProvider.otherwise({redirectTo: '/'});
}]);
