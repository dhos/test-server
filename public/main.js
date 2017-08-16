'use strict';

window.app = angular.module('elite-lc-portal', ['fsaPreBuilt', 'ui.router', 'ui.bootstrap', 'ngAnimate']);

app.config(function ($urlRouterProvider, $locationProvider, $compileProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode(true);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|local|data|chrome-extension):/);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
    // Trigger page refresh when accessing an OAuth route
    $urlRouterProvider.when('/auth/:provider', function () {
        window.location.reload();
    });
});

// This app.run is for controlling access to specific states.
app.run(function ($rootScope, AuthService, $state) {

    // The given state requires an authenticated user.
    var destinationStateRequiresAuth = function destinationStateRequiresAuth(state) {
        return state.data && state.data.authenticate;
    };

    // $stateChangeStart is an event fired
    // whenever the process of changing a state begins.
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

        if (!destinationStateRequiresAuth(toState)) {
            // The destination state does not require authentication
            // Short circuit with return.
            return;
        }

        if (AuthService.isAuthenticated()) {
            // The user is authenticated.
            // Short circuit with return.
            return;
        }

        // Cancel navigating to new state.
        event.preventDefault();

        AuthService.getLoggedInUser().then(function (user) {
            // If a user is retrieved, then renavigate to the destination
            // (the second time, AuthService.isAuthenticated() will work)
            // otherwise, if no user is logged in, go to "login" state.
            if (user) {
                $state.transitionTo(toState.name, toParams);
            } else {
                $state.transitionTo('home');
            }
        });
    });
});
app.config(function ($stateProvider) {
    $stateProvider.state('dashboard', {
        templateUrl: 'js/dashboard/dashboard.html',
        controller: 'dashboardCtrl',
        url: '/dashboard',
        // data: {
        //     authenticate: true
        // },
        resolve: {
            // letters: (lcFactory) => {
            //     return lcFactory.getLetters({}).then(letters => {
            //         return letters
            //     })
            // }
        }
    });
});

app.controller('dashboardCtrl', function ($scope, $state) {

    //inits
    // $scope.letters = letters
    //$scope.analytics = analytics

    //end inits


});
app.config(function ($stateProvider) {
    $stateProvider.state('landing', {
        templateUrl: 'js/landing/landing.html',
        controller: 'landingCtrl',
        url: '/'
    });
});

app.controller('landingCtrl', function ($scope) {});
app.config(function ($stateProvider) {
    $stateProvider.state('listManager', {
        templateUrl: 'js/listManager/_listManager.html',
        controller: 'listManagerCtrl',
        url: '/listManager',
        data: {
            authenticat: true
        },
        resolve: {
            letters: function letters(lcFactory) {
                return lcFactory.getLetters({}).then(function (letters) {
                    return letters;
                });
            }
        }
    });
});

app.controller('listManagerCtrl', function ($scope, lcFactory) {
    $scope.createLC = function () {
        //opens a modal for a new lc
        //.then to creat the lc and then go to it
    };

    $scope.viewSingleLetter = function (letterID) {
        $state.go('singleLetter', {
            id: letterID
        });
    };
});

app.factory('countryFactory', function ($http, $q) {
    var d = {};
    //Fetches
    d.getCountries = function (query) {
        return $http.get('/api/lc/', {
            params: query
        }).then(function (response) {
            return response.data;
        }).catch(function (err) {
            return $q.reject({
                message: err
            });
        });
    };
    d.getSingleCountry = function (id) {
        return $http.get('/api/lc/' + id).then(function (response) {
            return response.data;
        }).catch(function (err) {
            return $q.reject({
                message: err
            });
        });
    };

    //End Fetches

    //Sets
    d.createCountry = function (Country) {
        return $http.post('/api/lc/').then(function (response) {
            return response.data;
        }).catch(function (err) {
            return $q.reject({
                message: err
            });
        });
    };

    //End Sets

    //Updates
    d.updateCountry = function (Country) {
        return $http.put('/api/lc/' + Country.id).then(function (response) {
            return response.data;
        }).catch(function (err) {
            return $q.reject({
                message: err
            });
        });
    };

    //End Updates

    //Deletes
    d.deleteCountry = function (query) {
        return $http.delete('/api/lc/', {
            params: query
        }).then(function (response) {
            return response.data;
        }).catch(function (err) {
            return $q.reject({
                message: err
            });
        });
    };

    //End Deletes
    return d;
});
app.factory('lcFactory', function ($http, $q) {
    var d = {};
    //Fetches
    d.getLetters = function (query) {
        return $http.get('/api/lc/', {
            params: query
        }).then(function (response) {
            return response.data;
        }).catch(function (err) {
            return $q.reject({
                message: err
            });
        });
    };
    d.getSingleLetter = function (id) {
        return $http.get('/api/lc/' + id).then(function (response) {
            return response.data;
        }).catch(function (err) {
            return $q.reject({
                message: err
            });
        });
    };

    //End Fetches

    //Sets
    d.createLetter = function (letter) {
        return $http.post('/api/lc/').then(function (response) {
            return response.data;
        }).catch(function (err) {
            return $q.reject({
                message: err
            });
        });
    };

    //End Sets

    //Updates
    d.updateLetter = function (letter) {
        return $http.put('/api/lc/' + letter.id).then(function (response) {
            return response.data;
        }).catch(function (err) {
            return $q.reject({
                message: err
            });
        });
    };

    //End Updates

    //Deletes
    d.deleteLetter = function (query) {
        return $http.delete('/api/lc/', {
            params: query
        }).then(function (response) {
            return response.data;
        }).catch(function (err) {
            return $q.reject({
                message: err
            });
        });
    };

    //End Deletes
    return d;
});

(function () {
    'use strict';

    // Hope you didn't forget Angular! Duh-doy.

    if (!window.angular) throw new Error('I can\'t find Angular!');

    var app = angular.module('fsaPreBuilt', []);

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

    app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
        var statusDict = {
            401: AUTH_EVENTS.notAuthenticated,
            403: AUTH_EVENTS.notAuthorized,
            419: AUTH_EVENTS.sessionTimeout,
            440: AUTH_EVENTS.sessionTimeout
        };
        return {
            responseError: function responseError(response) {
                $rootScope.$broadcast(statusDict[response.status], response);
                return $q.reject(response);
            }
        };
    });

    app.config(function ($httpProvider) {
        $httpProvider.interceptors.push(['$injector', function ($injector) {
            return $injector.get('AuthInterceptor');
        }]);
    });

    app.service('AuthService', function ($http, Session, $rootScope, AUTH_EVENTS, $q) {

        function onSuccessfulLogin(response) {
            var data = response.data;
            Session.create(data.id, data.user);
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            return data.user;
        }

        // Uses the session factory to see if an
        // authenticated user is currently registered.
        this.isAuthenticated = function () {
            return !!Session.user;
        };

        this.getLoggedInUser = function (fromServer) {

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
            return $http.get('/session').then(onSuccessfulLogin).catch(function () {
                return null;
            });
        };

        this.login = function (credentials) {
            return $http.post('/login', credentials).then(onSuccessfulLogin).catch(function (err) {
                return $q.reject({
                    message: err
                });
            });
        };

        this.signup = function (user) {
            return $http.post('/signup', user).then(function (response) {
                return response.data;
            });
        };

        this.logout = function () {
            return $http.get('/logout').then(function () {
                Session.destroy();
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
            });
        };
    });

    app.service('Session', function ($rootScope, AUTH_EVENTS) {

        var self = this;

        $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
            self.destroy();
        });

        $rootScope.$on(AUTH_EVENTS.sessionTimeout, function () {
            self.destroy();
        });

        this.id = null;
        this.user = null;

        this.create = function (sessionId, user) {
            this.id = sessionId;
            this.user = user;
        };

        this.destroy = function () {
            this.id = null;
            this.user = null;
        };
    });
})();

