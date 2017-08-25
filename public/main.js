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
    $stateProvider.state('clauseManager', {
        templateUrl: 'js/clauseManager/clauseManager.html',
        controller: 'clauseManagerCtrl',
        url: '/clauseManager'
    });
});

app.controller('clauseManagerCtrl', function ($scope) {});

app.config(function ($stateProvider) {
    $stateProvider.state('dashboard', {
        templateUrl: 'js/dashboard/dashboard.html',
        controller: 'dashboardCtrl',
        url: '/dashboard',
        data: {
            authenticate: true
        },
        resolve: {
            // letters: (lcFactory) => {
            //     return lcFactory.getLetters({}).then(letters => {
            //         return letters
            //     })
            // }
        }
    });
});

app.controller('dashboardCtrl', function ($scope, $state, lcFactory) {

    //inits
    // $scope.letters = letters
    //$scope.analytics = analytics

    //end inits
    $scope.letter = {
        lc_number: 34534535,
        uploads: ['SGHSBC7G18301634-T01.pdf'],
        ammendments: {
            20: 'Bridge sentient city boy meta-camera footage DIY papier-mache sign concrete human shoes courier. Dead digital 3D-printed range-rover computer sensory sentient franchise bridge network market rebar tank-traps free-market human. BASE jump stimulate artisanal narrative corrupted assault range-rover film nano-paranoid shrine semiotics convenience store. Sprawl concrete corrupted modem spook human disposable towards narrative industrial grade girl realism weathered Tokyo savant.',
            22: 'Grenade lights computer saturation point cyber-long-chain hydrocarbons film tattoo skyscraper Tokyo digital into fluidity free-market towards pistol. Katana assault assassin footage cyber-kanji network industrial grade. Corrupted neural realism courier-ware sensory bicycle girl decay face forwards. Concrete towards cardboard DIY modem network monofilament tank-traps ablative urban spook disposable knife bicycle shanty town woman. '
        },
        date: Date.now(),
        country: 1,
        client: 1,
        bank: 'Bank of China',
        psr: 'Sharon',
        crc: 'Bob',
        state: 5,
        draft: false,
        finDoc: 0,
        finDate: null

    };
    $scope.test = function () {};

    //functions to edit and ammend lcs
    $scope.createLc = function (letterToBeCreated) {
        lcFactory.createLetter(letterToBeCreated).then(function (createdLetter) {
            $state.go('listManager');
        });
    };

    $scope.addLcAttachment = function (fileToBeAdded, lcId) {
        lcFactory.updateLetterFile(fileToBeAdded, lcId).then(function (letter) {
            $state.go();
        });
    };

    $scope.setLcToAmmended = function (letterToBeUpdated) {
        letterToBeUpdated.status = 3;
        lcFactory.updateLetter(letterToBeUpdated).then(function (response) {
            $state.go('amended');
        });
    };

    $scope.setLcToReviewed = function (letterToBeUpdated) {
        letterToBeUpdated.status = 2;
        lcFactory.updateLetter(letterToBeUpdated).then(function (response) {
            $state.go('review');
        });
    };

    $scope.setLcToFrozen = function (letterToBeUpdated) {
        letterToBeUpdated.status = 4;
        lcFactory.updateLetter(letterToBeUpdated).then(function (response) {
            $state.go('frozen');
        });
    };

    $scope.setLcToArchived = function (letterToBeUpdated) {
        letterToBeUpdated.finDoc = $scope.finDoc;
        letterToBeUpdated.status = 5;
        lcFactory.updateLetter(letterToBeUpdated).then(function (response) {
            $state.go('archived');
        });
    };

    /*ammendments = [{
        swiftCode:int,
        reference: text,
        status: 0,1,2,
        dateModified:date  
    }]
    */
});

app.config(function ($stateProvider) {
    $stateProvider.state('landing', {
        templateUrl: 'js/landing/landing.html',
        controller: 'landingCtrl',
        url: '/'
    });
});

