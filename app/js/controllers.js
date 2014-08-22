"use strict";

/* Controllers */

angular.module("accountabilityHelper.controllers", ["base64", "ngCookies"])
    .run(["$rootScope", "$location", "$cookies", "$http", "apiBaseUrl", function ($rootScope, $location, $cookies, $http, apiBaseUrl) {
        // Retrieve email and JSON Web Token from the cookie, if they have them.
        $rootScope.myJwt = $cookies.jwt;
        $rootScope.myEmail = $cookies.email;
        // Add a "log out" function from anywhere in the app.
        $rootScope.logOut = function () {
            console.log("logging out with rootScope vars:");
            console.log($rootScope);
            delete $rootScope.myJwt;
            delete $rootScope.myEmail;
            delete $cookies.jwt;
            delete $cookies.email;
            console.log("redirecting! with rootScope vars:");
            console.log($rootScope);
            $location.path("/login");
        };
        // Get the statuses available to submit.
        $http({method: "GET", url: apiBaseUrl+"/checkins/statuses"})
            .success(function(data, status, headers, config) {
                $rootScope.checkinStatuses = data;
                $rootScope.checkinStatusesByValue = {};
                for (var i in data) {
                    $rootScope.checkinStatusesByValue[data[i].value] = data[i].label;
                };
            })
            .error(function(data, status, headers, config) {
                console.log(data);
            });
    }])
    .controller("WelcomeCtrl", ["$scope", "$location", "$rootScope", function($scope, $location, $rootScope) {
        // If they"re logged in, kick them to the overview. TODO: Make this
        // friendlier? Maybe they want to get to the homepage!
        if ($rootScope.myEmail || $rootScope.myJwt)
            $location.path("/overview");
    }])
    .controller("LoginCtrl", ["$scope", "$http", "$cookies", "$location", "$rootScope", "$base64", "apiBaseUrl", function($scope, $http, $cookies, $location, $rootScope, $base64, apiBaseUrl) {
        // If they"re logged in, kick them to the overview.
        if ($rootScope.myEmail || $rootScope.myJwt)
            $location.path("/overview");
        // Attempt the log in with a given user model (on the page)
        $scope.attemptLogin = function (user) {
            $http({method: "GET", url: apiBaseUrl+"/users",
                   headers: {"Authorization": "Basic "+$base64.encode(user.email+":"+user.password)}})
                .success(function(data, status, headers, config) {
                    var jwt = data[0].jwt;
                    $rootScope.myJwt =   $cookies.jwt =   jwt;
                    $rootScope.myEmail = $cookies.email = user.email;
                    $location.path("/overview");
                })
                .error(function(data, status, headers, config) {
                    console.log(data);
                });
        };
    }])
    .controller("RegisterCtrl", ["$scope", "$http", "$cookies", "$location", "$rootScope", "apiBaseUrl", function($scope, $http, $cookies, $location, $rootScope, apiBaseUrl) {
        // If they"re logged in, kick them to the overview.
        if ($rootScope.myEmail || $rootScope.myJwt)
            $location.path("/overview");
        // Attempt the registration with the given user model (on the page)
        $scope.attemptRegistration = function (user) {
            $http({method: "POST",
                   url: apiBaseUrl+"/users",
                   data: {email: user.email, password: user.password}})
                .success(function(data, status, headers, config) {
                    var jwt = data.jwt;
                    $rootScope.myJwt =   $cookies.jwt =   jwt;
                    $rootScope.myEmail = $cookies.email = user.email;
                    $location.path("/overview");
                })
                .error(function(data, status, headers, config) {
                    alert(data);
                });
        };
    }])
    .controller("OverviewCtrl", ["$scope", "$http", "$rootScope", "apiBaseUrl", function($scope, $http, $rootScope, apiBaseUrl) {
        $http({method: "GET", url: apiBaseUrl+"/checkins",
               headers: {"Authorization": "JWT "+$rootScope.myJwt}})
            .success(function(data, status, headers, config) {
                $scope.pastCheckins = data;
            })
            .error(function(data, status, headers, config) {
                // If the error message is that our JWT is outdated, log them out.
                if (data.message == "Signature verification failed") $rootScope.logOut();
            });
        $http({method: "GET", url: apiBaseUrl+"/partners",
               headers: {"Authorization": "JWT "+$rootScope.myJwt}})
            .success(function(data, status, headers, config) {
                $scope.partners = data;
            })
            .error(function(data, status, headers, config) {
                // If the error message is that our JWT is outdated, log them out.
                if (data.message == "Signature verification failed") $rootScope.logOut();
            });
    }])
    .controller("SubmitCheckinCtrl", ["$scope", "$http", "$location", "$rootScope", "apiBaseUrl", function($scope, $http, $location, $rootScope, apiBaseUrl) {
        // Provide the last checkin"s timestamp.
        $http({method: "GET", url: apiBaseUrl+"/checkins",
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
                // If the error message is that our JWT is outdated, log them out.
                if (data.message == "Signature verification failed") $rootScope.logOut();
            });
        // Give them a way to submit it.
        $scope.submitCheckin = function (checkin) {
            // We should automatically have the label, but make it an int.
            checkin.statusValue = parseInt(checkin.statusValue, 10);
            checkin.statusLabel = $rootScope.checkinStatusesByValue[checkin.statusValue];
            // Submit the checkin with the label and value.
            $http({method: "POST", url: apiBaseUrl+"/checkins",
                   headers: {"Authorization": "JWT "+$rootScope.myJwt},
                   data: checkin})
                .success(function(data, status, headers, config) {
                    $location.path("/overview");
                })
                .error(function(data, status, headers, config) {
                    // If the error message is that our JWT is outdated, log them out.
                    if (data.message == "Signature verification failed") $rootScope.logOut();
                });
        };
    }])
    .controller("SettingsCtrl", ["$scope", "$http", "$location", "$rootScope", "apiBaseUrl", function($scope, $http, $location, $rootScope, apiBaseUrl) {
        // Get the existing list of partners.
        $http({method: "GET", url: apiBaseUrl+"/partners",
               headers: {"Authorization": "JWT "+$rootScope.myJwt}})
            .success(function(data, status, headers, config) {
                $scope.partnerEmails = data;
            })
            .error(function(data, status, headers, config) {
                // If the error message is that our JWT is outdated, log them out.
                if (data.message == "Signature verification failed") $rootScope.logOut();
            });
        // Give them a way to update them.
        $scope.submitPartners = function (partnerEmails) {
            $http({method: "POST", url: apiBaseUrl+"/partners",
                   headers: {"Authorization": "JWT "+$rootScope.myJwt},
                   data: partnerEmails})
                .success(function(data, status, headers, config) {
                    $location.path("/overview");
                })
                .error(function(data, status, headers, config) {
                    // If the error message is that our JWT is outdated, log them out.
                    if (data.message == "Signature verification failed") $rootScope.logOut();
                });
        };
    }]);
