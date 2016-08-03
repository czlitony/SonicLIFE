'use strict';

var managementControllers = angular.module('managementControllers', []);

managementControllers.controller('loginControl', 
                                  ['$scope', 'login', function ($scope, login) {
                                    $scope.modal = login.loginModal;
                                    $scope.user = {};
                                    $scope.login = function (user) {
                                      login.save(user).$promise.then(function(loggedUser) {
                                        $scope.user = loggedUser;
                                        $scope.modal.show = false;
                                      }, function (response) {
                                        $scope.test = response;
                                      });
                                    };
                                  }]);
