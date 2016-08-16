'use strict';

var app = angular.module('app', [
    'ui.router',
    'controllers',
    'services'
]);

/**
 * 由于整个应用都会和路由打交道，所以这里把$state和$stateParams这两个对象放到$rootScope上，方便其它地方引用和注入。
 * 这里的run方法只会在angular启动的时候运行一次。
 * @param  {[type]} $rootScope
 * @param  {[type]} $state
 * @param  {[type]} $stateParams
 * @return {[type]}
 */
app.run(
    ['$rootScope', '$state', '$stateParams', '$window',
        function($rootScope, $state, $stateParams, $window) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
            if ($window.sessionStorage["userInfo"]) {
                $rootScope.userInfo = JSON.parse($window.sessionStorage["userInfo"]);
            }
        }
    ])

// app.run(['$rootScope', '$state', 'UserService', function($rootScope, $state, UserService) {

//     $rootScope.$on('$stateChangeStart', function onRouteChangeStart(event, toState, toParams, fromState, fromParams) {
//         // When refresh the browser, check the session info to find out if the user has logged in.
//         if ($rootScope.userInfo.authenticated) {
//             return;
//         }

//         // doe she/he try to go to login? - let him/her go
//         if (toState.name == 'login') {
//             return;
//         }

//         var isAuthenticated = UserService.authenticated;
//         if (isAuthenticated) {
//             return;
//         }

//         // stop state change
//         event.preventDefault();

//         console.log('redirect to login');

//         $state.go("login");

//     });
// }]);

app.config(function($stateProvider, $urlRouterProvider) {

    // For any unmatched url, send to /route1
    // $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'view/home.html',
            controller: 'loginControl'
        })
        .state('login', {
            url: '/login',
            templateUrl: 'view/login.html',
            controller: 'loginControl'
        })
        .state('management', {
            url: '/management',
            // templateUrl: 'view/management.html',
            // controller: '',
            views: {
                '': {
                    templateUrl: 'view/management.html',
                    controller: ''
                },
                'header@management': {
                    url: '/header',
                    templateUrl: 'view/header.html',
                    controller: ''
                },
                'sidebar@management': {
                    url: '/sidebar',
                    templateUrl: 'view/mgmt_sidebar.html',
                    controller: ''
                },
                'content@management': {
                    template: '<div ui-view></div>'
                },
                'footer@management': {
                    url: '/footer',
                    templateUrl: 'view/footer.html',
                    controller: ''
                }
            }
        })
        .state('management.menu', {
            url: '/management/menu',
            templateUrl: 'view/mgmt_menu.html',
            controller: ''
        })
        .state('management.order', {
            url: '/management/order',
            templateUrl: 'view/mgmt_order.html',
            controller: ''
        })
        .state('management.schedule', {
            url: '/management/schedule',
            templateUrl: 'view/mgmt_schedule.html',
            controller: ''
        })
        .state('management.status', {
            url: '/management/status',
            templateUrl: 'view/mgmt_status.html',
            controller: ''
        })
});