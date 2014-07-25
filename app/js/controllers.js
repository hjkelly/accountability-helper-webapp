"use strict";

/* Controllers */

var baseUrl = "http://localhost:8001";

angular.module("accountabilityHelper.controllers", ["base64", "ngCookies"])
    .run(["$rootScope", "$cookies", "$http", function ($rootScope, $cookies, $http) {
        // Retrieve email and JSON Web Token from the cookie, if they have them.
        $rootScope.myJwt = $cookies.jwt;
        $rootScope.myEmail = $cookies.email;
        // Add a "log out" function from anywhere in the app.
        // TODO: Should this be part of a separate controller/view in the menu
        // portion of the page?
        $rootScope.logOut = function () {
            delete $rootScope.myJwt;
            delete $rootScope.myEmail;
            delete $cookies.jwt;
            delete $cookies.email;
        };
        // Get the statuses available to submit.
        $http({method: "GET", url: baseUrl+"/checkins/statuses"})
            .success(function(data, status, headers, config) {
                $rootScope.checkinStatuses = data;
            })
            .error(function(data, status, headers, config) {
                alert("failure getting statuses");
            });
    }])
    .controller("WelcomeCtrl", ["$scope", function($scope) {

    }])
    .controller("LoginCtrl", ["$scope", "$http", "$cookies", "$location", "$rootScope", "$base64", function($scope, $http, $cookies, $location, $rootScope, $base64) {
        // If they"re logged in, kick them to the overview.
        if ($rootScope.myEmail || $rootScope.myJwt)
            $location.path("/overview");
        // Attempt the log in with a given user model (on the page)
        $scope.attemptLogin = function (user) {
            $http({method: "GET", url: baseUrl+"/users",
                   headers: {"Authorization": "Basic "+$base64.encode(user.email+":"+user.password)}})
                .success(function(data, status, headers, config) {
                    var jwt = data[0].jwt;
                    $rootScope.myJwt =   $cookies.jwt =   jwt;
                    $rootScope.myEmail = $cookies.email = user.email;
                    $location.path("/overview");
                })
                .error(function(data, status, headers, config) {
                    alert("failure");
                });
        };
    }])
    .controller("RegisterCtrl", ["$scope", "$http", "$cookies", "$location", "$rootScope", function($scope, $http, $cookies, $location, $rootScope) {
        // If they"re logged in, kick them to the overview.
        if ($rootScope.myEmail || $rootScope.myJwt)
            $location.path("/overview");
        // Attempt the registration with the given user model (on the page)
        $scope.attemptRegistration = function (user) {
            $http({method: "POST",
                   url: baseUrl+"/users",
                   data: {email: user.email, password: user.password}})
                .success(function(data, status, headers, config) {
                    var jwt = data.jwt;
                    $rootScope.myJwt =   $cookies.jwt =   jwt;
                    $rootScope.myEmail = $cookies.email = user.email;
                    $location.path("/overview");
                })
                .error(function(data, status, headers, config) {
                    alert("failure");
                });
        };
    }])
    .controller("OverviewCtrl", ["$scope", "$http", "$rootScope", function($scope, $http, $rootScope) {
        $http({method: "GET", url: baseUrl+"/checkins",
                headers: {"Authorization": "JWT "+$rootScope.myJwt}})
            .success(function(data, status, headers, config) {
                $scope.pastCheckins = data;
            })
            .error(function(data, status, headers, config) {
                alert("failure");
            });
    }])
    .controller("SubmitCheckinCtrl", ["$scope", "$http", "$location", "$rootScope", function($scope, $http, $location, $rootScope) {
        // Provide the last checkin"s timestamp.
        $http({method: "GET", url: baseUrl+"/checkins",
               headers: {"Authorization": "JWT "+$rootScope.myJwt}})
            .success(function(data, status, headers, config) {
                if (data.length) {
                    // TODO: is the ordering right here?
                    $scope.lastCheckinTimestamp = data[0].timestamp;
                } else {
                    $scope.lastCheckinTimestamp = false;
                }
            })
            .error(function(data, status, headers, config) {
                alert("failure");
            });
        // Give them a way to submit it.
        $scope.submitCheckin = function (checkin) {
            $http({method: "POST", url: baseUrl+"/checkins",
                   headers: {"Authorization": "JWT "+$rootScope.myJwt},
                   data: {"status": checkin.status}})
                .success(function(data, status, headers, config) {
                    $location.path("/overview");
                })
                .error(function(data, status, headers, config) {
                    alert("failure");
                });
        };
    }])
    .controller("SettingsCtrl", ["$scope", function($scope) {

    }]);
