'use strict';

var menuScheduleServices = angular.module('menuScheduleServices', ['ngResource']);

menuScheduleServices.factory('menuSchedule', 
                             ['$resource', function ($resource) {
                               return $resource('__api__/schedule/:menuScheduleID');
                             }]);

menuScheduleServices.factory('order', 
                             ['$resource', function ($resource) {
                               return $resource('__api__/order/:orderID');
                             }]);

menuScheduleServices.factory('login', 
                             ['$resource', function ($resource) {
                               var ret = $resource('__api__/logon');
                               
                               ret.loginModal = {show: false};
                               return ret;
                             }]);
