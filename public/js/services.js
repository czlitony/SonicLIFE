'use strict';

var services = angular.module('services', ['ngResource']);

services.factory('menuSchedule', ['$resource', function($resource) {
    return $resource('__api__/schedule/:menuScheduleID');
}]);

services.factory('order', ['$resource', function($resource) {
    return $resource('__api__/order/:orderID');
}]);

services.factory('login', ['$resource', function($resource) {
    var ret = $resource('__api__/logon');

    //  ret.loginModal = {show: false};
    return ret;
}]);

services.factory('UserService', [function() {
    var user = {
        authenticated: false,
        username: '',
        role: ''
    };
    return user;
}]);