app.controller('landingCtrl', function ($scope, AuthService, userFactory, $state) {

    $scope.login = {};
    $scope.error = null;
    $scope.createUser = function () {
        console.log('hello');
        var login = {
            username: 'test',
            password: 'test'
        };
        userFactory.createUser({
            user: login
        }).then(function (user) {
            AuthService.login(login);
        });
    };
    $scope.sendLogin = function (loginInfo) {

        $scope.error = null;
        AuthService.login(loginInfo).then(function () {
            $state.transitionTo('dashboard');
        });
    };
});
app.config(function ($stateProvider) {
    $stateProvider.state('listManager', {
        templateUrl: 'js/listManager/listManager.html',
        controller: 'listManagerCtrl',
        abstract: true,
        data: {
            authenticate: true
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

app.controller('listManagerCtrl', function ($scope, lcFactory, $state, letters) {
    $scope.letters = letters;
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Pending Update'
    };
});
app.config(function ($stateProvider) {
    $stateProvider.state('singleLc', {
        templateUrl: 'js/singleLc/singleLc.html',
        controller: 'singleLcCtrl',
        url: '/lc/:lcNumber',
        data: {
            authenticate: true
        },
        resolve: {
            letter: function letter(lcFactory, $stateParams) {
                return lcFactory.getSingleLetter($stateParams.lcNumber).then(function (letter) {
                    return letter;
                });
            }
        }
    });
});

app.controller('singleLcCtrl', function ($scope, lcFactory, letter) {
    $scope.letter = letter;
    $scope.approved = {
        content: {},
        length: 0
    };
    $scope.amended = {
        content: {},
        length: 0
    };
    $scope.rejected = {
        content: {},
        length: 0
    };
    $scope.reference = {};
    $scope.letter.amendments = {
        20: {
            reference: 'Bridge sentient city boy meta-camera footage DIY papier-mache sign concrete human shoes courier. Dead digital 3D-printed range-rover computer sensory sentient franchise bridge network market rebar tank-traps free-market human. BASE jump stimulate artisanal narrative corrupted assault range-rover film nano-paranoid shrine semiotics convenience store. Sprawl concrete corrupted modem spook human disposable towards narrative industrial grade girl realism weathered Tokyo savant.',
            status: '00',
            lastModified: Date.now()
        },
        22: {
            reference: 'Grenade lights computer saturation point cyber-long-chain hydrocarbons film tattoo skyscraper Tokyo digital into fluidity free-market towards pistol. Katana assault assassin footage cyber-kanji network industrial grade. Corrupted neural realism courier-ware sensory bicycle girl decay face forwards. Concrete towards cardboard DIY modem network monofilament tank-traps ablative urban spook disposable knife bicycle shanty town woman. ',
            status: '00',
            lastModified: Date.now()
        }
    };
    $scope.amendments = jQuery.extend(true, {}, $scope.letter.amendments);
    $scope.client = $scope.user === 3;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = Object.keys($scope.amendments)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;

            if ($scope.client) {
                $scope.amendments[key].status = $scope.amendments[key].status[0];
            } else $scope.amendments[key].status = $scope.amendments[key].status[1];
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    $scope.states = {
        1: 'newLcs',
        2: 'reviewed',
        3: 'amended',
        4: 'frozen',
        5: 'archived'
    };
    $scope.approveAmendment = function (key) {
        $scope.approved.content[key] = $scope.amendments[key].reference;
        $scope.amendments[key].status = '1';
        $scope.approved.length++;
    };
    $scope.rejectAmendment = function (key) {
        $scope.rejected.content[key] = $scope.amendments[key].reference;
        $scope.amendments[key].status = '3';
        $scope.rejected.length++;
    };
    $scope.editAmendment = function (key) {
        $scope.amendments[key].reference = $scope.reference[key];
        $scope.amendments[key].status = '2';
        $scope.amendments[key].expanded = false;
        $scope.amended[$scope.amendments[key]] = $scope.reference[key];
        $scope.ammended = Object.keys($scope.amended).length;
        $scope.reference[key] = "";
    };
    $scope.updateLetter = function () {
        var total = $scope.approved.length + $scope.rejected.length + $scope.amended.length;
        if (total !== Object.keys($scope.amendments).length) return;

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = Object.keys($scope.approved.content)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var key = _step2.value;

                if ($scope.client) $scope.amendments[key].status = '1' + $scope.letter.amendments[key].status[1];else $scope.amendments[key].status = $scope.letter.amendments[key].status[0] + '1';
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = Object.keys($scope.amended.content)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var _key = _step3.value;

                if ($scope.client) $scope.amendments[_key].status = '10';else $scope.amendments[_key].status = '01';
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }

        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
            for (var _iterator4 = Object.keys($scope.rejected.content)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var _key2 = _step4.value;

                if ($scope.client) $scope.amendments[_key2].status = '3' + $scope.letter.amendments[_key2].status[1];else $scope.amendments[_key2].status = $scope.letter.amendments[_key2].status[0] + '3';
            }
        } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                    _iterator4.return();
                }
            } finally {
                if (_didIteratorError4) {
                    throw _iteratorError4;
                }
            }
        }

        $scope.letter.amendments = $scope.amendments;
        if ($scope.approved.length === total) {
            if ($scope.client) {
                if ($scope.letter.approved === '01') {
                    $scope.letter.state++;
                    $scope.letter.approved = '00';
                } else {
                    $scope.letter.approved = '10';
                }
            } else {
                if ($scope.letter.approved === '10') {
                    $scope.letter.state++;
                    $scope.letter.approved === '00';
                } else {
                    $scope.letter.approved = '01';
                }
            }
        }

        lcFactory.updateLetter($scope.letter).then(function (letter) {
            $state.go($scope.states[letter.state]);
        });
    };
    $scope.submitDraft = function () {
        // $scope.client ? $scope.drafts

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

    d.getLetterCount = function () {
        return $http.get('/api/lc/count').then(function (response) {
            return response.data;
        }).catch(function (err) {
            return $q.reject({
                message: err
            });
        });
        //End Fetches
    };

    //Sets
    d.createLetter = function (letter) {
        // var file = letter;
        // var fd = new FormData();
        // fd.append('letter', file);
        // fd.append('classroom', angular.toJson(letter))
        return $http.post('/api/lc/', letter).then(function (response) {
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
        var body = {
            updates: letter
        };
        return $http.put('/api/lc/', body).then(function (response) {
            return response.data;
        }).catch(function (err) {
            return $q.reject({
                message: err
            });
        });
    };
    d.updateLetterFile = function (letterAddition, letterToBeUpdatedId) {
        var file = letterAddition;
        var fd = new FormData();
        fd.append('letterAddition', file);
        return $http.put('/api/lc/addition', fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).then(function (response) {
            return response.data;
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
app.factory('userFactory', function ($http) {
    var userFactory = {};
    //user fetches
    userFactory.createUser = function (user) {
        return $http.post("/api/users/signup", user).then(function (response) {
            if (response.data) {
                var credentials = {
                    email: user.email,
                    password: user.password
                };
                return credentials;
            } else {
                return response.data;
            }
        });
    };
    userFactory.updateUser = function (user) {
        return $http.put("/api/users/update", user).then(function (response) {
            return response.data;
        });
    };

    userFactory.getUsers = function (user) {
        return $http.get("/api/users/").then(function (response) {
            return response.data;
        });
    };
    userFactory.getUserById = function (id) {
        return $http.get("/api/users/" + id).then(function (response) {
            return response.data;
        });
    };
    return userFactory;
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
    $stateProvider.state('listManager.all', {
        templateUrl: 'js/listManager/all/all.html',
        controller: 'allCtrl',
        url: '/listManager',
        // data: {
        //     authenticate: true
        // },
        resolve: {
            letters: function letters(lcFactory) {
                return lcFactory.getLetters({}).then(function (letters) {
                    return letters;
                });
            }
        }
    });
});

app.controller('allCtrl', function ($scope, lcFactory, letters, $state) {
    $scope.letters = letters;
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Pending Update'
    };
    $scope.transition = function (lcNumber) {
        $state.go('singleLc', {
            lcNumber: lcNumber
        });
    };
});
app.config(function ($stateProvider) {
    $stateProvider.state('listManager.amended', {
        templateUrl: 'js/listManager/amended/amended.html',
        controller: 'amendedCtrl',
        url: '/listManager/amended',
        // data: {
        //     authenticate: true
        // },
        resolve: {}
    });
});

app.controller('amendedCtrl', function ($scope, lcFactory, letters, $state) {
    $scope.displayLetters = $scope.letters.filter(function (letter) {
        return letter.state === 3;
    });
    $state.transition = function (lc_number) {
        $state.go('singleLc', {
            lc_number: lc_number
        });
    };
});
app.config(function ($stateProvider) {
    $stateProvider.state('listManager.frozen', {
        templateUrl: 'js/listManager/frozen/frozen.html',
        controller: 'frozenCtrl',
        url: '/listManager/frozen',
        parent: 'listManager',
        // data: {
        //     authenticate: true
        // },
        resolve: {
            letters: function letters(lcFactory) {
                return lcFactory.getLetters({
                    state: 4
                }).then(function (letters) {
                    return letters;
                });
            }
        }
    });
});

app.controller('frozenCtrl', function ($scope, lcFactory, letters, $state) {
    $scope.displayLetters = $scope.letters.filter(function (letter) {
        return letter.state === 4;
    });
    $scope.transition = function (lcNumber) {
        $state.go('singleLc', {
            lcNumber: lcNumber
        });
    };
});
app.config(function ($stateProvider) {
    $stateProvider.state('listManager.newLcs', {
        templateUrl: 'js/listManager/newLcs/newLcs.html',
        controller: 'newLcsCtrl',
        url: '/listManager/newLcs',
        parent: 'listManager',
        // data: {
        //     authenticate: true
        // },
        resolve: {}
    });
});

app.controller('newLcsCtrl', function ($scope, lcFactory, letters, $state) {
    $scope.letters = $scope.letters.filter(function (letter) {
        return letter.state === 1;
    });
    console.log($scope.letters);
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Pending Update'
    };
    $scope.transition = function (lcNumber) {
        $state.go('singleLc', {
            lcNumber: lcNumber
        });
    };
});
app.config(function ($stateProvider) {
    $stateProvider.state('listManager.reviewed', {
        templateUrl: 'js/listManager/reviewed/reviewed.html',
        controller: 'reviewedCtrl',
        url: '/listManager/reviewed',
        parent: 'listManager',
        // data: {
        //     authenticate: true
        // },
        resolve: {}
    });
});

app.controller('reviewedCtrl', function ($scope, lcFactory, letters, $state) {
    $scope.displayLetters = $scope.letters.filter(function (letter) {
        return letter.state === 2;
    });
    $scope.transition = function (lcNumber) {
        $state.go('singleLc', {
            lcNumber: lcNumber
        });
    };
});
app.config(function ($stateProvider) {
    $stateProvider.state('listManager.updated', {
        templateUrl: 'js/listManager/updated/updated.html',
        controller: 'updatedCtrl',
        url: '/listManager/updated',
        // data: {
        //     authenticate: true
        // },
        resolve: {}
    });
});

app.controller('updatedCtrl', function ($scope, lcFactory, letters, $state) {
    $scope.displayLetters = $scope.letters.filter(function (letter) {
        return letter.state === 5;
    });
    $scope.transition = function (lcNumber) {
        $state.go('singleLc', {
            lcNumber: lcNumber
        });
    };
});
app.directive('sidebar', function ($rootScope, AuthService, AUTH_EVENTS, $state) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/_common/directives/aside/aside.html',
        link: function link(scope, lcFactory) {
            // lcFactory.getLetterCount().then(letterCount => {
            //     scope.letterCount = letterCount
            // })
        }

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
                    $state.go('landing');
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

            setUser();

            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);
        }

    };
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNsYXVzZU1hbmFnZXIvY2xhdXNlTWFuYWdlci5qcyIsImRhc2hib2FyZC9kYXNoYm9hcmQuanMiLCJsYW5kaW5nL2xhbmRpbmcuanMiLCJsaXN0TWFuYWdlci9saXN0TWFuYWdlci5qcyIsInNpbmdsZUxjL3NpbmdsZUxjLmpzIiwiX2NvbW1vbi9mYWN0b3JpZXMvY291bnRyeUZhY3RvcnkuanMiLCJfY29tbW9uL2ZhY3Rvcmllcy9sY0ZhY3RvcnkuanMiLCJfY29tbW9uL2ZhY3Rvcmllcy91c2VyRmFjdG9yeS5qcyIsIl9jb21tb24vcHJlYnVpbHQvZnNhLXByZS1idWlsdC5qcyIsIl9jb21tb24vcHJlYnVpbHQvdWktY2xpZW50LmpzIiwiX2NvbW1vbi9wcmVidWlsdC91aS1qcC5qcyIsIl9jb21tb24vcHJlYnVpbHQvdWktbG9hZC5qcyIsIl9jb21tb24vcHJlYnVpbHQvdWktbmF2LmpzIiwiX2NvbW1vbi9wcmVidWlsdC91aS10b2dnbGUuanMiLCJsaXN0TWFuYWdlci9hbGwvYWxsLmpzIiwibGlzdE1hbmFnZXIvYW1lbmRlZC9hbWVuZGVkLmpzIiwibGlzdE1hbmFnZXIvZnJvemVuL2Zyb3plbi5qcyIsImxpc3RNYW5hZ2VyL25ld0xjcy9uZXdMY3MuanMiLCJsaXN0TWFuYWdlci9yZXZpZXdlZC9yZXZpZXdlZC5qcyIsImxpc3RNYW5hZ2VyL3VwZGF0ZWQvdXBkYXRlZC5qcyIsIl9jb21tb24vZGlyZWN0aXZlcy9hc2lkZS9hc2lkZS5qcyIsIl9jb21tb24vZGlyZWN0aXZlcy9mb290ZXIvZm9vdGVyLmpzIiwiX2NvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuanMiXSwibmFtZXMiOlsid2luZG93IiwiYXBwIiwiYW5ndWxhciIsIm1vZHVsZSIsImNvbmZpZyIsIiR1cmxSb3V0ZXJQcm92aWRlciIsIiRsb2NhdGlvblByb3ZpZGVyIiwiJGNvbXBpbGVQcm92aWRlciIsImh0bWw1TW9kZSIsImFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0Iiwib3RoZXJ3aXNlIiwid2hlbiIsImxvY2F0aW9uIiwicmVsb2FkIiwicnVuIiwiJHJvb3RTY29wZSIsIkF1dGhTZXJ2aWNlIiwiJHN0YXRlIiwiZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCIsInN0YXRlIiwiZGF0YSIsImF1dGhlbnRpY2F0ZSIsIiRvbiIsImV2ZW50IiwidG9TdGF0ZSIsInRvUGFyYW1zIiwiaXNBdXRoZW50aWNhdGVkIiwicHJldmVudERlZmF1bHQiLCJnZXRMb2dnZWRJblVzZXIiLCJ0aGVuIiwidXNlciIsInRyYW5zaXRpb25UbyIsIm5hbWUiLCIkc3RhdGVQcm92aWRlciIsInRlbXBsYXRlVXJsIiwiY29udHJvbGxlciIsInVybCIsIiRzY29wZSIsInJlc29sdmUiLCJsY0ZhY3RvcnkiLCJsZXR0ZXIiLCJsY19udW1iZXIiLCJ1cGxvYWRzIiwiYW1tZW5kbWVudHMiLCJkYXRlIiwiRGF0ZSIsIm5vdyIsImNvdW50cnkiLCJjbGllbnQiLCJiYW5rIiwicHNyIiwiY3JjIiwiZHJhZnQiLCJmaW5Eb2MiLCJmaW5EYXRlIiwidGVzdCIsImNyZWF0ZUxjIiwibGV0dGVyVG9CZUNyZWF0ZWQiLCJjcmVhdGVMZXR0ZXIiLCJnbyIsImFkZExjQXR0YWNobWVudCIsImZpbGVUb0JlQWRkZWQiLCJsY0lkIiwidXBkYXRlTGV0dGVyRmlsZSIsInNldExjVG9BbW1lbmRlZCIsImxldHRlclRvQmVVcGRhdGVkIiwic3RhdHVzIiwidXBkYXRlTGV0dGVyIiwic2V0TGNUb1Jldmlld2VkIiwic2V0TGNUb0Zyb3plbiIsInNldExjVG9BcmNoaXZlZCIsInVzZXJGYWN0b3J5IiwibG9naW4iLCJlcnJvciIsImNyZWF0ZVVzZXIiLCJjb25zb2xlIiwibG9nIiwidXNlcm5hbWUiLCJwYXNzd29yZCIsInNlbmRMb2dpbiIsImxvZ2luSW5mbyIsImFic3RyYWN0IiwibGV0dGVycyIsImdldExldHRlcnMiLCIkc3RhdGVQYXJhbXMiLCJnZXRTaW5nbGVMZXR0ZXIiLCJsY051bWJlciIsImFwcHJvdmVkIiwiY29udGVudCIsImxlbmd0aCIsImFtZW5kZWQiLCJyZWplY3RlZCIsInJlZmVyZW5jZSIsImFtZW5kbWVudHMiLCJsYXN0TW9kaWZpZWQiLCJqUXVlcnkiLCJleHRlbmQiLCJPYmplY3QiLCJrZXlzIiwia2V5Iiwic3RhdGVzIiwiYXBwcm92ZUFtZW5kbWVudCIsInJlamVjdEFtZW5kbWVudCIsImVkaXRBbWVuZG1lbnQiLCJleHBhbmRlZCIsImFtbWVuZGVkIiwidG90YWwiLCJzdWJtaXREcmFmdCIsImZhY3RvcnkiLCIkaHR0cCIsIiRxIiwiZCIsImdldENvdW50cmllcyIsInF1ZXJ5IiwiZ2V0IiwicGFyYW1zIiwicmVzcG9uc2UiLCJjYXRjaCIsInJlamVjdCIsIm1lc3NhZ2UiLCJlcnIiLCJnZXRTaW5nbGVDb3VudHJ5IiwiaWQiLCJjcmVhdGVDb3VudHJ5IiwiQ291bnRyeSIsInBvc3QiLCJ1cGRhdGVDb3VudHJ5IiwicHV0IiwiZGVsZXRlQ291bnRyeSIsImRlbGV0ZSIsImdldExldHRlckNvdW50IiwiYm9keSIsInVwZGF0ZXMiLCJsZXR0ZXJBZGRpdGlvbiIsImxldHRlclRvQmVVcGRhdGVkSWQiLCJmaWxlIiwiZmQiLCJGb3JtRGF0YSIsImFwcGVuZCIsInRyYW5zZm9ybVJlcXVlc3QiLCJpZGVudGl0eSIsImhlYWRlcnMiLCJ1bmRlZmluZWQiLCJkZWxldGVMZXR0ZXIiLCJjcmVkZW50aWFscyIsImVtYWlsIiwidXBkYXRlVXNlciIsImdldFVzZXJzIiwiZ2V0VXNlckJ5SWQiLCJFcnJvciIsImNvbnN0YW50IiwibG9naW5TdWNjZXNzIiwibG9naW5GYWlsZWQiLCJsb2dvdXRTdWNjZXNzIiwic2Vzc2lvblRpbWVvdXQiLCJub3RBdXRoZW50aWNhdGVkIiwibm90QXV0aG9yaXplZCIsIkFVVEhfRVZFTlRTIiwic3RhdHVzRGljdCIsInJlc3BvbnNlRXJyb3IiLCIkYnJvYWRjYXN0IiwiJGh0dHBQcm92aWRlciIsImludGVyY2VwdG9ycyIsInB1c2giLCIkaW5qZWN0b3IiLCJzZXJ2aWNlIiwiU2Vzc2lvbiIsIm9uU3VjY2Vzc2Z1bExvZ2luIiwiY3JlYXRlIiwiZnJvbVNlcnZlciIsInNpZ251cCIsImxvZ291dCIsImRlc3Ryb3kiLCJzZWxmIiwic2Vzc2lvbklkIiwiRXZlbnRFbWl0dGVyIiwic3Vic2NyaWJlcnMiLCJFRSIsInByb3RvdHlwZSIsIm9uIiwiZXZlbnROYW1lIiwiZXZlbnRMaXN0ZW5lciIsImVtaXQiLCJyZW1haW5pbmdBcmdzIiwic2xpY2UiLCJjYWxsIiwiYXJndW1lbnRzIiwiZm9yRWFjaCIsImxpc3RlbmVyIiwiYXBwbHkiLCIkIiwiaXNJRSIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsIm1hdGNoIiwiYWRkQ2xhc3MiLCJ1YSIsImVhY2giLCJvcHRpb25zIiwiZXZhbCIsImF0dHIiLCJpc1BsYWluT2JqZWN0IiwidWlMb2FkIiwibG9hZCIsImpwX2NvbmZpZyIsIiRkb2N1bWVudCIsImxvYWRlZCIsInByb21pc2UiLCJkZWZlcnJlZCIsIkRlZmVycmVkIiwic3JjcyIsImlzQXJyYXkiLCJzcGxpdCIsImluZGV4Iiwic3JjIiwiaW5kZXhPZiIsImxvYWRDU1MiLCJsb2FkU2NyaXB0Iiwic2NyaXB0IiwiY3JlYXRlRWxlbWVudCIsIm9ubG9hZCIsImUiLCJvbmVycm9yIiwiYXBwZW5kQ2hpbGQiLCJocmVmIiwic3R5bGUiLCJyZWwiLCJ0eXBlIiwiaGVhZCIsImRvY3VtZW50IiwiJHRoaXMiLCJ0YXJnZXQiLCIkYWN0aXZlIiwiaXMiLCJjbG9zZXN0IiwicGFyZW50Iiwic2libGluZ3MiLCJ0b2dnbGVDbGFzcyIsImZpbmQiLCJzbGlkZVVwIiwiaGFzQ2xhc3MiLCJuZXh0Iiwic2xpZGVEb3duIiwiY2xhc3NlcyIsInRhcmdldHMiLCJBcnJheSIsInZhbHVlIiwidHJhbnNpdGlvbiIsImRpc3BsYXlMZXR0ZXJzIiwiZmlsdGVyIiwiZGlyZWN0aXZlIiwicmVzdHJpY3QiLCJzY29wZSIsImxpbmsiLCJpc0xvZ2dlZEluIiwic2V0VXNlciIs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O0FBSUEyTixjQUFBLGNBQUFELEtBQUEsRUFBQTs7QUFFQUEsa0JBQUE5TixJQUFBLEdBQUEsSUFBQTs7QUFFQThOLGtCQUFBRSxVQUFBLEdBQUEsWUFBQTtBQUNBLHVCQUFBOU8sWUFBQVUsZUFBQSxFQUFBO0FBQ0EsYUFGQTs7QUFJQWtPLGtCQUFBakYsTUFBQSxHQUFBLFlBQUE7QUFDQTNKLDRCQUFBMkosTUFBQSxHQUFBOUksSUFBQSxDQUFBLFlBQUE7QUFDQVosMkJBQUEwQyxFQUFBLENBQUEsU0FBQTtBQUNBLGlCQUZBO0FBR0EsYUFKQTs7QUFNQSxnQkFBQW9NLFVBQUEsU0FBQUEsT0FBQSxHQUFBO0FBQ0EvTyw0QkFBQVksZUFBQSxHQUFBQyxJQUFBLENBQUEsVUFBQUMsSUFBQSxFQUFBO0FBQ0E4TiwwQkFBQTlOLElBQUEsR0FBQUEsSUFBQTtBQUVBLGlCQUhBO0FBSUEsYUFMQTs7QUFPQSxnQkFBQWtPLGFBQUEsU0FBQUEsVUFBQSxHQUFBO0FBQ0FKLHNCQUFBOU4sSUFBQSxHQUFBLElBQUE7QUFDQSxhQUZBOztBQUlBaU87O0FBR0FoUCx1QkFBQU8sR0FBQSxDQUFBdUksWUFBQU4sWUFBQSxFQUFBd0csT0FBQTtBQUNBaFAsdUJBQUFPLEdBQUEsQ0FBQXVJLFlBQUFKLGFBQUEsRUFBQXVHLFVBQUE7QUFDQWpQLHVCQUFBTyxHQUFBLENBQUF1SSxZQUFBSCxjQUFBLEVBQUFzRyxVQUFBO0FBRUE7O0FBcENBLEtBQUE7QUF3Q0EsQ0F6Q0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnZWxpdGUtbGMtcG9ydGFsJywgWydmc2FQcmVCdWlsdCcsICd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nQW5pbWF0ZSddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbigkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98bG9jYWx8ZGF0YXxjaHJvbWUtZXh0ZW5zaW9uKTovKTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG4gICAgLy8gVHJpZ2dlciBwYWdlIHJlZnJlc2ggd2hlbiBhY2Nlc3NpbmcgYW4gT0F1dGggcm91dGVcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIud2hlbignL2F1dGgvOnByb3ZpZGVyJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9KTtcbn0pO1xuXG4vLyBUaGlzIGFwcC5ydW4gaXMgZm9yIGNvbnRyb2xsaW5nIGFjY2VzcyB0byBzcGVjaWZpYyBzdGF0ZXMuXG5hcHAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgIC8vIFRoZSBnaXZlbiBzdGF0ZSByZXF1aXJlcyBhbiBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAgdmFyIGRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGggPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmF1dGhlbnRpY2F0ZTtcbiAgICB9O1xuXG4gICAgLy8gJHN0YXRlQ2hhbmdlU3RhcnQgaXMgYW4gZXZlbnQgZmlyZWRcbiAgICAvLyB3aGVuZXZlciB0aGUgcHJvY2VzcyBvZiBjaGFuZ2luZyBhIHN0YXRlIGJlZ2lucy5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMpIHtcblxuICAgICAgICBpZiAoIWRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGgodG9TdGF0ZSkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBkZXN0aW5hdGlvbiBzdGF0ZSBkb2VzIG5vdCByZXF1aXJlIGF1dGhlbnRpY2F0aW9uXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgICAgICAvLyBUaGUgdXNlciBpcyBhdXRoZW50aWNhdGVkLlxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbmNlbCBuYXZpZ2F0aW5nIHRvIG5ldyBzdGF0ZS5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgIC8vIElmIGEgdXNlciBpcyByZXRyaWV2ZWQsIHRoZW4gcmVuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb25cbiAgICAgICAgICAgIC8vICh0aGUgc2Vjb25kIHRpbWUsIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpIHdpbGwgd29yaylcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4sIGdvIHRvIFwibG9naW5cIiBzdGF0ZS5cbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLnRyYW5zaXRpb25Ubyh0b1N0YXRlLm5hbWUsIHRvUGFyYW1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLnRyYW5zaXRpb25UbygnaG9tZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2NsYXVzZU1hbmFnZXInLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY2xhdXNlTWFuYWdlci9jbGF1c2VNYW5hZ2VyLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnY2xhdXNlTWFuYWdlckN0cmwnLFxuICAgICAgICB1cmw6ICcvY2xhdXNlTWFuYWdlcidcbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdjbGF1c2VNYW5hZ2VyQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSkge1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Rhc2hib2FyZCcsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9kYXNoYm9hcmQvZGFzaGJvYXJkLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnZGFzaGJvYXJkQ3RybCcsXG4gICAgICAgIHVybDogJy9kYXNoYm9hcmQnLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgLy8gbGV0dGVyczogKGxjRmFjdG9yeSkgPT4ge1xuICAgICAgICAgICAgLy8gICAgIHJldHVybiBsY0ZhY3RvcnkuZ2V0TGV0dGVycyh7fSkudGhlbihsZXR0ZXJzID0+IHtcbiAgICAgICAgICAgIC8vICAgICAgICAgcmV0dXJuIGxldHRlcnNcbiAgICAgICAgICAgIC8vICAgICB9KVxuICAgICAgICAgICAgLy8gfVxuICAgICAgICB9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignZGFzaGJvYXJkQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCBsY0ZhY3RvcnkpIHtcblxuICAgIC8vaW5pdHNcbiAgICAvLyAkc2NvcGUubGV0dGVycyA9IGxldHRlcnNcbiAgICAvLyRzY29wZS5hbmFseXRpY3MgPSBhbmFseXRpY3NcblxuICAgIC8vZW5kIGluaXRzXG4gICAgJHNjb3BlLmxldHRlciA9IHtcbiAgICAgICAgbGNfbnVtYmVyOiAzNDUzNDUzNSxcbiAgICAgICAgdXBsb2FkczogWydTR0hTQkM3RzE4MzAxNjM0LVQwMS5wZGYnXSxcbiAgICAgICAgYW1tZW5kbWVudHM6IHtcbiAgICAgICAgICAgIDIwOiAnQnJpZGdlIHNlbnRpZW50IGNpdHkgYm95IG1ldGEtY2FtZXJhIGZvb3RhZ2UgRElZIHBhcGllci1tYWNoZSBzaWduIGNvbmNyZXRlIGh1bWFuIHNob2VzIGNvdXJpZXIuIERlYWQgZGlnaXRhbCAzRC1wcmludGVkIHJhbmdlLXJvdmVyIGNvbXB1dGVyIHNlbnNvcnkgc2VudGllbnQgZnJhbmNoaXNlIGJyaWRnZSBuZXR3b3JrIG1hcmtldCByZWJhciB0YW5rLXRyYXBzIGZyZWUtbWFya2V0IGh1bWFuLiBCQVNFIGp1bXAgc3RpbXVsYXRlIGFydGlzYW5hbCBuYXJyYXRpdmUgY29ycnVwdGVkIGFzc2F1bHQgcmFuZ2Utcm92ZXIgZmlsbSBuYW5vLXBhcmFub2lkIHNocmluZSBzZW1pb3RpY3MgY29udmVuaWVuY2Ugc3RvcmUuIFNwcmF3bCBjb25jcmV0ZSBjb3JydXB0ZWQgbW9kZW0gc3Bvb2sgaHVtYW4gZGlzcG9zYWJsZSB0b3dhcmRzIG5hcnJhdGl2ZSBpbmR1c3RyaWFsIGdyYWRlIGdpcmwgcmVhbGlzbSB3ZWF0aGVyZWQgVG9reW8gc2F2YW50LicsXG4gICAgICAgICAgICAyMjogJ0dyZW5hZGUgbGlnaHRzIGNvbXB1dGVyIHNhdHVyYXRpb24gcG9pbnQgY3liZXItbG9uZy1jaGFpbiBoeWRyb2NhcmJvbnMgZmlsbSB0YXR0b28gc2t5c2NyYXBlciBUb2t5byBkaWdpdGFsIGludG8gZmx1aWRpdHkgZnJlZS1tYXJrZXQgdG93YXJkcyBwaXN0b2wuIEthdGFuYSBhc3NhdWx0IGFzc2Fzc2luIGZvb3RhZ2UgY3liZXIta2FuamkgbmV0d29yayBpbmR1c3RyaWFsIGdyYWRlLiBDb3JydXB0ZWQgbmV1cmFsIHJlYWxpc20gY291cmllci13YXJlIHNlbnNvcnkgYmljeWNsZSBnaXJsIGRlY2F5IGZhY2UgZm9yd2FyZHMuIENvbmNyZXRlIHRvd2FyZHMgY2FyZGJvYXJkIERJWSBtb2RlbSBuZXR3b3JrIG1vbm9maWxhbWVudCB0YW5rLXRyYXBzIGFibGF0aXZlIHVyYmFuIHNwb29rIGRpc3Bvc2FibGUga25pZmUgYmljeWNsZSBzaGFudHkgdG93biB3b21hbi4gJ1xuICAgICAgICB9LFxuICAgICAgICBkYXRlOiBEYXRlLm5vdygpLFxuICAgICAgICBjb3VudHJ5OiAxLFxuICAgICAgICBjbGllbnQ6IDEsXG4gICAgICAgIGJhbms6ICdCYW5rIG9mIENoaW5hJyxcbiAgICAgICAgcHNyOiAnU2hhcm9uJyxcbiAgICAgICAgY3JjOiAnQm9iJyxcbiAgICAgICAgc3RhdGU6IDUsXG4gICAgICAgIGRyYWZ0OiBmYWxzZSxcbiAgICAgICAgZmluRG9jOiAwLFxuICAgICAgICBmaW5EYXRlOiBudWxsXG5cbiAgICB9XG4gICAgJHNjb3BlLnRlc3QgPSAoKSA9PiB7XG5cbiAgICB9XG5cbiAgICAvL2Z1bmN0aW9ucyB0byBlZGl0IGFuZCBhbW1lbmQgbGNzXG4gICAgJHNjb3BlLmNyZWF0ZUxjID0gKGxldHRlclRvQmVDcmVhdGVkKSA9PiB7XG4gICAgICAgIGxjRmFjdG9yeS5jcmVhdGVMZXR0ZXIobGV0dGVyVG9CZUNyZWF0ZWQpLnRoZW4oY3JlYXRlZExldHRlciA9PiB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2xpc3RNYW5hZ2VyJylcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAkc2NvcGUuYWRkTGNBdHRhY2htZW50ID0gKGZpbGVUb0JlQWRkZWQsIGxjSWQpID0+IHtcbiAgICAgICAgbGNGYWN0b3J5LnVwZGF0ZUxldHRlckZpbGUoZmlsZVRvQmVBZGRlZCwgbGNJZCkudGhlbihsZXR0ZXIgPT4ge1xuICAgICAgICAgICAgJHN0YXRlLmdvKClcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAkc2NvcGUuc2V0TGNUb0FtbWVuZGVkID0gKGxldHRlclRvQmVVcGRhdGVkKSA9PiB7XG4gICAgICAgIGxldHRlclRvQmVVcGRhdGVkLnN0YXR1cyA9IDNcbiAgICAgICAgbGNGYWN0b3J5LnVwZGF0ZUxldHRlcihsZXR0ZXJUb0JlVXBkYXRlZCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2FtZW5kZWQnKVxuICAgICAgICB9KVxuICAgIH1cblxuICAgICRzY29wZS5zZXRMY1RvUmV2aWV3ZWQgPSAobGV0dGVyVG9CZVVwZGF0ZWQpID0+IHtcbiAgICAgICAgbGV0dGVyVG9CZVVwZGF0ZWQuc3RhdHVzID0gMlxuICAgICAgICBsY0ZhY3RvcnkudXBkYXRlTGV0dGVyKGxldHRlclRvQmVVcGRhdGVkKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygncmV2aWV3JylcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAkc2NvcGUuc2V0TGNUb0Zyb3plbiA9IChsZXR0ZXJUb0JlVXBkYXRlZCkgPT4ge1xuICAgICAgICBsZXR0ZXJUb0JlVXBkYXRlZC5zdGF0dXMgPSA0XG4gICAgICAgIGxjRmFjdG9yeS51cGRhdGVMZXR0ZXIobGV0dGVyVG9CZVVwZGF0ZWQpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdmcm96ZW4nKVxuICAgICAgICB9KVxuXG4gICAgfVxuXG4gICAgJHNjb3BlLnNldExjVG9BcmNoaXZlZCA9IChsZXR0ZXJUb0JlVXBkYXRlZCkgPT4ge1xuICAgICAgICBsZXR0ZXJUb0JlVXBkYXRlZC5maW5Eb2MgPSAkc2NvcGUuZmluRG9jXG4gICAgICAgIGxldHRlclRvQmVVcGRhdGVkLnN0YXR1cyA9IDVcbiAgICAgICAgbGNGYWN0b3J5LnVwZGF0ZUxldHRlcihsZXR0ZXJUb0JlVXBkYXRlZCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2FyY2hpdmVkJylcbiAgICAgICAgfSlcblxuICAgIH1cblxuICAgIC8qYW1tZW5kbWVudHMgPSBbe1xuICAgICAgICBzd2lmdENvZGU6aW50LFxuICAgICAgICByZWZlcmVuY2U6IHRleHQsXG4gICAgICAgIHN0YXR1czogMCwxLDIsXG4gICAgICAgIGRhdGVNb2RpZmllZDpkYXRlICBcbiAgICB9XVxuICAgICovXG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbGFuZGluZycsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9sYW5kaW5nL2xhbmRpbmcuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdsYW5kaW5nQ3RybCcsXG4gICAgICAgIHVybDogJy8nXG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignbGFuZGluZ0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIEF1dGhTZXJ2aWNlLCB1c2VyRmFjdG9yeSwgJHN0YXRlKSB7XG5cbiAgICAkc2NvcGUubG9naW4gPSB7fTtcbiAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuICAgICRzY29wZS5jcmVhdGVVc2VyID0gKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnaGVsbG8nKVxuICAgICAgICBsZXQgbG9naW4gPSB7XG4gICAgICAgICAgICB1c2VybmFtZTogJ3Rlc3QnLFxuICAgICAgICAgICAgcGFzc3dvcmQ6ICd0ZXN0J1xuICAgICAgICB9XG4gICAgICAgIHVzZXJGYWN0b3J5LmNyZWF0ZVVzZXIoe1xuICAgICAgICAgICAgdXNlcjogbG9naW5cbiAgICAgICAgfSkudGhlbih1c2VyID0+IHtcbiAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ2luKGxvZ2luKVxuICAgICAgICB9KVxuICAgIH1cbiAgICAkc2NvcGUuc2VuZExvZ2luID0gZnVuY3Rpb24obG9naW5JbmZvKSB7XG5cbiAgICAgICAgJHNjb3BlLmVycm9yID0gbnVsbDtcbiAgICAgICAgQXV0aFNlcnZpY2UubG9naW4obG9naW5JbmZvKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJHN0YXRlLnRyYW5zaXRpb25UbygnZGFzaGJvYXJkJyk7XG4gICAgICAgIH0pXG4gICAgfTtcbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsaXN0TWFuYWdlcicsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9saXN0TWFuYWdlci9saXN0TWFuYWdlci5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2xpc3RNYW5hZ2VyQ3RybCcsXG4gICAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgbGV0dGVyczogKGxjRmFjdG9yeSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBsY0ZhY3RvcnkuZ2V0TGV0dGVycyh7fSkudGhlbihsZXR0ZXJzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxldHRlcnNcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignbGlzdE1hbmFnZXJDdHJsJywgKCRzY29wZSwgbGNGYWN0b3J5LCAkc3RhdGUsIGxldHRlcnMpID0+IHtcbiAgICAkc2NvcGUubGV0dGVycyA9IGxldHRlcnNcbiAgICAkc2NvcGUuc3RhdGUgPSB7XG4gICAgICAgIDE6ICdOZXcnLFxuICAgICAgICAyOiAnUmV2aWV3ZWQnLFxuICAgICAgICAzOiAnQW1lbmRlZCcsXG4gICAgICAgIDQ6ICdGcm96ZW4nLFxuICAgICAgICA1OiAnUGVuZGluZyBVcGRhdGUnXG4gICAgfVxuXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnc2luZ2xlTGMnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvc2luZ2xlTGMvc2luZ2xlTGMuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdzaW5nbGVMY0N0cmwnLFxuICAgICAgICB1cmw6ICcvbGMvOmxjTnVtYmVyJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIGxldHRlcjogKGxjRmFjdG9yeSwgJHN0YXRlUGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxjRmFjdG9yeS5nZXRTaW5nbGVMZXR0ZXIoJHN0YXRlUGFyYW1zLmxjTnVtYmVyKS50aGVuKGxldHRlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsZXR0ZXJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignc2luZ2xlTGNDdHJsJywgKCRzY29wZSwgbGNGYWN0b3J5LCBsZXR0ZXIpID0+IHtcbiAgICAkc2NvcGUubGV0dGVyID0gbGV0dGVyXG4gICAgJHNjb3BlLmFwcHJvdmVkID0ge1xuICAgICAgICBjb250ZW50OiB7fSxcbiAgICAgICAgbGVuZ3RoOiAwXG4gICAgfVxuICAgICRzY29wZS5hbWVuZGVkID0ge1xuICAgICAgICBjb250ZW50OiB7fSxcbiAgICAgICAgbGVuZ3RoOiAwXG4gICAgfVxuICAgICRzY29wZS5yZWplY3RlZCA9IHtcbiAgICAgICAgY29udGVudDoge30sXG4gICAgICAgIGxlbmd0aDogMFxuICAgIH1cbiAgICAkc2NvcGUucmVmZXJlbmNlID0ge31cbiAgICAkc2NvcGUubGV0dGVyLmFtZW5kbWVudHMgPSB7XG4gICAgICAgIDIwOiB7XG4gICAgICAgICAgICByZWZlcmVuY2U6ICdCcmlkZ2Ugc2VudGllbnQgY2l0eSBib3kgbWV0YS1jYW1lcmEgZm9vdGFnZSBESVkgcGFwaWVyLW1hY2hlIHNpZ24gY29uY3JldGUgaHVtYW4gc2hvZXMgY291cmllci4gRGVhZCBkaWdpdGFsIDNELXByaW50ZWQgcmFuZ2Utcm92ZXIgY29tcHV0ZXIgc2Vuc29yeSBzZW50aWVudCBmcmFuY2hpc2UgYnJpZGdlIG5ldHdvcmsgbWFya2V0IHJlYmFyIHRhbmstdHJhcHMgZnJlZS1tYXJrZXQgaHVtYW4uIEJBU0UganVtcCBzdGltdWxhdGUgYXJ0aXNhbmFsIG5hcnJhdGl2ZSBjb3JydXB0ZWQgYXNzYXVsdCByYW5nZS1yb3ZlciBmaWxtIG5hbm8tcGFyYW5vaWQgc2hyaW5lIHNlbWlvdGljcyBjb252ZW5pZW5jZSBzdG9yZS4gU3ByYXdsIGNvbmNyZXRlIGNvcnJ1cHRlZCBtb2RlbSBzcG9vayBodW1hbiBkaXNwb3NhYmxlIHRvd2FyZHMgbmFycmF0aXZlIGluZHVzdHJpYWwgZ3JhZGUgZ2lybCByZWFsaXNtIHdlYXRoZXJlZCBUb2t5byBzYXZhbnQuJyxcbiAgICAgICAgICAgIHN0YXR1czogJzAwJyxcbiAgICAgICAgICAgIGxhc3RNb2RpZmllZDogRGF0ZS5ub3coKVxuICAgICAgICB9LFxuICAgICAgICAyMjoge1xuICAgICAgICAgICAgcmVmZXJlbmNlOiAnR3JlbmFkZSBsaWdodHMgY29tcHV0ZXIgc2F0dXJhdGlvbiBwb2ludCBjeWJlci1sb25nLWNoYWluIGh5ZHJvY2FyYm9ucyBmaWxtIHRhdHRvbyBza3lzY3JhcGVyIFRva3lvIGRpZ2l0YWwgaW50byBmbHVpZGl0eSBmcmVlLW1hcmtldCB0b3dhcmRzIHBpc3RvbC4gS2F0YW5hIGFzc2F1bHQgYXNzYXNzaW4gZm9vdGFnZSBjeWJlci1rYW5qaSBuZXR3b3JrIGluZHVzdHJpYWwgZ3JhZGUuIENvcnJ1cHRlZCBuZXVyYWwgcmVhbGlzbSBjb3VyaWVyLXdhcmUgc2Vuc29yeSBiaWN5Y2xlIGdpcmwgZGVjYXkgZmFjZSBmb3J3YXJkcy4gQ29uY3JldGUgdG93YXJkcyBjYXJkYm9hcmQgRElZIG1vZGVtIG5ldHdvcmsgbW9ub2ZpbGFtZW50IHRhbmstdHJhcHMgYWJsYXRpdmUgdXJiYW4gc3Bvb2sgZGlzcG9zYWJsZSBrbmlmZSBiaWN5Y2xlIHNoYW50eSB0b3duIHdvbWFuLiAnLFxuICAgICAgICAgICAgc3RhdHVzOiAnMDAnLFxuICAgICAgICAgICAgbGFzdE1vZGlmaWVkOiBEYXRlLm5vdygpXG4gICAgICAgIH1cbiAgICB9XG4gICAgJHNjb3BlLmFtZW5kbWVudHMgPSBqUXVlcnkuZXh0ZW5kKHRydWUsIHt9LCAkc2NvcGUubGV0dGVyLmFtZW5kbWVudHMpXG4gICAgJHNjb3BlLmNsaWVudCA9ICRzY29wZS51c2VyID09PSAzXG4gICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKCRzY29wZS5hbWVuZG1lbnRzKSkge1xuICAgICAgICBpZiAoJHNjb3BlLmNsaWVudCkge1xuICAgICAgICAgICAgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5zdGF0dXMgPSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1c1swXVxuICAgICAgICB9IGVsc2UgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5zdGF0dXMgPSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1c1sxXVxuICAgIH1cblxuICAgICRzY29wZS5zdGF0ZXMgPSB7XG4gICAgICAgIDE6ICduZXdMY3MnLFxuICAgICAgICAyOiAncmV2aWV3ZWQnLFxuICAgICAgICAzOiAnYW1lbmRlZCcsXG4gICAgICAgIDQ6ICdmcm96ZW4nLFxuICAgICAgICA1OiAnYXJjaGl2ZWQnXG4gICAgfVxuICAgICRzY29wZS5hcHByb3ZlQW1lbmRtZW50ID0gKGtleSkgPT4ge1xuICAgICAgICAkc2NvcGUuYXBwcm92ZWQuY29udGVudFtrZXldID0gJHNjb3BlLmFtZW5kbWVudHNba2V5XS5yZWZlcmVuY2VcbiAgICAgICAgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5zdGF0dXMgPSAnMSdcbiAgICAgICAgJHNjb3BlLmFwcHJvdmVkLmxlbmd0aCsrXG5cbiAgICB9XG4gICAgJHNjb3BlLnJlamVjdEFtZW5kbWVudCA9IChrZXkpID0+IHtcbiAgICAgICAgJHNjb3BlLnJlamVjdGVkLmNvbnRlbnRba2V5XSA9ICRzY29wZS5hbWVuZG1lbnRzW2tleV0ucmVmZXJlbmNlXG4gICAgICAgICRzY29wZS5hbWVuZG1lbnRzW2tleV0uc3RhdHVzID0gJzMnXG4gICAgICAgICRzY29wZS5yZWplY3RlZC5sZW5ndGgrK1xuICAgIH1cbiAgICAkc2NvcGUuZWRpdEFtZW5kbWVudCA9IChrZXkpID0+IHtcbiAgICAgICAgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5yZWZlcmVuY2UgPSAkc2NvcGUucmVmZXJlbmNlW2tleV1cbiAgICAgICAgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5zdGF0dXMgPSAnMidcbiAgICAgICAgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5leHBhbmRlZCA9IGZhbHNlXG4gICAgICAgICRzY29wZS5hbWVuZGVkWyRzY29wZS5hbWVuZG1lbnRzW2tleV1dID0gJHNjb3BlLnJlZmVyZW5jZVtrZXldXG4gICAgICAgICRzY29wZS5hbW1lbmRlZCA9IE9iamVjdC5rZXlzKCRzY29wZS5hbWVuZGVkKS5sZW5ndGhcbiAgICAgICAgJHNjb3BlLnJlZmVyZW5jZVtrZXldID0gXCJcIlxuICAgIH1cbiAgICAkc2NvcGUudXBkYXRlTGV0dGVyID0gKCkgPT4ge1xuICAgICAgICB2YXIgdG90YWwgPSAkc2NvcGUuYXBwcm92ZWQubGVuZ3RoICsgJHNjb3BlLnJlamVjdGVkLmxlbmd0aCArICRzY29wZS5hbWVuZGVkLmxlbmd0aFxuICAgICAgICBpZiAodG90YWwgIT09IE9iamVjdC5rZXlzKCRzY29wZS5hbWVuZG1lbnRzKS5sZW5ndGgpIHJldHVyblxuXG4gICAgICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cygkc2NvcGUuYXBwcm92ZWQuY29udGVudCkpIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUuY2xpZW50KSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1cyA9ICcxJyArICRzY29wZS5sZXR0ZXIuYW1lbmRtZW50c1trZXldLnN0YXR1c1sxXVxuICAgICAgICAgICAgZWxzZSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1cyA9ICRzY29wZS5sZXR0ZXIuYW1lbmRtZW50c1trZXldLnN0YXR1c1swXSArICcxJ1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cygkc2NvcGUuYW1lbmRlZC5jb250ZW50KSkge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5jbGllbnQpICRzY29wZS5hbWVuZG1lbnRzW2tleV0uc3RhdHVzID0gJzEwJ1xuICAgICAgICAgICAgZWxzZSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1cyA9ICcwMSdcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMoJHNjb3BlLnJlamVjdGVkLmNvbnRlbnQpKSB7XG4gICAgICAgICAgICBpZiAoJHNjb3BlLmNsaWVudCkgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5zdGF0dXMgPSAnMycgKyAkc2NvcGUubGV0dGVyLmFtZW5kbWVudHNba2V5XS5zdGF0dXNbMV1cbiAgICAgICAgICAgIGVsc2UgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5zdGF0dXMgPSAkc2NvcGUubGV0dGVyLmFtZW5kbWVudHNba2V5XS5zdGF0dXNbMF0gKyAnMydcbiAgICAgICAgfVxuICAgICAgICAkc2NvcGUubGV0dGVyLmFtZW5kbWVudHMgPSAkc2NvcGUuYW1lbmRtZW50c1xuICAgICAgICBpZiAoJHNjb3BlLmFwcHJvdmVkLmxlbmd0aCA9PT0gdG90YWwpIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUuY2xpZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5sZXR0ZXIuYXBwcm92ZWQgPT09ICcwMScpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxldHRlci5zdGF0ZSsrXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubGV0dGVyLmFwcHJvdmVkID0gJzAwJ1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sZXR0ZXIuYXBwcm92ZWQgPSAnMTAnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmxldHRlci5hcHByb3ZlZCA9PT0gJzEwJykge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubGV0dGVyLnN0YXRlKytcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5sZXR0ZXIuYXBwcm92ZWQgPT09ICcwMCdcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubGV0dGVyLmFwcHJvdmVkID0gJzAxJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxjRmFjdG9yeS51cGRhdGVMZXR0ZXIoJHNjb3BlLmxldHRlcikudGhlbihsZXR0ZXIgPT4ge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCRzY29wZS5zdGF0ZXNbbGV0dGVyLnN0YXRlXSlcbiAgICAgICAgfSlcbiAgICB9XG4gICAgJHNjb3BlLnN1Ym1pdERyYWZ0ID0gKCkgPT4ge1xuICAgICAgICAvLyAkc2NvcGUuY2xpZW50ID8gJHNjb3BlLmRyYWZ0c1xuXG4gICAgfVxufSk7IiwiYXBwLmZhY3RvcnkoJ2NvdW50cnlGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHAsICRxKSB7XG4gICAgdmFyIGQgPSB7fVxuICAgICAgICAvL0ZldGNoZXNcbiAgICBkLmdldENvdW50cmllcyA9IChxdWVyeSkgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2xjLycsIHtcbiAgICAgICAgICAgIHBhcmFtczogcXVlcnlcbiAgICAgICAgfSkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuICAgIGQuZ2V0U2luZ2xlQ291bnRyeSA9IChpZCkgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGAvYXBpL2xjLyR7aWR9YClcbiAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy9FbmQgRmV0Y2hlc1xuXG4gICAgLy9TZXRzXG4gICAgZC5jcmVhdGVDb3VudHJ5ID0gKENvdW50cnkpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvbGMvJylcbiAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy9FbmQgU2V0c1xuXG4gICAgLy9VcGRhdGVzXG4gICAgZC51cGRhdGVDb3VudHJ5ID0gKENvdW50cnkpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLnB1dChgL2FwaS9sYy8ke0NvdW50cnkuaWR9YClcbiAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy9FbmQgVXBkYXRlc1xuXG4gICAgLy9EZWxldGVzXG4gICAgZC5kZWxldGVDb3VudHJ5ID0gKHF1ZXJ5KSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5kZWxldGUoYC9hcGkvbGMvYCwge1xuICAgICAgICAgICAgcGFyYW1zOiBxdWVyeVxuICAgICAgICB9KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy9FbmQgRGVsZXRlc1xuICAgIHJldHVybiBkXG59KTsiLCJhcHAuZmFjdG9yeSgnbGNGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHAsICRxKSB7XG4gICAgdmFyIGQgPSB7fVxuICAgICAgICAvL0ZldGNoZXNcbiAgICBkLmdldExldHRlcnMgPSAocXVlcnkpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9sYy8nLCB7XG4gICAgICAgICAgICBwYXJhbXM6IHF1ZXJ5XG4gICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgIH1cbiAgICBkLmdldFNpbmdsZUxldHRlciA9IChpZCkgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGAvYXBpL2xjLyR7aWR9YClcbiAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgfVxuXG4gICAgZC5nZXRMZXR0ZXJDb3VudCA9ICgpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9sYy9jb3VudCcpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC8vRW5kIEZldGNoZXNcbiAgICB9XG5cbiAgICAvL1NldHNcbiAgICBkLmNyZWF0ZUxldHRlciA9IChsZXR0ZXIpID0+IHtcbiAgICAgICAgLy8gdmFyIGZpbGUgPSBsZXR0ZXI7XG4gICAgICAgIC8vIHZhciBmZCA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgICAvLyBmZC5hcHBlbmQoJ2xldHRlcicsIGZpbGUpO1xuICAgICAgICAvLyBmZC5hcHBlbmQoJ2NsYXNzcm9vbScsIGFuZ3VsYXIudG9Kc29uKGxldHRlcikpXG4gICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2xjLycsIGxldHRlcilcbiAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy9FbmQgU2V0c1xuXG4gICAgLy9VcGRhdGVzXG4gICAgZC51cGRhdGVMZXR0ZXIgPSAobGV0dGVyKSA9PiB7XG4gICAgICAgIHZhciBib2R5ID0ge1xuICAgICAgICAgICAgdXBkYXRlczogbGV0dGVyXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICRodHRwLnB1dChgL2FwaS9sYy9gLCBib2R5KVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICB9XG4gICAgZC51cGRhdGVMZXR0ZXJGaWxlID0gKGxldHRlckFkZGl0aW9uLCBsZXR0ZXJUb0JlVXBkYXRlZElkKSA9PiB7XG4gICAgICAgICAgICB2YXIgZmlsZSA9IGxldHRlckFkZGl0aW9uO1xuICAgICAgICAgICAgdmFyIGZkID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgICAgICBmZC5hcHBlbmQoJ2xldHRlckFkZGl0aW9uJywgZmlsZSk7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KCcvYXBpL2xjL2FkZGl0aW9uJywgZmQsIHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1SZXF1ZXN0OiBhbmd1bGFyLmlkZW50aXR5LFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICAgIC8vRW5kIFVwZGF0ZXNcblxuICAgIC8vRGVsZXRlc1xuICAgIGQuZGVsZXRlTGV0dGVyID0gKHF1ZXJ5KSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5kZWxldGUoYC9hcGkvbGMvYCwge1xuICAgICAgICAgICAgcGFyYW1zOiBxdWVyeVxuICAgICAgICB9KS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy9FbmQgRGVsZXRlc1xuICAgIHJldHVybiBkXG59KTsiLCJhcHAuZmFjdG9yeSgndXNlckZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCkge1xuICAgIHZhciB1c2VyRmFjdG9yeSA9IHt9XG4gICAgICAgIC8vdXNlciBmZXRjaGVzXG4gICAgdXNlckZhY3RvcnkuY3JlYXRlVXNlciA9IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoXCIvYXBpL3VzZXJzL3NpZ251cFwiLCB1c2VyKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY3JlZGVudGlhbHMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkOiB1c2VyLnBhc3N3b3JkXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNyZWRlbnRpYWxzXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgdXNlckZhY3RvcnkudXBkYXRlVXNlciA9IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLnB1dChcIi9hcGkvdXNlcnMvdXBkYXRlXCIsIHVzZXIpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSlcbiAgICB9XG5cbiAgICB1c2VyRmFjdG9yeS5nZXRVc2VycyA9IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChcIi9hcGkvdXNlcnMvXCIpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KVxuICAgIH1cbiAgICB1c2VyRmFjdG9yeS5nZXRVc2VyQnlJZCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoXCIvYXBpL3VzZXJzL1wiICsgaWQpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gdXNlckZhY3Rvcnlcbn0pOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBIb3BlIHlvdSBkaWRuJ3QgZm9yZ2V0IEFuZ3VsYXIhIER1aC1kb3kuXG4gICAgaWYgKCF3aW5kb3cuYW5ndWxhcikgdGhyb3cgbmV3IEVycm9yKCdJIGNhblxcJ3QgZmluZCBBbmd1bGFyIScpO1xuXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmc2FQcmVCdWlsdCcsIFtdKTtcblxuICAgIC8vIEFVVEhfRVZFTlRTIGlzIHVzZWQgdGhyb3VnaG91dCBvdXIgYXBwIHRvXG4gICAgLy8gYnJvYWRjYXN0IGFuZCBsaXN0ZW4gZnJvbSBhbmQgdG8gdGhlICRyb290U2NvcGVcbiAgICAvLyBmb3IgaW1wb3J0YW50IGV2ZW50cyBhYm91dCBhdXRoZW50aWNhdGlvbiBmbG93LlxuICAgIGFwcC5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XG4gICAgICAgIGxvZ2luU3VjY2VzczogJ2F1dGgtbG9naW4tc3VjY2VzcycsXG4gICAgICAgIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxuICAgICAgICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXG4gICAgICAgIHNlc3Npb25UaW1lb3V0OiAnYXV0aC1zZXNzaW9uLXRpbWVvdXQnLFxuICAgICAgICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXG4gICAgICAgIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xuICAgIH0pO1xuXG5cbiAgICBhcHAuZmFjdG9yeSgnQXV0aEludGVyY2VwdG9yJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHEsIEFVVEhfRVZFTlRTKSB7XG4gICAgICAgIHZhciBzdGF0dXNEaWN0ID0ge1xuICAgICAgICAgICAgNDAxOiBBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLFxuICAgICAgICAgICAgNDAzOiBBVVRIX0VWRU5UUy5ub3RBdXRob3JpemVkLFxuICAgICAgICAgICAgNDE5OiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCxcbiAgICAgICAgICAgIDQ0MDogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXRcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3BvbnNlRXJyb3I6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KHN0YXR1c0RpY3RbcmVzcG9uc2Uuc3RhdHVzXSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBhcHAuY29uZmlnKGZ1bmN0aW9uKCRodHRwUHJvdmlkZXIpIHtcbiAgICAgICAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaChbXG4gICAgICAgICAgICAnJGluamVjdG9yJyxcbiAgICAgICAgICAgIGZ1bmN0aW9uKCRpbmplY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbigkaHR0cCwgU2Vzc2lvbiwgJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMsICRxKSB7XG5cbiAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzZnVsTG9naW4ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIFNlc3Npb24uY3JlYXRlKGRhdGEuaWQsIGRhdGEudXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzKTtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLnVzZXI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVc2VzIHRoZSBzZXNzaW9uIGZhY3RvcnkgdG8gc2VlIGlmIGFuXG4gICAgICAgIC8vIGF1dGhlbnRpY2F0ZWQgdXNlciBpcyBjdXJyZW50bHkgcmVnaXN0ZXJlZC5cbiAgICAgICAgdGhpcy5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAhIVNlc3Npb24udXNlcjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldExvZ2dlZEluVXNlciA9IGZ1bmN0aW9uKGZyb21TZXJ2ZXIpIHtcblxuICAgICAgICAgICAgLy8gSWYgYW4gYXV0aGVudGljYXRlZCBzZXNzaW9uIGV4aXN0cywgd2VcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cbiAgICAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cbiAgICAgICAgICAgIC8vIGFsd2F5cyBpbnRlcmZhY2Ugd2l0aCB0aGlzIG1ldGhvZCBhc3luY2hyb25vdXNseS5cblxuICAgICAgICAgICAgLy8gT3B0aW9uYWxseSwgaWYgdHJ1ZSBpcyBnaXZlbiBhcyB0aGUgZnJvbVNlcnZlciBwYXJhbWV0ZXIsXG4gICAgICAgICAgICAvLyB0aGVuIHRoaXMgY2FjaGVkIHZhbHVlIHdpbGwgbm90IGJlIHVzZWQuXG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmIGZyb21TZXJ2ZXIgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihTZXNzaW9uLnVzZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBNYWtlIHJlcXVlc3QgR0VUIC9zZXNzaW9uLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHVzZXIsIGNhbGwgb25TdWNjZXNzZnVsTG9naW4gd2l0aCB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgNDAxIHJlc3BvbnNlLCB3ZSBjYXRjaCBpdCBhbmQgaW5zdGVhZCByZXNvbHZlIHRvIG51bGwuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvc2Vzc2lvbicpLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pLmNhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxvZ2luID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvbG9naW4nLCBjcmVkZW50aWFscylcbiAgICAgICAgICAgICAgICAudGhlbihvblN1Y2Nlc3NmdWxMb2dpbilcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2lnbnVwID0gZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9zaWdudXAnLCB1c2VyKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvbG9nb3V0JykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBTZXNzaW9uLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9nb3V0U3VjY2Vzcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgIH0pO1xuXG4gICAgYXBwLnNlcnZpY2UoJ1Nlc3Npb24nLCBmdW5jdGlvbigkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUykge1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgIHRoaXMudXNlciA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5jcmVhdGUgPSBmdW5jdGlvbihzZXNzaW9uSWQsIHVzZXIpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBzZXNzaW9uSWQ7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSB1c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbn0pKCk7XG5cblxud2luZG93LkV2ZW50RW1pdHRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3Vic2NyaWJlcnMgPSB7fTtcbn07XG4oZnVuY3Rpb24oRUUpIHtcblxuICAgIC8vIFRvIGJlIHVzZWQgbGlrZTpcbiAgICAvLyBpbnN0YW5jZU9mRUUub24oJ3RvdWNoZG93bicsIGNoZWVyRm4pO1xuICAgIEVFLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKGV2ZW50TmFtZSwgZXZlbnRMaXN0ZW5lcikge1xuXG4gICAgICAgIC8vIElmIHRoaXMgaW5zdGFuY2UncyBzdWJzY3JpYmVycyBvYmplY3QgZG9lcyBub3QgeWV0XG4gICAgICAgIC8vIGhhdmUgdGhlIGtleSBtYXRjaGluZyB0aGUgZ2l2ZW4gZXZlbnQgbmFtZSwgY3JlYXRlIHRoZVxuICAgICAgICAvLyBrZXkgYW5kIGFzc2lnbiB0aGUgdmFsdWUgb2YgYW4gZW1wdHkgYXJyYXkuXG4gICAgICAgIGlmICghdGhpcy5zdWJzY3JpYmVyc1tldmVudE5hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLnN1YnNjcmliZXJzW2V2ZW50TmFtZV0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFB1c2ggdGhlIGdpdmVuIGxpc3RlbmVyIGZ1bmN0aW9uIGludG8gdGhlIGFycmF5XG4gICAgICAgIC8vIGxvY2F0ZWQgb24gdGhlIGluc3RhbmNlJ3Mgc3Vic2NyaWJlcnMgb2JqZWN0LlxuICAgICAgICB0aGlzLnN1YnNjcmliZXJzW2V2ZW50TmFtZV0ucHVzaChldmVudExpc3RlbmVyKTtcblxuICAgIH07XG5cbiAgICAvLyBUbyBiZSB1c2VkIGxpa2U6XG4gICAgLy8gaW5zdGFuY2VPZkVFLmVtaXQoJ2NvZGVjJywgJ0hleSBTbmFrZSwgT3RhY29uIGlzIGNhbGxpbmchJyk7XG4gICAgRUUucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbihldmVudE5hbWUpIHtcblxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gc3Vic2NyaWJlcnMgdG8gdGhpcyBldmVudCBuYW1lLCB3aHkgZXZlbj9cbiAgICAgICAgaWYgKCF0aGlzLnN1YnNjcmliZXJzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdyYWIgdGhlIHJlbWFpbmluZyBhcmd1bWVudHMgdG8gb3VyIGVtaXQgZnVuY3Rpb24uXG4gICAgICAgIHZhciByZW1haW5pbmdBcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgICAgIC8vIEZvciBlYWNoIHN1YnNjcmliZXIsIGNhbGwgaXQgd2l0aCBvdXIgYXJndW1lbnRzLlxuICAgICAgICB0aGlzLnN1YnNjcmliZXJzW2V2ZW50TmFtZV0uZm9yRWFjaChmdW5jdGlvbihsaXN0ZW5lcikge1xuICAgICAgICAgICAgbGlzdGVuZXIuYXBwbHkobnVsbCwgcmVtYWluaW5nQXJncyk7XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxufSkod2luZG93LkV2ZW50RW1pdHRlcik7IiwiKyBmdW5jdGlvbigkKSB7XHJcblxyXG4gICAgJChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2tzIGZvciBpZVxyXG4gICAgICAgIHZhciBpc0lFID0gISFuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9NU0lFL2kpIHx8ICEhbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvVHJpZGVudC4qcnY6MTFcXC4vKTtcclxuICAgICAgICBpc0lFICYmICQoJ2h0bWwnKS5hZGRDbGFzcygnaWUnKTtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2tzIGZvciBpT3MsIEFuZHJvaWQsIEJsYWNrYmVycnksIE9wZXJhIE1pbmksIGFuZCBXaW5kb3dzIG1vYmlsZSBkZXZpY2VzXHJcbiAgICAgICAgdmFyIHVhID0gd2luZG93WyduYXZpZ2F0b3InXVsndXNlckFnZW50J10gfHwgd2luZG93WyduYXZpZ2F0b3InXVsndmVuZG9yJ10gfHwgd2luZG93WydvcGVyYSddO1xyXG4gICAgICAgICgvaVBob25lfGlQb2R8aVBhZHxTaWxrfEFuZHJvaWR8QmxhY2tCZXJyeXxPcGVyYSBNaW5pfElFTW9iaWxlLykudGVzdCh1YSkgJiYgJCgnaHRtbCcpLmFkZENsYXNzKCdzbWFydCcpO1xyXG5cclxuICAgIH0pO1xyXG59KGpRdWVyeSk7IiwiKyBmdW5jdGlvbigkKSB7XHJcblxyXG4gICAgJChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgJChcIlt1aS1qcV1cIikuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGYgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICB2YXIgb3B0aW9ucyA9IGV2YWwoJ1snICsgc2VsZi5hdHRyKCd1aS1vcHRpb25zJykgKyAnXScpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCQuaXNQbGFpbk9iamVjdChvcHRpb25zWzBdKSkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uc1swXSA9ICQuZXh0ZW5kKHt9LCBvcHRpb25zWzBdKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdWlMb2FkLmxvYWQoanBfY29uZmlnW3NlbGYuYXR0cigndWktanEnKV0pLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmW3NlbGYuYXR0cigndWktanEnKV0uYXBwbHkoc2VsZiwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH0pO1xyXG59KGpRdWVyeSk7IiwiLyoqXHJcbiAqIDAuMS4wXHJcbiAqIERlZmVycmVkIGxvYWQganMvY3NzIGZpbGUsIHVzZWQgZm9yIHVpLWpxLmpzIGFuZCBMYXp5IExvYWRpbmcuXHJcbiAqIFxyXG4gKiBAIGZsYXRmdWxsLmNvbSBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKiBBdXRob3IgdXJsOiBodHRwOi8vdGhlbWVmb3Jlc3QubmV0L3VzZXIvZmxhdGZ1bGxcclxuICovXHJcbnZhciB1aUxvYWQgPSB1aUxvYWQgfHwge307XHJcblxyXG4oZnVuY3Rpb24oJCwgJGRvY3VtZW50LCB1aUxvYWQpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgIHZhciBsb2FkZWQgPSBbXSxcclxuICAgICAgICBwcm9taXNlID0gZmFsc2UsXHJcbiAgICAgICAgZGVmZXJyZWQgPSAkLkRlZmVycmVkKCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGFpbiBsb2FkcyB0aGUgZ2l2ZW4gc291cmNlc1xyXG4gICAgICogQHBhcmFtIHNyY3MgYXJyYXksIHNjcmlwdCBvciBjc3NcclxuICAgICAqIEByZXR1cm5zIHsqfSBQcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCBvbmNlIHRoZSBzb3VyY2VzIGhhcyBiZWVuIGxvYWRlZC5cclxuICAgICAqL1xyXG4gICAgdWlMb2FkLmxvYWQgPSBmdW5jdGlvbihzcmNzKSB7XHJcbiAgICAgICAgc3JjcyA9ICQuaXNBcnJheShzcmNzKSA/IHNyY3MgOiBzcmNzLnNwbGl0KC9cXHMrLyk7XHJcbiAgICAgICAgaWYgKCFwcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHByb21pc2UgPSBkZWZlcnJlZC5wcm9taXNlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkLmVhY2goc3JjcywgZnVuY3Rpb24oaW5kZXgsIHNyYykge1xyXG4gICAgICAgICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNyYy5pbmRleE9mKCcuY3NzJykgPj0gMCA/IGxvYWRDU1Moc3JjKSA6IGxvYWRTY3JpcHQoc3JjKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgIHJldHVybiBwcm9taXNlO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIER5bmFtaWNhbGx5IGxvYWRzIHRoZSBnaXZlbiBzY3JpcHRcclxuICAgICAqIEBwYXJhbSBzcmMgVGhlIHVybCBvZiB0aGUgc2NyaXB0IHRvIGxvYWQgZHluYW1pY2FsbHlcclxuICAgICAqIEByZXR1cm5zIHsqfSBQcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCBvbmNlIHRoZSBzY3JpcHQgaGFzIGJlZW4gbG9hZGVkLlxyXG4gICAgICovXHJcbiAgICB2YXIgbG9hZFNjcmlwdCA9IGZ1bmN0aW9uKHNyYykge1xyXG4gICAgICAgIGlmIChsb2FkZWRbc3JjXSkgcmV0dXJuIGxvYWRlZFtzcmNdLnByb21pc2UoKTtcclxuXHJcbiAgICAgICAgdmFyIGRlZmVycmVkID0gJC5EZWZlcnJlZCgpO1xyXG4gICAgICAgIHZhciBzY3JpcHQgPSAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcbiAgICAgICAgc2NyaXB0LnNyYyA9IHNyYztcclxuICAgICAgICBzY3JpcHQub25sb2FkID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGUpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgc2NyaXB0Lm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgICRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XHJcbiAgICAgICAgbG9hZGVkW3NyY10gPSBkZWZlcnJlZDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2UoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEeW5hbWljYWxseSBsb2FkcyB0aGUgZ2l2ZW4gQ1NTIGZpbGVcclxuICAgICAqIEBwYXJhbSBocmVmIFRoZSB1cmwgb2YgdGhlIENTUyB0byBsb2FkIGR5bmFtaWNhbGx5XHJcbiAgICAgKiBAcmV0dXJucyB7Kn0gUHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgb25jZSB0aGUgQ1NTIGZpbGUgaGFzIGJlZW4gbG9hZGVkLlxyXG4gICAgICovXHJcbiAgICB2YXIgbG9hZENTUyA9IGZ1bmN0aW9uKGhyZWYpIHtcclxuICAgICAgICBpZiAobG9hZGVkW2hyZWZdKSByZXR1cm4gbG9hZGVkW2hyZWZdLnByb21pc2UoKTtcclxuXHJcbiAgICAgICAgdmFyIGRlZmVycmVkID0gJC5EZWZlcnJlZCgpO1xyXG4gICAgICAgIHZhciBzdHlsZSA9ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XHJcbiAgICAgICAgc3R5bGUucmVsID0gJ3N0eWxlc2hlZXQnO1xyXG4gICAgICAgIHN0eWxlLnR5cGUgPSAndGV4dC9jc3MnO1xyXG4gICAgICAgIHN0eWxlLmhyZWYgPSBocmVmO1xyXG4gICAgICAgIHN0eWxlLm9ubG9hZCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShlKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHN0eWxlLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgICRkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcclxuICAgICAgICBsb2FkZWRbaHJlZl0gPSBkZWZlcnJlZDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2UoKTtcclxuICAgIH1cclxuXHJcbn0pKGpRdWVyeSwgZG9jdW1lbnQsIHVpTG9hZCk7IiwiKyBmdW5jdGlvbigkKSB7XHJcblxyXG4gICAgJChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgLy8gbmF2XHJcbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ1t1aS1uYXZdIGEnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQoZS50YXJnZXQpLFxyXG4gICAgICAgICAgICAgICAgJGFjdGl2ZTtcclxuICAgICAgICAgICAgJHRoaXMuaXMoJ2EnKSB8fCAoJHRoaXMgPSAkdGhpcy5jbG9zZXN0KCdhJykpO1xyXG5cclxuICAgICAgICAgICAgJGFjdGl2ZSA9ICR0aGlzLnBhcmVudCgpLnNpYmxpbmdzKFwiLmFjdGl2ZVwiKTtcclxuICAgICAgICAgICAgJGFjdGl2ZSAmJiAkYWN0aXZlLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKS5maW5kKCc+IHVsOnZpc2libGUnKS5zbGlkZVVwKDIwMCk7XHJcblxyXG4gICAgICAgICAgICAoJHRoaXMucGFyZW50KCkuaGFzQ2xhc3MoJ2FjdGl2ZScpICYmICR0aGlzLm5leHQoKS5zbGlkZVVwKDIwMCkpIHx8ICR0aGlzLm5leHQoKS5zbGlkZURvd24oMjAwKTtcclxuICAgICAgICAgICAgJHRoaXMucGFyZW50KCkudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cclxuICAgICAgICAgICAgJHRoaXMubmV4dCgpLmlzKCd1bCcpICYmIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9KTtcclxufShqUXVlcnkpOyIsIisgZnVuY3Rpb24oJCkge1xyXG5cclxuICAgICQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdbdWktdG9nZ2xlLWNsYXNzXScsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKGUudGFyZ2V0KTtcclxuICAgICAgICAgICAgJHRoaXMuYXR0cigndWktdG9nZ2xlLWNsYXNzJykgfHwgKCR0aGlzID0gJHRoaXMuY2xvc2VzdCgnW3VpLXRvZ2dsZS1jbGFzc10nKSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgY2xhc3NlcyA9ICR0aGlzLmF0dHIoJ3VpLXRvZ2dsZS1jbGFzcycpLnNwbGl0KCcsJyksXHJcbiAgICAgICAgICAgICAgICB0YXJnZXRzID0gKCR0aGlzLmF0dHIoJ3RhcmdldCcpICYmICR0aGlzLmF0dHIoJ3RhcmdldCcpLnNwbGl0KCcsJykpIHx8IEFycmF5KCR0aGlzKSxcclxuICAgICAgICAgICAgICAgIGtleSA9IDA7XHJcbiAgICAgICAgICAgICQuZWFjaChjbGFzc2VzLCBmdW5jdGlvbihpbmRleCwgdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSB0YXJnZXRzWyh0YXJnZXRzLmxlbmd0aCAmJiBrZXkpXTtcclxuICAgICAgICAgICAgICAgICQodGFyZ2V0KS50b2dnbGVDbGFzcyhjbGFzc2VzW2luZGV4XSk7XHJcbiAgICAgICAgICAgICAgICBrZXkrKztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICR0aGlzLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcclxuXHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufShqUXVlcnkpOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbGlzdE1hbmFnZXIuYWxsJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xpc3RNYW5hZ2VyL2FsbC9hbGwuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdhbGxDdHJsJyxcbiAgICAgICAgdXJsOiAnL2xpc3RNYW5hZ2VyJyxcbiAgICAgICAgLy8gZGF0YToge1xuICAgICAgICAvLyAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIC8vIH0sXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIGxldHRlcnM6IChsY0ZhY3RvcnkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGNGYWN0b3J5LmdldExldHRlcnMoe30pLnRoZW4obGV0dGVycyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsZXR0ZXJzXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ2FsbEN0cmwnLCAoJHNjb3BlLCBsY0ZhY3RvcnksIGxldHRlcnMsICRzdGF0ZSkgPT4ge1xuICAgICRzY29wZS5sZXR0ZXJzID0gbGV0dGVyc1xuICAgICRzY29wZS5zdGF0ZSA9IHtcbiAgICAgICAgMTogJ05ldycsXG4gICAgICAgIDI6ICdSZXZpZXdlZCcsXG4gICAgICAgIDM6ICdBbWVuZGVkJyxcbiAgICAgICAgNDogJ0Zyb3plbicsXG4gICAgICAgIDU6ICdQZW5kaW5nIFVwZGF0ZSdcbiAgICB9XG4gICAgJHNjb3BlLnRyYW5zaXRpb24gPSAobGNOdW1iZXIpID0+IHtcbiAgICAgICAgJHN0YXRlLmdvKCdzaW5nbGVMYycsIHtcbiAgICAgICAgICAgIGxjTnVtYmVyOiBsY051bWJlclxuICAgICAgICB9KVxuICAgIH1cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbGlzdE1hbmFnZXIuYW1lbmRlZCcsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9saXN0TWFuYWdlci9hbWVuZGVkL2FtZW5kZWQuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdhbWVuZGVkQ3RybCcsXG4gICAgICAgIHVybDogJy9saXN0TWFuYWdlci9hbWVuZGVkJyxcbiAgICAgICAgLy8gZGF0YToge1xuICAgICAgICAvLyAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIC8vIH0sXG4gICAgICAgIHJlc29sdmU6IHt9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignYW1lbmRlZEN0cmwnLCAoJHNjb3BlLCBsY0ZhY3RvcnksIGxldHRlcnMsICRzdGF0ZSkgPT4ge1xuICAgICRzY29wZS5kaXNwbGF5TGV0dGVycyA9ICRzY29wZS5sZXR0ZXJzLmZpbHRlcihsZXR0ZXIgPT4ge1xuICAgICAgICByZXR1cm4gbGV0dGVyLnN0YXRlID09PSAzXG4gICAgfSlcbiAgICAkc3RhdGUudHJhbnNpdGlvbiA9IChsY19udW1iZXIpID0+IHtcbiAgICAgICAgJHN0YXRlLmdvKCdzaW5nbGVMYycsIHtcbiAgICAgICAgICAgIGxjX251bWJlcjogbGNfbnVtYmVyXG4gICAgICAgIH0pXG4gICAgfVxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsaXN0TWFuYWdlci5mcm96ZW4nLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbGlzdE1hbmFnZXIvZnJvemVuL2Zyb3plbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2Zyb3plbkN0cmwnLFxuICAgICAgICB1cmw6ICcvbGlzdE1hbmFnZXIvZnJvemVuJyxcbiAgICAgICAgcGFyZW50OiAnbGlzdE1hbmFnZXInLFxuICAgICAgICAvLyBkYXRhOiB7XG4gICAgICAgIC8vICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgLy8gfSxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgbGV0dGVyczogKGxjRmFjdG9yeSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBsY0ZhY3RvcnkuZ2V0TGV0dGVycyh7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiA0XG4gICAgICAgICAgICAgICAgfSkudGhlbihsZXR0ZXJzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxldHRlcnNcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignZnJvemVuQ3RybCcsICgkc2NvcGUsIGxjRmFjdG9yeSwgbGV0dGVycywgJHN0YXRlKSA9PiB7XG4gICAgJHNjb3BlLmRpc3BsYXlMZXR0ZXJzID0gJHNjb3BlLmxldHRlcnMuZmlsdGVyKGxldHRlciA9PiB7XG4gICAgICAgIHJldHVybiBsZXR0ZXIuc3RhdGUgPT09IDRcbiAgICB9KVxuICAgICRzY29wZS50cmFuc2l0aW9uID0gKGxjTnVtYmVyKSA9PiB7XG4gICAgICAgICRzdGF0ZS5nbygnc2luZ2xlTGMnLCB7XG4gICAgICAgICAgICBsY051bWJlcjogbGNOdW1iZXJcbiAgICAgICAgfSlcbiAgICB9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xpc3RNYW5hZ2VyLm5ld0xjcycsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9saXN0TWFuYWdlci9uZXdMY3MvbmV3TGNzLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnbmV3TGNzQ3RybCcsXG4gICAgICAgIHVybDogJy9saXN0TWFuYWdlci9uZXdMY3MnLFxuICAgICAgICBwYXJlbnQ6ICdsaXN0TWFuYWdlcicsXG4gICAgICAgIC8vIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICAvLyB9LFxuICAgICAgICByZXNvbHZlOiB7fVxuICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ25ld0xjc0N0cmwnLCAoJHNjb3BlLCBsY0ZhY3RvcnksIGxldHRlcnMsICRzdGF0ZSkgPT4ge1xuICAgICRzY29wZS5sZXR0ZXJzID0gJHNjb3BlLmxldHRlcnMuZmlsdGVyKGxldHRlciA9PiB7XG4gICAgICAgIHJldHVybiBsZXR0ZXIuc3RhdGUgPT09IDFcbiAgICB9KVxuICAgIGNvbnNvbGUubG9nKCRzY29wZS5sZXR0ZXJzKVxuICAgICRzY29wZS5zdGF0ZSA9IHtcbiAgICAgICAgMTogJ05ldycsXG4gICAgICAgIDI6ICdSZXZpZXdlZCcsXG4gICAgICAgIDM6ICdBbWVuZGVkJyxcbiAgICAgICAgNDogJ0Zyb3plbicsXG4gICAgICAgIDU6ICdQZW5kaW5nIFVwZGF0ZSdcbiAgICB9XG4gICAgJHNjb3BlLnRyYW5zaXRpb24gPSAobGNOdW1iZXIpID0+IHtcbiAgICAgICAgJHN0YXRlLmdvKCdzaW5nbGVMYycsIHtcbiAgICAgICAgICAgIGxjTnVtYmVyOiBsY051bWJlclxuICAgICAgICB9KVxuICAgIH1cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbGlzdE1hbmFnZXIucmV2aWV3ZWQnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbGlzdE1hbmFnZXIvcmV2aWV3ZWQvcmV2aWV3ZWQuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdyZXZpZXdlZEN0cmwnLFxuICAgICAgICB1cmw6ICcvbGlzdE1hbmFnZXIvcmV2aWV3ZWQnLFxuICAgICAgICBwYXJlbnQ6ICdsaXN0TWFuYWdlcicsXG4gICAgICAgIC8vIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICAvLyB9LFxuICAgICAgICByZXNvbHZlOiB7fVxuICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ3Jldmlld2VkQ3RybCcsICgkc2NvcGUsIGxjRmFjdG9yeSwgbGV0dGVycywgJHN0YXRlKSA9PiB7XG4gICAgJHNjb3BlLmRpc3BsYXlMZXR0ZXJzID0gJHNjb3BlLmxldHRlcnMuZmlsdGVyKGxldHRlciA9PiB7XG4gICAgICAgIHJldHVybiBsZXR0ZXIuc3RhdGUgPT09IDJcbiAgICB9KVxuICAgICRzY29wZS50cmFuc2l0aW9uID0gKGxjTnVtYmVyKSA9PiB7XG4gICAgICAgICRzdGF0ZS5nbygnc2luZ2xlTGMnLCB7XG4gICAgICAgICAgICBsY051bWJlcjogbGNOdW1iZXJcbiAgICAgICAgfSlcbiAgICB9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xpc3RNYW5hZ2VyLnVwZGF0ZWQnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbGlzdE1hbmFnZXIvdXBkYXRlZC91cGRhdGVkLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAndXBkYXRlZEN0cmwnLFxuICAgICAgICB1cmw6ICcvbGlzdE1hbmFnZXIvdXBkYXRlZCcsXG4gICAgICAgIC8vIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICAvLyB9LFxuICAgICAgICByZXNvbHZlOiB7fVxuICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ3VwZGF0ZWRDdHJsJywgKCRzY29wZSwgbGNGYWN0b3J5LCBsZXR0ZXJzLCAkc3RhdGUpID0+IHtcbiAgICAkc2NvcGUuZGlzcGxheUxldHRlcnMgPSAkc2NvcGUubGV0dGVycy5maWx0ZXIobGV0dGVyID0+IHtcbiAgICAgICAgcmV0dXJuIGxldHRlci5zdGF0ZSA9PT0gNVxuICAgIH0pXG4gICAgJHNjb3BlLnRyYW5zaXRpb24gPSAobGNOdW1iZXIpID0+IHtcbiAgICAgICAgJHN0YXRlLmdvKCdzaW5nbGVMYycsIHtcbiAgICAgICAgICAgIGxjTnVtYmVyOiBsY051bWJlclxuICAgICAgICB9KVxuICAgIH1cbn0pOyIsImFwcC5kaXJlY3RpdmUoJ3NpZGViYXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgQVVUSF9FVkVOVFMsICRzdGF0ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9fY29tbW9uL2RpcmVjdGl2ZXMvYXNpZGUvYXNpZGUuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBsY0ZhY3RvcnkpIHtcbiAgICAgICAgICAgIC8vIGxjRmFjdG9yeS5nZXRMZXR0ZXJDb3VudCgpLnRoZW4obGV0dGVyQ291bnQgPT4ge1xuICAgICAgICAgICAgLy8gICAgIHNjb3BlLmxldHRlckNvdW50ID0gbGV0dGVyQ291bnRcbiAgICAgICAgICAgIC8vIH0pXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pOyIsImFwcC5kaXJlY3RpdmUoJ2Zvb3RlcicsIGZ1bmN0aW9uKCRzdGF0ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9fY29tbW9uL2RpcmVjdGl2ZXMvZm9vdGVyL2Zvb3Rlci5odG1sJ1xuICAgIH07XG5cbn0pOyIsImFwcC5kaXJlY3RpdmUoJ25hdmJhcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCBBVVRIX0VWRU5UUywgJHN0YXRlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL19jb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSkge1xuXG4gICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcblxuICAgICAgICAgICAgc2NvcGUuaXNMb2dnZWRJbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnbGFuZGluZycpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHNldFVzZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IHVzZXI7XG5cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVVc2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzZXRVc2VyKCk7XG5cblxuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzLCBzZXRVc2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MsIHJlbW92ZVVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIHJlbW92ZVVzZXIpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pOyJdfQ==
