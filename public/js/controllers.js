'use strict';

var controllers = angular.module('controllers', []);

controllers.controller('loginControl', ['$rootScope', '$scope', '$window', 'login', 'UserService', function($rootScope, $scope, $window, login, UserService) {
    // $scope.modal = login.loginModal;
    // $scope.user = {};
    var userInfo = {};
    $scope.login = function(user) {
        login.save(user).$promise.then(function(data) {

            userInfo.authenticated = true;
            userInfo.username = data.username;
            userInfo.role = data.role;
            console.log(userInfo);

            if (userInfo.role == 'user') {
                $rootScope.$state.go('management');
            } else if (userInfo.role == 'admin') {
                $rootScope.$state.go('management');
            } else {
                console.log('role is not defined');
            }

            UserService = userInfo;

            $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);

        }, function(response) {
            userInfo.authenticated = false;
            userInfo.username = '';
            UuserInfoser.role = '';
            console.log('failed');
        });
    };
}]);