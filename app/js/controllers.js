'use strict';

/* Controllers */

var baseUrl = 'http://localhost:8001';

angular.module('accountabilityHelper.controllers', ['base64', 'ngCookies'])
    .run(['$rootScope', '$cookies', function ($rootScope, $cookies) {
        // Retrieve email and JSON Web Token from the cookie, if they have them.
        $rootScope.myJwt = $cookies.jwt;
        $rootScope.myEmail = $cookies.email;
        // Add a 'log out' function from anywhere in the app.
        // TODO: Should this be part of a separate controller/view in the menu
        // portion of the page?
        $rootScope.logOut = function () {
            delete $rootScope.myJwt;
            delete $rootScope.myEmail;
            delete $cookies.jwt;
            delete $cookies.email;
        };
    }])
    .controller('WelcomeCtrl', ['$scope', function($scope) {

    }])
    .controller('LoginCtrl', ['$scope', '$http', '$cookies', '$rootScope', '$base64', function($scope, $http, $cookies, $rootScope, $base64) {
        $scope.attemptLogin = function (user) {
            $http({method: 'GET', url: baseUrl+'/users',
                   headers: {'Authorization': 'Basic '+$base64.encode(user.email+':'+user.password)}})
                .success(function(data, status, headers, config) {
                    var jwt = data[0].jwt;
                    $rootScope.myJwt =   $cookies.jwt =   jwt;
                    $rootScope.myEmail = $cookies.email = user.email;
                })
                .error(function(data, status, headers, config) {
                    console.log('failure!');
                });
        };
    }])
    .controller('RegisterCtrl', ['$scope', '$http', '$cookies', '$rootScope', function($scope, $http, $cookies, $rootScope) {
        $scope.attemptRegistration = function (user) {
            $http({method: 'POST',
                   url: baseUrl+'/users',
                   data: {email: user.email, password: user.password}})
                .success(function(data, status, headers, config) {
                    var jwt = data.jwt;
                    $rootScope.myJwt =   $cookies.jwt =   jwt;
                    $rootScope.myEmail = $cookies.email = user.email;
                })
                .error(function(data, status, headers, config) {
                    console.log("failure");
                });
        };
    }])
    .controller('OverviewCtrl', ['$scope', function($scope) {

    }])
    .controller('SubmitCheckinCtrl', ['$scope', function($scope) {

    }])
    .controller('SettingsCtrl', ['$scope', function($scope) {

    }]);
