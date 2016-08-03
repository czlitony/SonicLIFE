'use strict';

var managementApp = angular.module('managementApp', [
  'ngRoute',
  'managementControllers',
  'managementServices'
]);

managementApp.config(['$routeProvider', '$locationProvider',
                function ($routeProvider, $locationProvider) {
                  $routeProvider
                    // .when('/', {
                    //   templateUrl : 'view/menuSchedule.html',
                    //   controller : 'menuScheduleCtrl'
                    // })
                    .when('/', {
                      templateUrl : 'view/login.html',
                      controller : 'loginControl'
                    })
                    .when('/management', {
                      templateUrl : 'view/management.html',
                      // controller : 'loginControl'
                    })
                    .otherwise({
                      redirectTo : '/'
                    });
                  $locationProvider
                    .html5Mode(true);
                 }]);