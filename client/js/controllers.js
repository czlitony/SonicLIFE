'use strict';

var menuScheduleControllers = angular.module('menuScheduleControllers', []);

menuScheduleControllers.controller('menuScheduleCtrl', [
  '$scope', 'menuSchedule', 'order', 'login',
  function ($scope, menuSchedule, order, login) {
    $scope.chooseDish = function (index) {
      if ($scope.chosen === index) {
        $scope.chosen = undefined;
      } else {
        $scope.chosen = index;
      }
    };
    $scope.subscribe = function (index) {
      var chosenDish,
          chosenSchedule,
          data;

      try {
        chosenSchedule = $scope.schedules[0];
      } catch (e) {
        console.log('unable to scheduled menu, reason: ' + e);
        return;
      }

      try {
        chosenDish = chosenSchedule.menu.dishes[index];
      } catch (e){
        console.log('unable to find dish with index: ' + index + ', reason: ' + e);
        return;
      }

      if (!chosenDish) {
        console.log('Error: unable to the dish which is going to be subscribed');
        return;
      }

      data = {date : chosenSchedule.data, type : chosenSchedule.type, dishID : chosenDish.id, userID : 1};
      order.save(data, function (value, responseHeader) {
        $scope.order = value;
        $scope.chosen = -1;
      }, function () {
        
      });
    };
    $scope.unsubscribe = function (index) {
      var chosenDish,
          data;

      data = {};
      order.remove(data, function (value) {
        $scope.order = value;
        $scope.chosen = -1;
      }, function () {
      });

    };

    $scope.schedules = menuSchedule.query({menuScheduleID:''});
    $scope.schedules.$promise.then(function (s) {
      try {
        let scheduleID = s[0].menuID;
        // todo make decision about the url for getting order about specific user
        $scope.order = order.get({scheduleID : scheduleID, usedID : 1});
      } catch (e) {
        console.log(e);
        $scope.order = {};
      }
    });
  }
]);

menuScheduleControllers.controller('loginControl', 
                                  ['$scope', 'login', function ($scope, login) {
                                    $scope.modal = login.loginModal;
                                    $scope.user = {};
                                    $scope.login = function (user) {
                                      login.save(user).$promise.then(function(loggedUser) {
                                        $scope.user = loggedUser;
                                        $scope.modal.show = false;
                                      }, function (response) {
                                        
                                      });
                                    };
                                  }]);