window.EventEmitter = function () {
    this.subscribers = {};
};
(function (EE) {

    // To be used like:
    // instanceOfEE.on('touchdown', cheerFn);
    EE.prototype.on = function (eventName, eventListener) {

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
    EE.prototype.emit = function (eventName) {

        // If there are no subscribers to this event name, why even?
        if (!this.subscribers[eventName]) {
            return;
        }

        // Grab the remaining arguments to our emit function.
        var remainingArgs = [].slice.call(arguments, 1);

        // For each subscriber, call it with our arguments.
        this.subscribers[eventName].forEach(function (listener) {
            listener.apply(null, remainingArgs);
        });
    };
})(window.EventEmitter);
+function ($) {

    $(function () {

        // Checks for ie
        var isIE = !!navigator.userAgent.match(/MSIE/i) || !!navigator.userAgent.match(/Trident.*rv:11\./);
        isIE && $('html').addClass('ie');

        // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
        var ua = window['navigator']['userAgent'] || window['navigator']['vendor'] || window['opera'];
        /iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/.test(ua) && $('html').addClass('smart');
    });
}(jQuery);
+function ($) {

    $(function () {

        $("[ui-jq]").each(function () {
            var self = $(this);
            var options = eval('[' + self.attr('ui-options') + ']');

            if ($.isPlainObject(options[0])) {
                options[0] = $.extend({}, options[0]);
            }

            uiLoad.load(jp_config[self.attr('ui-jq')]).then(function () {
                self[self.attr('ui-jq')].apply(self, options);
            });
        });
    });
}(jQuery);
/**
 * 0.1.0
 * Deferred load js/css file, used for ui-jq.js and Lazy Loading.
 * 
 * @ flatfull.com All Rights Reserved.
 * Author url: http://themeforest.net/user/flatfull
 */
var uiLoad = uiLoad || {};

(function ($, $document, uiLoad) {
    "use strict";

    var loaded = [],
        promise = false,
        deferred = $.Deferred();

    /**
     * Chain loads the given sources
     * @param srcs array, script or css
     * @returns {*} Promise that will be resolved once the sources has been loaded.
     */
    uiLoad.load = function (srcs) {
        srcs = $.isArray(srcs) ? srcs : srcs.split(/\s+/);
        if (!promise) {
            promise = deferred.promise();
        }

        $.each(srcs, function (index, src) {
            promise = promise.then(function () {
                return src.indexOf('.css') >= 0 ? loadCSS(src) : loadScript(src);
            });
        });
        deferred.resolve();
        return promise;
    };

    /**
     * Dynamically loads the given script
     * @param src The url of the script to load dynamically
     * @returns {*} Promise that will be resolved once the script has been loaded.
     */
    var loadScript = function loadScript(src) {
        if (loaded[src]) return loaded[src].promise();

        var deferred = $.Deferred();
        var script = $document.createElement('script');
        script.src = src;
        script.onload = function (e) {
            deferred.resolve(e);
        };
        script.onerror = function (e) {
            deferred.reject(e);
        };
        $document.body.appendChild(script);
        loaded[src] = deferred;

        return deferred.promise();
    };

    /**
     * Dynamically loads the given CSS file
     * @param href The url of the CSS to load dynamically
     * @returns {*} Promise that will be resolved once the CSS file has been loaded.
     */
    var loadCSS = function loadCSS(href) {
        if (loaded[href]) return loaded[href].promise();

        var deferred = $.Deferred();
        var style = $document.createElement('link');
        style.rel = 'stylesheet';
        style.type = 'text/css';
        style.href = href;
        style.onload = function (e) {
            deferred.resolve(e);
        };
        style.onerror = function (e) {
            deferred.reject(e);
        };
        $document.head.appendChild(style);
        loaded[href] = deferred;

        return deferred.promise();
    };
})(jQuery, document, uiLoad);
+function ($) {

    $(function () {

        // nav
        $(document).on('click', '[ui-nav] a', function (e) {
            var $this = $(e.target),
                $active;
            $this.is('a') || ($this = $this.closest('a'));

            $active = $this.parent().siblings(".active");
            $active && $active.toggleClass('active').find('> ul:visible').slideUp(200);

            $this.parent().hasClass('active') && $this.next().slideUp(200) || $this.next().slideDown(200);
            $this.parent().toggleClass('active');

            $this.next().is('ul') && e.preventDefault();
        });
    });
}(jQuery);
+function ($) {

    $(function () {

        $(document).on('click', '[ui-toggle-class]', function (e) {
            e.preventDefault();
            var $this = $(e.target);
            $this.attr('ui-toggle-class') || ($this = $this.closest('[ui-toggle-class]'));

            var classes = $this.attr('ui-toggle-class').split(','),
                targets = $this.attr('target') && $this.attr('target').split(',') || Array($this),
                key = 0;
            $.each(classes, function (index, value) {
                var target = targets[targets.length && key];
                $(target).toggleClass(classes[index]);
                key++;
            });
            $this.toggleClass('active');
        });
    });
}(jQuery);
app.config(function ($stateProvider) {
    $stateProvider.state('singleLetter', {
        templateUrl: 'js/listManager/singleLetter/singleLetter.html',
        controller: 'singleLetterCtrl',
        url: '/listManager/:id',
        resolve: {
            letter: function letter(lcFactory, $stateParams) {
                return lcFactory.getSinglerLetter($stateParams.id).then(function (letter) {
                    return letter;
                });
            }
        }
    });
});

app.controller('singleLetterCtrl', function ($scope, letter, lcFactory) {
    //inits

    $scope.letter = letter;

    //end inits
    $scope.updateLetter = function (letterToBeUpdated) {
        lcFactory.updateLetter(letterToBeUpdated).then(function (updatedLetter) {
            //perhaps this should be a create rather than an update
            $scope.letter = updatedLetter;
        });
    };
});
app.directive('sidebar', function ($rootScope, AuthService, AUTH_EVENTS, $state) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/_common/directives/aside/aside.html',
        link: function link(scope) {}

    };
});
app.directive('footer', function ($state) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/_common/directives/footer/footer.html'
    };
});
app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/_common/directives/navbar/navbar.html',
        link: function link(scope) {

            scope.user = null;

            scope.isLoggedIn = function () {
                return AuthService.isAuthenticated();
            };

            scope.logout = function () {
                AuthService.logout().then(function () {
                    $state.go('home');
                });
            };

            var setUser = function setUser() {
                AuthService.getLoggedInUser().then(function (user) {
                    scope.user = user;
                });
            };

            var removeUser = function removeUser() {
                scope.user = null;
            };
            scope.logout = function () {
                AuthService.logout().then(function () {
                    $state.go('login');
                });
            };
            setUser();

            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);
        }

    };
});

