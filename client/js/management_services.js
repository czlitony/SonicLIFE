'use strict';

var managementServices = angular.module('managementServices', ['ngResource']);

managementServices.factory('menuSchedule', 
                             ['$resource', function ($resource) {
                               return $resource('__api__/schedule/:menuScheduleID');
                             }]);

managementServices.factory('order', 
                             ['$resource', function ($resource) {
                               return $resource('__api__/order/:orderID');
                             }]);

managementServices.factory('login', 
                             ['$resource', function ($resource) {
                               var ret = $resource('__api__/logon');
                               
                              //  ret.loginModal = {show: false};
                               return ret;
                             }]);
