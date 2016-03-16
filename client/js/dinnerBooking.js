'use strict';

var dinnerBookingApp = angular.module('dinnerBookingApp', [
  'ngRoute',
  'menuScheduleControllers',
  'menuScheduleServices'
]);

dinnerBookingApp.config(['$routeProvider', '$locationProvider',
                function ($routeProvider, $locationProvider) {
                  $routeProvider.when('/', {
                    templateUrl : 'view/menuSchedule.html',
                    controller : 'menuScheduleCtrl'
                  }).otherwise({
                    redirectTo : '/'
                  });
                  $locationProvider.html5Mode(true);
                }
               ]);
