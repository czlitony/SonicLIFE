'use strict';

var dinnerBookingApp = angular.module('dinnerBookingApp', [
  'ngRoute',
  'menuScheduleControllers',
  'menuScheduleServices'
]);

dinnerBookingApp.config(['$routeProvider', '$locationProvider',
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
                    .otherwise({
                      redirectTo : '/'
                    });
                  $locationProvider
                    .html5Mode(true);
                 }]);