(function() {
    'use strict';

    // Hope you didn't forget Angular! Duh-doy.
    if (!window.angular) throw new Error('I can\'t find Angular!');
    var app = angular.module('fsaPreBuilt', []);
    app.factory('Socket', function($rootScope) {
        if (!window.io) throw new Error('socket.io not found!');
        var socket = io.connect(window.location.origin);

        return {
            on: function(eventName, callback) {
                socket.on(eventName, function() {
                    var args = arguments;
                    $rootScope.$apply(function() {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function(eventName, data, callback) {
                socket.emit(eventName, data, function() {
                    var args = arguments;
                    $rootScope.$apply(function() {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                });
            }
        };
    });
    // AUTH_EVENTS is used throughout our app to
    // broadcast and listen from and to the $rootScope
    // for important events about authentication flow.
    app.constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    });

    app.constant('LETTER_EVENTS', {
        refreshLetters: 'refresh-letters'
    })

    app.factory('AuthInterceptor', function($rootScope, $q, AUTH_EVENTS) {
        var statusDict = {
            401: AUTH_EVENTS.notAuthenticated,
            403: AUTH_EVENTS.notAuthorized,
            419: AUTH_EVENTS.sessionTimeout,
            440: AUTH_EVENTS.sessionTimeout
        };
        return {
            responseError: function(response) {
                $rootScope.$broadcast(statusDict[response.status], response);
                return $q.reject(response)
            }
        };
    });

    app.config(function($httpProvider) {
        $httpProvider.interceptors.push([
            '$injector',
            function($injector) {
                return $injector.get('AuthInterceptor');
            }
        ]);
    });

    app.service('AuthService', function($http, Session, $rootScope, AUTH_EVENTS, $q) {

        function onSuccessfulLogin(response) {
            var data = response.data;
            Session.create(data.id, data.user);
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            return data.user;
        }

        // Uses the session factory to see if an
        // authenticated user is currently registered.
        this.isAuthenticated = function() {
            return !!Session.user;
        };

        this.getLoggedInUser = function(fromServer) {

            // If an authenticated session exists, we
            // return the user attached to that session
            // with a promise. This ensures that we can
            // always interface with this method asynchronously.

            // Optionally, if true is given as the fromServer parameter,
            // then this cached value will not be used.

            if (this.isAuthenticated() && fromServer !== true) {
                return $q.when(Session.user);
            }

            // Make request GET /session.
            // If it returns a user, call onSuccessfulLogin with the response.
            // If it returns a 401 response, we catch it and instead resolve to null.
            return $http.get('/session').then(onSuccessfulLogin).catch(function() {
                return null;
            });

        };

        this.login = function(credentials) {
            return $http.post('/login', credentials)
                .then(onSuccessfulLogin)
                .catch(function(err) {
                    return $q.reject({
                        message: err
                    });
                });
        };

        this.signup = function(user) {
            return $http.post('/signup', user).then(response => {
                return response.data
            })
        }

        this.logout = function() {
            return $http.get('/logout').then(function() {
                Session.destroy();
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
            });
        };

    });

    app.service('Session', function($rootScope, AUTH_EVENTS) {

        var self = this;

        $rootScope.$on(AUTH_EVENTS.notAuthenticated, function() {
            self.destroy();
        });

        $rootScope.$on(AUTH_EVENTS.sessionTimeout, function() {
            self.destroy();
        });

        this.id = null;
        this.user = null;

        this.create = function(sessionId, user) {
            this.id = sessionId;
            this.user = user;
        };

        this.destroy = function() {
            this.id = null;
            this.user = null;
        };

    });

})();


window.EventEmitter = function() {
    this.subscribers = {};
};
(function(EE) {

    // To be used like:
    // instanceOfEE.on('touchdown', cheerFn);
    EE.prototype.on = function(eventName, eventListener) {

        // If this instance's subscribers object does not yet
        // have the key matching the given event name, create the
        // key and assign the value of an empty array.
        if (!this.subscribers[eventName]) {
            this.subscribers[eventName] = [];
        }

        // Push the given listener function into the array
        // located on the instance's subscribers object.
        this.subscribers[eventName].push(eventListener);

    };

    // To be used like:
    // instanceOfEE.emit('codec', 'Hey Snake, Otacon is calling!');
    EE.prototype.emit = function(eventName) {

        // If there are no subscribers to this event name, why even?
        if (!this.subscribers[eventName]) {
            return;
        }

        // Grab the remaining arguments to our emit function.
        var remainingArgs = [].slice.call(arguments, 1);

        // For each subscriber, call it with our arguments.
        this.subscribers[eventName].forEach(function(listener) {
            listener.apply(null, remainingArgs);
        });

    };

    app.service('SpinnerService', function($rootScope, usSpinnerService, $http, $timeout) {
        var whenToSpin = function() {
            var request_count = 0;

            for(var i = 0; i < $http.pendingRequests.length; ++i) {
              if($http.pendingRequests[i].method.toLowerCase() === 'post'
              || $http.pendingRequests[i].method.toLowerCase() === 'put')
                request_count+=1;
            }

            return request_count > 0;
        };

        $rootScope.$watch(whenToSpin, function(hasPending) {
              if (hasPending) {
                usSpinnerService.spin('spinner-1');
              } else {
                usSpinnerService.stop('spinner-1');
              }
        });
    });

})(window.EventEmitter);