app.config(function ($stateProvider) {
    $stateProvider.state('review', {
        templateUrl: 'js/listManager/singleLetter/review/review.html',
        controller: 'reviewCtrl',
        url: '/',
        parent: 'singleLetter'
    });
});

app.controller('reviewCtrl', function ($scope) {});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImRhc2hib2FyZC9kYXNoYm9hcmQuanMiLCJsYW5kaW5nL2xhbmRpbmcuanMiLCJsaXN0TWFuYWdlci9fbGlzdE1hbmFnZXIuanMiLCJfY29tbW9uL2ZhY3Rvcmllcy9jb3VudHJ5RmFjdG9yeS5qcyIsIl9jb21tb24vZmFjdG9yaWVzL2xjRmFjdG9yeS5qcyIsIl9jb21tb24vcHJlYnVpbHQvZnNhLXByZS1idWlsdC5qcyIsIl9jb21tb24vcHJlYnVpbHQvdWktY2xpZW50LmpzIiwiX2NvbW1vbi9wcmVidWlsdC91aS1qcC5qcyIsIl9jb21tb24vcHJlYnVpbHQvdWktbG9hZC5qcyIsIl9jb21tb24vcHJlYnVpbHQvdWktbmF2LmpzIiwiX2NvbW1vbi9wcmVidWlsdC91aS10b2dnbGUuanMiLCJsaXN0TWFuYWdlci9zaW5nbGVMZXR0ZXIvc2luZ2xlTGV0dGVyLmpzIiwiX2NvbW1vbi9kaXJlY3RpdmVzL2FzaWRlL2FzaWRlLmpzIiwiX2NvbW1vbi9kaXJlY3RpdmVzL2Zvb3Rlci9mb290ZXIuanMiLCJfY29tbW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5qcyIsImxpc3RNYW5hZ2VyL3NpbmdsZUxldHRlci9yZXZpZXcvcmV2aWV3LmpzIl0sIm5hbWVzIjpbIndpbmRvdyIsImFwcCIsImFuZ3VsYXIiLCJtb2R1bGUiLCJjb25maWciLCIkdXJsUm91dGVyUHJvdmlkZXIiLCIkbG9jYXRpb25Qcm92aWRlciIsIiRjb21waWxlUHJvdmlkZXIiLCJodG1sNU1vZGUiLCJhSHJlZlNhbml0aXphdGlvbldoaXRlbGlzdCIsIm90aGVyd2lzZSIsIndoZW4iLCJsb2NhdGlvbiIsInJlbG9hZCIsInJ1biIsIiRyb290U2NvcGUiLCJBdXRoU2VydmljZSIsIiRzdGF0ZSIsImRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGgiLCJzdGF0ZSIsImRhdGEiLCJhdXRoZW50aWNhdGUiLCIkb24iLCJldmVudCIsInRvU3RhdGUiLCJ0b1BhcmFtcyIsImlzQXV0aGVudGljYXRlZCIsInByZXZlbnREZWZhdWx0IiwiZ2V0TG9nZ2VkSW5Vc2VyIiwidGhlbiIsInVzZXIiLCJ0cmFuc2l0aW9uVG8iLCJuYW1lIiwiJHN0YXRlUHJvdmlkZXIiLCJ0ZW1wbGF0ZVVybCIsImNvbnRyb2xsZXIiLCJ1cmwiLCJyZXNvbHZlIiwiJHNjb3BlIiwiYXV0aGVudGljYXQiLCJsZXR0ZXJzIiwibGNGYWN0b3J5IiwiZ2V0TGV0dGVycyIsImNyZWF0ZUxDIiwidmlld1NpbmdsZUxldHRlciIsImxldHRlcklEIiwiZ28iLCJpZCIsImZhY3RvcnkiLCIkaHR0cCIsIiRxIiwiZCIsImdldENvdW50cmllcyIsInF1ZXJ5IiwiZ2V0IiwicGFyYW1zIiwicmVzcG9uc2UiLCJjYXRjaCIsInJlamVjdCIsIm1lc3NhZ2UiLCJlcnIiLCJnZXRTaW5nbGVDb3VudHJ5IiwiY3JlYXRlQ291bnRyeSIsIkNvdW50cnkiLCJwb3N0IiwidXBkYXRlQ291bnRyeSIsInB1dCIsImRlbGV0ZUNvdW50cnkiLCJkZWxldGUiLCJnZXRTaW5nbGVMZXR0ZXIiLCJjcmVhdGVMZXR0ZXIiLCJsZXR0ZXIiLCJ1cGRhdGVMZXR0ZXIiLCJkZWxldGVMZXR0ZXIiLCJFcnJvciIsImNvbnN0YW50IiwibG9naW5TdWNjZXNzIiwibG9naW5GYWlsZWQiLCJsb2dvdXRTdWNjZXNzIiwic2Vzc2lvblRpbWVvdXQiLCJub3RBdXRoZW50aWNhdGVkIiwibm90QXV0aG9yaXplZCIsIkFVVEhfRVZFTlRTIiwic3RhdHVzRGljdCIsInJlc3BvbnNlRXJyb3IiLCIkYnJvYWRjYXN0Iiwic3RhdHVzIiwiJGh0dHBQcm92aWRlciIsImludGVyY2VwdG9ycyIsInB1c2giLCIkaW5qZWN0b3IiLCJzZXJ2aWNlIiwiU2Vzc2lvbiIsIm9uU3VjY2Vzc2Z1bExvZ2luIiwiY3JlYXRlIiwiZnJvbVNlcnZlciIsImxvZ2luIiwiY3JlZGVudGlhbHMiLCJzaWdudXAiLCJsb2dvdXQiLCJkZXN0cm95Iiwic2VsZiIsInNlc3Npb25JZCIsIkV2ZW50RW1pdHRlciIsInN1YnNjcmliZXJzIiwiRUUiLCJwcm90b3R5cGUiLCJvbiIsImV2ZW50TmFtZSIsImV2ZW50TGlzdGVuZXIiLCJlbWl0IiwicmVtYWluaW5nQXJncyIsInNsaWNlIiwiY2FsbCIsImFyZ3VtZW50cyIsImZvckVhY2giLCJsaXN0ZW5lciIsImFwcGx5IiwiJCIsImlzSUUiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJtYXRjaCIsImFkZENsYXNzIiwidWEiLCJ0ZXN0IiwialF1ZXJ5IiwiZWFjaCIsIm9wdGlvbnMiLCJldmFsIiwiYXR0ciIsImlzUGxhaW5PYmplY3QiLCJleHRlbmQiLCJ1aUxvYWQiLCJsb2FkIiwianBfY29uZmlnIiwiJGRvY3VtZW50IiwibG9hZGVkIiwicHJvbWlzZSIsImRlZmVycmVkIiwiRGVmZXJyZWQiLCJzcmNzIiwiaXNBcnJheSIsInNwbGl0IiwiaW5kZXgiLCJzcmMiLCJpbmRleE9mIiwibG9hZENTUyIsImxvYWRTY3JpcHQiLCJzY3JpcHQiLCJjcmVhdGVFbGVtZW50Iiwib25sb2FkIiwiZSIsIm9uZXJyb3IiLCJib2R5IiwiYXBwZW5kQ2hpbGQiLCJocmVmIiwic3R5bGUiLCJyZWwiLCJ0eXBlIiwiaGVhZCIsImRvY3VtZW50IiwiJHRoaXMiLCJ0YXJnZXQiLCIkYWN0aXZlIiwiaXMiLCJjbG9zZXN0IiwicGFyZW50Iiwic2libGluZ3MiLCJ0b2dnbGVDbGFzcyIsImZpbmQiLCJzbGlkZVVwIiwiaGFzQ2xhc3MiLCJuZXh0Iiwic2xpZGVEb3duIiwiY2xhc3NlcyIsInRhcmdldHMiLCJBcnJheSIsImtleSIsInZhbHVlIiwibGVuZ3RoIiwiJHN0YXRlUGFyYW1zIiwiZ2V0U2luZ2xlckxldHRlciIsImxldHRlclRvQmVVcGRhdGVkIiwidXBkYXRlZExldHRlciIsImRpcmVjdGl2ZSIsInJlc3RyaWN0Iiwic2NvcGUiLCJsaW5rIiwiaXNMb2dnZWRJbiIsInNldFVzZXIiLCJyZW1vdmVVc2VyIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFDQUEsT0FB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QUFBWSxlQUFBLEdBQUFDLElBQUEsQ0FBQSxVQUFBQyxJQUFBLEVBQUE7QUFDQTZKLDBCQUFBN0osSUFBQSxHQUFBQSxJQUFBO0FBRUEsaUJBSEE7QUFJQSxhQUxBOztBQU9BLGdCQUFBaUssYUFBQSxTQUFBQSxVQUFBLEdBQUE7QUFDQUosc0JBQUE3SixJQUFBLEdBQUEsSUFBQTtBQUNBLGFBRkE7QUFHQTZKLGtCQUFBeEYsTUFBQSxHQUFBLFlBQUE7QUFDQW5GLDRCQUFBbUYsTUFBQSxHQUFBdEUsSUFBQSxDQUFBLFlBQUE7QUFDQVosMkJBQUE2QixFQUFBLENBQUEsT0FBQTtBQUNBLGlCQUZBO0FBR0EsYUFKQTtBQUtBZ0o7O0FBR0EvSyx1QkFBQU8sR0FBQSxDQUFBNEQsWUFBQU4sWUFBQSxFQUFBa0gsT0FBQTtBQUNBL0ssdUJBQUFPLEdBQUEsQ0FBQTRELFlBQUFKLGFBQUEsRUFBQWlILFVBQUE7QUFDQWhMLHVCQUFBTyxHQUFBLENBQUE0RCxZQUFBSCxjQUFBLEVBQUFnSCxVQUFBO0FBRUE7O0FBeENBLEtBQUE7QUE0Q0EsQ0E3Q0E7O0FDQUE5TCxJQUFBRyxNQUFBLENBQUEsVUFBQTZCLGNBQUEsRUFBQTtBQUNBQSxtQkFBQWQsS0FBQSxDQUFBLFFBQUEsRUFBQTtBQUNBZSxxQkFBQSxnREFEQTtBQUVBQyxvQkFBQSxZQUZBO0FBR0FDLGFBQUEsR0FIQTtBQUlBbUksZ0JBQUE7QUFKQSxLQUFBO0FBTUEsQ0FQQTs7QUFTQXRLLElBQUFrQyxVQUFBLENBQUEsWUFBQSxFQUFBLFVBQUFHLE1BQUEsRUFBQSxDQUVBLENBRkEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnZWxpdGUtbGMtcG9ydGFsJywgWydmc2FQcmVCdWlsdCcsICd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nQW5pbWF0ZSddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbigkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98bG9jYWx8ZGF0YXxjaHJvbWUtZXh0ZW5zaW9uKTovKTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG4gICAgLy8gVHJpZ2dlciBwYWdlIHJlZnJlc2ggd2hlbiBhY2Nlc3NpbmcgYW4gT0F1dGggcm91dGVcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIud2hlbignL2F1dGgvOnByb3ZpZGVyJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9KTtcbn0pO1xuXG4vLyBUaGlzIGFwcC5ydW4gaXMgZm9yIGNvbnRyb2xsaW5nIGFjY2VzcyB0byBzcGVjaWZpYyBzdGF0ZXMuXG5hcHAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgIC8vIFRoZSBnaXZlbiBzdGF0ZSByZXF1aXJlcyBhbiBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAgdmFyIGRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGggPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmF1dGhlbnRpY2F0ZTtcbiAgICB9O1xuXG4gICAgLy8gJHN0YXRlQ2hhbmdlU3RhcnQgaXMgYW4gZXZlbnQgZmlyZWRcbiAgICAvLyB3aGVuZXZlciB0aGUgcHJvY2VzcyBvZiBjaGFuZ2luZyBhIHN0YXRlIGJlZ2lucy5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMpIHtcblxuICAgICAgICBpZiAoIWRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGgodG9TdGF0ZSkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBkZXN0aW5hdGlvbiBzdGF0ZSBkb2VzIG5vdCByZXF1aXJlIGF1dGhlbnRpY2F0aW9uXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgICAgICAvLyBUaGUgdXNlciBpcyBhdXRoZW50aWNhdGVkLlxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbmNlbCBuYXZpZ2F0aW5nIHRvIG5ldyBzdGF0ZS5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgIC8vIElmIGEgdXNlciBpcyByZXRyaWV2ZWQsIHRoZW4gcmVuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb25cbiAgICAgICAgICAgIC8vICh0aGUgc2Vjb25kIHRpbWUsIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpIHdpbGwgd29yaylcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4sIGdvIHRvIFwibG9naW5cIiBzdGF0ZS5cbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLnRyYW5zaXRpb25Ubyh0b1N0YXRlLm5hbWUsIHRvUGFyYW1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLnRyYW5zaXRpb25UbygnaG9tZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Rhc2hib2FyZCcsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9kYXNoYm9hcmQvZGFzaGJvYXJkLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnZGFzaGJvYXJkQ3RybCcsXG4gICAgICAgIHVybDogJy9kYXNoYm9hcmQnLFxuICAgICAgICAvLyBkYXRhOiB7XG4gICAgICAgIC8vICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgLy8gfSxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgLy8gbGV0dGVyczogKGxjRmFjdG9yeSkgPT4ge1xuICAgICAgICAgICAgLy8gICAgIHJldHVybiBsY0ZhY3RvcnkuZ2V0TGV0dGVycyh7fSkudGhlbihsZXR0ZXJzID0+IHtcbiAgICAgICAgICAgIC8vICAgICAgICAgcmV0dXJuIGxldHRlcnNcbiAgICAgICAgICAgIC8vICAgICB9KVxuICAgICAgICAgICAgLy8gfVxuICAgICAgICB9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignZGFzaGJvYXJkQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlKSB7XG5cbiAgICAvL2luaXRzXG4gICAgLy8gJHNjb3BlLmxldHRlcnMgPSBsZXR0ZXJzXG4gICAgLy8kc2NvcGUuYW5hbHl0aWNzID0gYW5hbHl0aWNzXG5cbiAgICAvL2VuZCBpbml0c1xuXG5cblxuXG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbGFuZGluZycsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9sYW5kaW5nL2xhbmRpbmcuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdsYW5kaW5nQ3RybCcsXG4gICAgICAgIHVybDogJy8nXG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignbGFuZGluZ0N0cmwnLCBmdW5jdGlvbigkc2NvcGUpIHtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsaXN0TWFuYWdlcicsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9saXN0TWFuYWdlci9fbGlzdE1hbmFnZXIuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdsaXN0TWFuYWdlckN0cmwnLFxuICAgICAgICB1cmw6ICcvbGlzdE1hbmFnZXInLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBhdXRoZW50aWNhdDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBsZXR0ZXJzOiAobGNGYWN0b3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxjRmFjdG9yeS5nZXRMZXR0ZXJzKHt9KS50aGVuKGxldHRlcnMgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGV0dGVyc1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdsaXN0TWFuYWdlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsIGxjRmFjdG9yeSkge1xuICAgICRzY29wZS5jcmVhdGVMQyA9ICgpID0+IHtcbiAgICAgICAgLy9vcGVucyBhIG1vZGFsIGZvciBhIG5ldyBsY1xuICAgICAgICAvLy50aGVuIHRvIGNyZWF0IHRoZSBsYyBhbmQgdGhlbiBnbyB0byBpdFxuICAgIH1cblxuICAgICRzY29wZS52aWV3U2luZ2xlTGV0dGVyID0gKGxldHRlcklEKSA9PiB7XG4gICAgICAgICRzdGF0ZS5nbygnc2luZ2xlTGV0dGVyJywge1xuICAgICAgICAgICAgaWQ6IGxldHRlcklEXG4gICAgICAgIH0pXG4gICAgfVxufSk7IiwiYXBwLmZhY3RvcnkoJ2NvdW50cnlGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHAsICRxKSB7XG4gICAgdmFyIGQgPSB7fVxuICAgICAgICAvL0ZldGNoZXNcbiAgICBkLmdldENvdW50cmllcyA9IChxdWVyeSkgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2xjLycsIHtcbiAgICAgICAgICAgIHBhcmFtczogcXVlcnlcbiAgICAgICAgfSkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuICAgIGQuZ2V0U2luZ2xlQ291bnRyeSA9IChpZCkgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGAvYXBpL2xjLyR7aWR9YClcbiAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy9FbmQgRmV0Y2hlc1xuXG4gICAgLy9TZXRzXG4gICAgZC5jcmVhdGVDb3VudHJ5ID0gKENvdW50cnkpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvbGMvJylcbiAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy9FbmQgU2V0c1xuXG4gICAgLy9VcGRhdGVzXG4gICAgZC51cGRhdGVDb3VudHJ5ID0gKENvdW50cnkpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLnB1dChgL2FwaS9sYy8ke0NvdW50cnkuaWR9YClcbiAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy9FbmQgVXBkYXRlc1xuXG4gICAgLy9EZWxldGVzXG4gICAgZC5kZWxldGVDb3VudHJ5ID0gKHF1ZXJ5KSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5kZWxldGUoYC9hcGkvbGMvYCwge1xuICAgICAgICAgICAgcGFyYW1zOiBxdWVyeVxuICAgICAgICB9KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy9FbmQgRGVsZXRlc1xuICAgIHJldHVybiBkXG59KTsiLCJhcHAuZmFjdG9yeSgnbGNGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHAsICRxKSB7XG4gICAgdmFyIGQgPSB7fVxuICAgICAgICAvL0ZldGNoZXNcbiAgICBkLmdldExldHRlcnMgPSAocXVlcnkpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9sYy8nLCB7XG4gICAgICAgICAgICBwYXJhbXM6IHF1ZXJ5XG4gICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgIH1cbiAgICBkLmdldFNpbmdsZUxldHRlciA9IChpZCkgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGAvYXBpL2xjLyR7aWR9YClcbiAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy9FbmQgRmV0Y2hlc1xuXG4gICAgLy9TZXRzXG4gICAgZC5jcmVhdGVMZXR0ZXIgPSAobGV0dGVyKSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2xjLycpXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vRW5kIFNldHNcblxuICAgIC8vVXBkYXRlc1xuICAgIGQudXBkYXRlTGV0dGVyID0gKGxldHRlcikgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAucHV0KGAvYXBpL2xjLyR7bGV0dGVyLmlkfWApXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vRW5kIFVwZGF0ZXNcblxuICAgIC8vRGVsZXRlc1xuICAgIGQuZGVsZXRlTGV0dGVyID0gKHF1ZXJ5KSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5kZWxldGUoYC9hcGkvbGMvYCwge1xuICAgICAgICAgICAgcGFyYW1zOiBxdWVyeVxuICAgICAgICB9KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy9FbmQgRGVsZXRlc1xuICAgIHJldHVybiBkXG59KTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gSG9wZSB5b3UgZGlkbid0IGZvcmdldCBBbmd1bGFyISBEdWgtZG95LlxuICAgIGlmICghd2luZG93LmFuZ3VsYXIpIHRocm93IG5ldyBFcnJvcignSSBjYW5cXCd0IGZpbmQgQW5ndWxhciEnKTtcblxuICAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnZnNhUHJlQnVpbHQnLCBbXSk7XG5cbiAgICAvLyBBVVRIX0VWRU5UUyBpcyB1c2VkIHRocm91Z2hvdXQgb3VyIGFwcCB0b1xuICAgIC8vIGJyb2FkY2FzdCBhbmQgbGlzdGVuIGZyb20gYW5kIHRvIHRoZSAkcm9vdFNjb3BlXG4gICAgLy8gZm9yIGltcG9ydGFudCBldmVudHMgYWJvdXQgYXV0aGVudGljYXRpb24gZmxvdy5cbiAgICBhcHAuY29uc3RhbnQoJ0FVVEhfRVZFTlRTJywge1xuICAgICAgICBsb2dpblN1Y2Nlc3M6ICdhdXRoLWxvZ2luLXN1Y2Nlc3MnLFxuICAgICAgICBsb2dpbkZhaWxlZDogJ2F1dGgtbG9naW4tZmFpbGVkJyxcbiAgICAgICAgbG9nb3V0U3VjY2VzczogJ2F1dGgtbG9nb3V0LXN1Y2Nlc3MnLFxuICAgICAgICBzZXNzaW9uVGltZW91dDogJ2F1dGgtc2Vzc2lvbi10aW1lb3V0JyxcbiAgICAgICAgbm90QXV0aGVudGljYXRlZDogJ2F1dGgtbm90LWF1dGhlbnRpY2F0ZWQnLFxuICAgICAgICBub3RBdXRob3JpemVkOiAnYXV0aC1ub3QtYXV0aG9yaXplZCdcbiAgICB9KTtcblxuXG4gICAgYXBwLmZhY3RvcnkoJ0F1dGhJbnRlcmNlcHRvcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRxLCBBVVRIX0VWRU5UUykge1xuICAgICAgICB2YXIgc3RhdHVzRGljdCA9IHtcbiAgICAgICAgICAgIDQwMTogQVVUSF9FVkVOVFMubm90QXV0aGVudGljYXRlZCxcbiAgICAgICAgICAgIDQwMzogQVVUSF9FVkVOVFMubm90QXV0aG9yaXplZCxcbiAgICAgICAgICAgIDQxOTogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsXG4gICAgICAgICAgICA0NDA6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXNwb25zZUVycm9yOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChzdGF0dXNEaWN0W3Jlc3BvbnNlLnN0YXR1c10sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLmNvbmZpZyhmdW5jdGlvbigkaHR0cFByb3ZpZGVyKSB7XG4gICAgICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goW1xuICAgICAgICAgICAgJyRpbmplY3RvcicsXG4gICAgICAgICAgICBmdW5jdGlvbigkaW5qZWN0b3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJGluamVjdG9yLmdldCgnQXV0aEludGVyY2VwdG9yJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIF0pO1xuICAgIH0pO1xuXG4gICAgYXBwLnNlcnZpY2UoJ0F1dGhTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bExvZ2luKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICBTZXNzaW9uLmNyZWF0ZShkYXRhLmlkLCBkYXRhLnVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS51c2VyO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlcyB0aGUgc2Vzc2lvbiBmYWN0b3J5IHRvIHNlZSBpZiBhblxuICAgICAgICAvLyBhdXRoZW50aWNhdGVkIHVzZXIgaXMgY3VycmVudGx5IHJlZ2lzdGVyZWQuXG4gICAgICAgIHRoaXMuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gISFTZXNzaW9uLnVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRMb2dnZWRJblVzZXIgPSBmdW5jdGlvbihmcm9tU2VydmVyKSB7XG5cbiAgICAgICAgICAgIC8vIElmIGFuIGF1dGhlbnRpY2F0ZWQgc2Vzc2lvbiBleGlzdHMsIHdlXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIHVzZXIgYXR0YWNoZWQgdG8gdGhhdCBzZXNzaW9uXG4gICAgICAgICAgICAvLyB3aXRoIGEgcHJvbWlzZS4gVGhpcyBlbnN1cmVzIHRoYXQgd2UgY2FuXG4gICAgICAgICAgICAvLyBhbHdheXMgaW50ZXJmYWNlIHdpdGggdGhpcyBtZXRob2QgYXN5bmNocm9ub3VzbHkuXG5cbiAgICAgICAgICAgIC8vIE9wdGlvbmFsbHksIGlmIHRydWUgaXMgZ2l2ZW4gYXMgdGhlIGZyb21TZXJ2ZXIgcGFyYW1ldGVyLFxuICAgICAgICAgICAgLy8gdGhlbiB0aGlzIGNhY2hlZCB2YWx1ZSB3aWxsIG5vdCBiZSB1c2VkLlxuXG4gICAgICAgICAgICBpZiAodGhpcy5pc0F1dGhlbnRpY2F0ZWQoKSAmJiBmcm9tU2VydmVyICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLndoZW4oU2Vzc2lvbi51c2VyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTWFrZSByZXF1ZXN0IEdFVCAvc2Vzc2lvbi5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSB1c2VyLCBjYWxsIG9uU3VjY2Vzc2Z1bExvZ2luIHdpdGggdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIDQwMSByZXNwb25zZSwgd2UgY2F0Y2ggaXQgYW5kIGluc3RlYWQgcmVzb2x2ZSB0byBudWxsLlxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL3Nlc3Npb24nKS50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKS5jYXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dpbiA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2xvZ2luJywgY3JlZGVudGlhbHMpXG4gICAgICAgICAgICAgICAgLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNpZ251cCA9IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvc2lnbnVwJywgdXNlcikudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgU2Vzc2lvbi5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdTZXNzaW9uJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMpIHtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubm90QXV0aGVudGljYXRlZCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24oc2Vzc2lvbklkLCB1c2VyKSB7XG4gICAgICAgICAgICB0aGlzLmlkID0gc2Vzc2lvbklkO1xuICAgICAgICAgICAgdGhpcy51c2VyID0gdXNlcjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcbiAgICAgICAgfTtcblxuICAgIH0pO1xuXG59KSgpO1xuXG5cbndpbmRvdy5FdmVudEVtaXR0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN1YnNjcmliZXJzID0ge307XG59O1xuKGZ1bmN0aW9uKEVFKSB7XG5cbiAgICAvLyBUbyBiZSB1c2VkIGxpa2U6XG4gICAgLy8gaW5zdGFuY2VPZkVFLm9uKCd0b3VjaGRvd24nLCBjaGVlckZuKTtcbiAgICBFRS5wcm90b3R5cGUub24gPSBmdW5jdGlvbihldmVudE5hbWUsIGV2ZW50TGlzdGVuZXIpIHtcblxuICAgICAgICAvLyBJZiB0aGlzIGluc3RhbmNlJ3Mgc3Vic2NyaWJlcnMgb2JqZWN0IGRvZXMgbm90IHlldFxuICAgICAgICAvLyBoYXZlIHRoZSBrZXkgbWF0Y2hpbmcgdGhlIGdpdmVuIGV2ZW50IG5hbWUsIGNyZWF0ZSB0aGVcbiAgICAgICAgLy8ga2V5IGFuZCBhc3NpZ24gdGhlIHZhbHVlIG9mIGFuIGVtcHR5IGFycmF5LlxuICAgICAgICBpZiAoIXRoaXMuc3Vic2NyaWJlcnNbZXZlbnROYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5zdWJzY3JpYmVyc1tldmVudE5hbWVdID0gW107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQdXNoIHRoZSBnaXZlbiBsaXN0ZW5lciBmdW5jdGlvbiBpbnRvIHRoZSBhcnJheVxuICAgICAgICAvLyBsb2NhdGVkIG9uIHRoZSBpbnN0YW5jZSdzIHN1YnNjcmliZXJzIG9iamVjdC5cbiAgICAgICAgdGhpcy5zdWJzY3JpYmVyc1tldmVudE5hbWVdLnB1c2goZXZlbnRMaXN0ZW5lcik7XG5cbiAgICB9O1xuXG4gICAgLy8gVG8gYmUgdXNlZCBsaWtlOlxuICAgIC8vIGluc3RhbmNlT2ZFRS5lbWl0KCdjb2RlYycsICdIZXkgU25ha2UsIE90YWNvbiBpcyBjYWxsaW5nIScpO1xuICAgIEVFLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnROYW1lKSB7XG5cbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIHN1YnNjcmliZXJzIHRvIHRoaXMgZXZlbnQgbmFtZSwgd2h5IGV2ZW4/XG4gICAgICAgIGlmICghdGhpcy5zdWJzY3JpYmVyc1tldmVudE5hbWVdKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHcmFiIHRoZSByZW1haW5pbmcgYXJndW1lbnRzIHRvIG91ciBlbWl0IGZ1bmN0aW9uLlxuICAgICAgICB2YXIgcmVtYWluaW5nQXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgICAgICAvLyBGb3IgZWFjaCBzdWJzY3JpYmVyLCBjYWxsIGl0IHdpdGggb3VyIGFyZ3VtZW50cy5cbiAgICAgICAgdGhpcy5zdWJzY3JpYmVyc1tldmVudE5hbWVdLmZvckVhY2goZnVuY3Rpb24obGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGxpc3RlbmVyLmFwcGx5KG51bGwsIHJlbWFpbmluZ0FyZ3MpO1xuICAgICAgICB9KTtcblxuICAgIH07XG5cbn0pKHdpbmRvdy5FdmVudEVtaXR0ZXIpOyIsIisgZnVuY3Rpb24oJCkge1xyXG5cclxuICAgICQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIC8vIENoZWNrcyBmb3IgaWVcclxuICAgICAgICB2YXIgaXNJRSA9ICEhbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvTVNJRS9pKSB8fCAhIW5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1RyaWRlbnQuKnJ2OjExXFwuLyk7XHJcbiAgICAgICAgaXNJRSAmJiAkKCdodG1sJykuYWRkQ2xhc3MoJ2llJyk7XHJcblxyXG4gICAgICAgIC8vIENoZWNrcyBmb3IgaU9zLCBBbmRyb2lkLCBCbGFja2JlcnJ5LCBPcGVyYSBNaW5pLCBhbmQgV2luZG93cyBtb2JpbGUgZGV2aWNlc1xyXG4gICAgICAgIHZhciB1YSA9IHdpbmRvd1snbmF2aWdhdG9yJ11bJ3VzZXJBZ2VudCddIHx8IHdpbmRvd1snbmF2aWdhdG9yJ11bJ3ZlbmRvciddIHx8IHdpbmRvd1snb3BlcmEnXTtcclxuICAgICAgICAoL2lQaG9uZXxpUG9kfGlQYWR8U2lsa3xBbmRyb2lkfEJsYWNrQmVycnl8T3BlcmEgTWluaXxJRU1vYmlsZS8pLnRlc3QodWEpICYmICQoJ2h0bWwnKS5hZGRDbGFzcygnc21hcnQnKTtcclxuXHJcbiAgICB9KTtcclxufShqUXVlcnkpOyIsIisgZnVuY3Rpb24oJCkge1xyXG5cclxuICAgICQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICQoXCJbdWktanFdXCIpLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxmID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSBldmFsKCdbJyArIHNlbGYuYXR0cigndWktb3B0aW9ucycpICsgJ10nKTtcclxuXHJcbiAgICAgICAgICAgIGlmICgkLmlzUGxhaW5PYmplY3Qob3B0aW9uc1swXSkpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnNbMF0gPSAkLmV4dGVuZCh7fSwgb3B0aW9uc1swXSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHVpTG9hZC5sb2FkKGpwX2NvbmZpZ1tzZWxmLmF0dHIoJ3VpLWpxJyldKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZltzZWxmLmF0dHIoJ3VpLWpxJyldLmFwcGx5KHNlbGYsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9KTtcclxufShqUXVlcnkpOyIsIi8qKlxyXG4gKiAwLjEuMFxyXG4gKiBEZWZlcnJlZCBsb2FkIGpzL2NzcyBmaWxlLCB1c2VkIGZvciB1aS1qcS5qcyBhbmQgTGF6eSBMb2FkaW5nLlxyXG4gKiBcclxuICogQCBmbGF0ZnVsbC5jb20gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICogQXV0aG9yIHVybDogaHR0cDovL3RoZW1lZm9yZXN0Lm5ldC91c2VyL2ZsYXRmdWxsXHJcbiAqL1xyXG52YXIgdWlMb2FkID0gdWlMb2FkIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKCQsICRkb2N1bWVudCwgdWlMb2FkKSB7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgICB2YXIgbG9hZGVkID0gW10sXHJcbiAgICAgICAgcHJvbWlzZSA9IGZhbHNlLFxyXG4gICAgICAgIGRlZmVycmVkID0gJC5EZWZlcnJlZCgpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hhaW4gbG9hZHMgdGhlIGdpdmVuIHNvdXJjZXNcclxuICAgICAqIEBwYXJhbSBzcmNzIGFycmF5LCBzY3JpcHQgb3IgY3NzXHJcbiAgICAgKiBAcmV0dXJucyB7Kn0gUHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgb25jZSB0aGUgc291cmNlcyBoYXMgYmVlbiBsb2FkZWQuXHJcbiAgICAgKi9cclxuICAgIHVpTG9hZC5sb2FkID0gZnVuY3Rpb24oc3Jjcykge1xyXG4gICAgICAgIHNyY3MgPSAkLmlzQXJyYXkoc3JjcykgPyBzcmNzIDogc3Jjcy5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgIGlmICghcHJvbWlzZSkge1xyXG4gICAgICAgICAgICBwcm9taXNlID0gZGVmZXJyZWQucHJvbWlzZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJC5lYWNoKHNyY3MsIGZ1bmN0aW9uKGluZGV4LCBzcmMpIHtcclxuICAgICAgICAgICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzcmMuaW5kZXhPZignLmNzcycpID49IDAgPyBsb2FkQ1NTKHNyYykgOiBsb2FkU2NyaXB0KHNyYyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICByZXR1cm4gcHJvbWlzZTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEeW5hbWljYWxseSBsb2FkcyB0aGUgZ2l2ZW4gc2NyaXB0XHJcbiAgICAgKiBAcGFyYW0gc3JjIFRoZSB1cmwgb2YgdGhlIHNjcmlwdCB0byBsb2FkIGR5bmFtaWNhbGx5XHJcbiAgICAgKiBAcmV0dXJucyB7Kn0gUHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgb25jZSB0aGUgc2NyaXB0IGhhcyBiZWVuIGxvYWRlZC5cclxuICAgICAqL1xyXG4gICAgdmFyIGxvYWRTY3JpcHQgPSBmdW5jdGlvbihzcmMpIHtcclxuICAgICAgICBpZiAobG9hZGVkW3NyY10pIHJldHVybiBsb2FkZWRbc3JjXS5wcm9taXNlKCk7XHJcblxyXG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICQuRGVmZXJyZWQoKTtcclxuICAgICAgICB2YXIgc2NyaXB0ID0gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xyXG4gICAgICAgIHNjcmlwdC5zcmMgPSBzcmM7XHJcbiAgICAgICAgc2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShlKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHNjcmlwdC5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAkZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpO1xyXG4gICAgICAgIGxvYWRlZFtzcmNdID0gZGVmZXJyZWQ7XHJcblxyXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRHluYW1pY2FsbHkgbG9hZHMgdGhlIGdpdmVuIENTUyBmaWxlXHJcbiAgICAgKiBAcGFyYW0gaHJlZiBUaGUgdXJsIG9mIHRoZSBDU1MgdG8gbG9hZCBkeW5hbWljYWxseVxyXG4gICAgICogQHJldHVybnMgeyp9IFByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIG9uY2UgdGhlIENTUyBmaWxlIGhhcyBiZWVuIGxvYWRlZC5cclxuICAgICAqL1xyXG4gICAgdmFyIGxvYWRDU1MgPSBmdW5jdGlvbihocmVmKSB7XHJcbiAgICAgICAgaWYgKGxvYWRlZFtocmVmXSkgcmV0dXJuIGxvYWRlZFtocmVmXS5wcm9taXNlKCk7XHJcblxyXG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICQuRGVmZXJyZWQoKTtcclxuICAgICAgICB2YXIgc3R5bGUgPSAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xyXG4gICAgICAgIHN0eWxlLnJlbCA9ICdzdHlsZXNoZWV0JztcclxuICAgICAgICBzdHlsZS50eXBlID0gJ3RleHQvY3NzJztcclxuICAgICAgICBzdHlsZS5ocmVmID0gaHJlZjtcclxuICAgICAgICBzdHlsZS5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzdHlsZS5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAkZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XHJcbiAgICAgICAgbG9hZGVkW2hyZWZdID0gZGVmZXJyZWQ7XHJcblxyXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlKCk7XHJcbiAgICB9XHJcblxyXG59KShqUXVlcnksIGRvY3VtZW50LCB1aUxvYWQpOyIsIisgZnVuY3Rpb24oJCkge1xyXG5cclxuICAgICQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIC8vIG5hdlxyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdbdWktbmF2XSBhJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKGUudGFyZ2V0KSxcclxuICAgICAgICAgICAgICAgICRhY3RpdmU7XHJcbiAgICAgICAgICAgICR0aGlzLmlzKCdhJykgfHwgKCR0aGlzID0gJHRoaXMuY2xvc2VzdCgnYScpKTtcclxuXHJcbiAgICAgICAgICAgICRhY3RpdmUgPSAkdGhpcy5wYXJlbnQoKS5zaWJsaW5ncyhcIi5hY3RpdmVcIik7XHJcbiAgICAgICAgICAgICRhY3RpdmUgJiYgJGFjdGl2ZS50b2dnbGVDbGFzcygnYWN0aXZlJykuZmluZCgnPiB1bDp2aXNpYmxlJykuc2xpZGVVcCgyMDApO1xyXG5cclxuICAgICAgICAgICAgKCR0aGlzLnBhcmVudCgpLmhhc0NsYXNzKCdhY3RpdmUnKSAmJiAkdGhpcy5uZXh0KCkuc2xpZGVVcCgyMDApKSB8fCAkdGhpcy5uZXh0KCkuc2xpZGVEb3duKDIwMCk7XHJcbiAgICAgICAgICAgICR0aGlzLnBhcmVudCgpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcclxuXHJcbiAgICAgICAgICAgICR0aGlzLm5leHQoKS5pcygndWwnKSAmJiBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfSk7XHJcbn0oalF1ZXJ5KTsiLCIrIGZ1bmN0aW9uKCQpIHtcclxuXHJcbiAgICAkKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnW3VpLXRvZ2dsZS1jbGFzc10nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgdmFyICR0aGlzID0gJChlLnRhcmdldCk7XHJcbiAgICAgICAgICAgICR0aGlzLmF0dHIoJ3VpLXRvZ2dsZS1jbGFzcycpIHx8ICgkdGhpcyA9ICR0aGlzLmNsb3Nlc3QoJ1t1aS10b2dnbGUtY2xhc3NdJykpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGNsYXNzZXMgPSAkdGhpcy5hdHRyKCd1aS10b2dnbGUtY2xhc3MnKS5zcGxpdCgnLCcpLFxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0cyA9ICgkdGhpcy5hdHRyKCd0YXJnZXQnKSAmJiAkdGhpcy5hdHRyKCd0YXJnZXQnKS5zcGxpdCgnLCcpKSB8fCBBcnJheSgkdGhpcyksXHJcbiAgICAgICAgICAgICAgICBrZXkgPSAwO1xyXG4gICAgICAgICAgICAkLmVhY2goY2xhc3NlcywgZnVuY3Rpb24oaW5kZXgsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gdGFyZ2V0c1sodGFyZ2V0cy5sZW5ndGggJiYga2V5KV07XHJcbiAgICAgICAgICAgICAgICAkKHRhcmdldCkudG9nZ2xlQ2xhc3MoY2xhc3Nlc1tpbmRleF0pO1xyXG4gICAgICAgICAgICAgICAga2V5Kys7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkdGhpcy50b2dnbGVDbGFzcygnYWN0aXZlJyk7XHJcblxyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0oalF1ZXJ5KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3NpbmdsZUxldHRlcicsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9saXN0TWFuYWdlci9zaW5nbGVMZXR0ZXIvc2luZ2xlTGV0dGVyLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnc2luZ2xlTGV0dGVyQ3RybCcsXG4gICAgICAgIHVybDogJy9saXN0TWFuYWdlci86aWQnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBsZXR0ZXI6IChsY0ZhY3RvcnksICRzdGF0ZVBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBsY0ZhY3RvcnkuZ2V0U2luZ2xlckxldHRlcigkc3RhdGVQYXJhbXMuaWQpLnRoZW4obGV0dGVyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxldHRlclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdzaW5nbGVMZXR0ZXJDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBsZXR0ZXIsIGxjRmFjdG9yeSkge1xuICAgIC8vaW5pdHNcblxuICAgICRzY29wZS5sZXR0ZXIgPSBsZXR0ZXJcblxuICAgIC8vZW5kIGluaXRzXG4gICAgJHNjb3BlLnVwZGF0ZUxldHRlciA9IGxldHRlclRvQmVVcGRhdGVkID0+IHtcbiAgICAgICAgbGNGYWN0b3J5LnVwZGF0ZUxldHRlcihsZXR0ZXJUb0JlVXBkYXRlZCkudGhlbih1cGRhdGVkTGV0dGVyID0+IHtcbiAgICAgICAgICAgIC8vcGVyaGFwcyB0aGlzIHNob3VsZCBiZSBhIGNyZWF0ZSByYXRoZXIgdGhhbiBhbiB1cGRhdGVcbiAgICAgICAgICAgICRzY29wZS5sZXR0ZXIgPSB1cGRhdGVkTGV0dGVyXG4gICAgICAgIH0pXG4gICAgfVxufSk7IiwiYXBwLmRpcmVjdGl2ZSgnc2lkZWJhcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCBBVVRIX0VWRU5UUywgJHN0YXRlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL19jb21tb24vZGlyZWN0aXZlcy9hc2lkZS9hc2lkZS5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUpIHtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KTsiLCJhcHAuZGlyZWN0aXZlKCdmb290ZXInLCBmdW5jdGlvbigkc3RhdGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge30sXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvX2NvbW1vbi9kaXJlY3RpdmVzL2Zvb3Rlci9mb290ZXIuaHRtbCdcbiAgICB9O1xuXG59KTsiLCJhcHAuZGlyZWN0aXZlKCduYXZiYXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgQVVUSF9FVkVOVFMsICRzdGF0ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9fY29tbW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUpIHtcblxuICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG5cbiAgICAgICAgICAgIHNjb3BlLmlzTG9nZ2VkSW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5sb2dvdXQoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBzZXRVc2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSB1c2VyO1xuXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgcmVtb3ZlVXNlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzZXRVc2VyKCk7XG5cblxuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzLCBzZXRVc2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MsIHJlbW92ZVVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIHJlbW92ZVVzZXIpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncmV2aWV3Jywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xpc3RNYW5hZ2VyL3NpbmdsZUxldHRlci9yZXZpZXcvcmV2aWV3Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAncmV2aWV3Q3RybCcsXG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICBwYXJlbnQ6ICdzaW5nbGVMZXR0ZXInXG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcigncmV2aWV3Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSkge1xuXG59KTsiXX0=
