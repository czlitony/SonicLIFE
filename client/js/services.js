'use strict';

var menuScheduleServices = angular.module('menuScheduleServices', ['ngResource']);

menuScheduleServices.factory('menuSchedule', 
                             ['$resource', function ($resource) {
                               return $resource('menuSchedule/:menuScheduleID');
                             }]);

menuScheduleServices.factory('order', 
                             ['$resource', function ($resource) {
                               return $resource('order/:orderID');
                             }]);

menuScheduleServices.factory('login', 
                             ['$resource', function ($resource) {
                               var ret = $resource('http://10.103.227.37:3000/__api__/logon');
                               
                               ret.loginModal = {show: false};
                               return ret;
                             }]);
