'use strict';

/**
 * @ngdoc overview
 * @name offgridmonitoringApp
 * @description
 * # offgridmonitoringApp
 *
 * Main module of the application.
 */
angular
  .module('offgridmonitoringApp', [
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'lbServices'
  ])
  .config(function ($routeProvider, $httpProvider, LoopBackResourceProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
      })
      .otherwise({
        redirectTo: '/'
      });

    // TODO: Get grunt to provide config variables.
    LoopBackResourceProvider.setUrlBase('http://localhost:3000/api');

    // From https://docs.strongloop.com/display/public/LB/AngularJS+JavaScript+SDK
    $httpProvider.interceptors.push(function($q, $location, LoopBackAuth) {
      return {
        responseError: function(rejection) {
          if (rejection.status == 401) {
            // Now clearing the loopback values from client browser for safe logout...
            LoopBackAuth.clearUser();
            LoopBackAuth.clearStorage();
            $location.nextAfterLogin = $location.path();
            $location.path('/login');
          }
          return $q.reject(rejection);
        }
      };
    });
  });
