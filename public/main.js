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
    $scope.test = function () {
        $scope.createLc({
            newLetter: $scope.letter
        });
    };

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
    $stateProvider.state('listManager', {
        templateUrl: 'js/listManager/listManager.html',
        controller: 'listManagerCtrl',
        abstract: true,
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
    $stateProvider.state('singleLc', {
        templateUrl: 'js/singleLc/singleLc.html',
        controller: 'singleLcCtrl',
        url: '/lc/:lcNumber',
        // data: {
        //     authenticate: true
        // },
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
    $state.transition = function (lc_number) {
        $state.go('singleLc', {
            lc_number: lc_number
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
    $scope.displayLetters = $scope.letters.filter(function (letter) {
        return letter.state === 1;
    });
    $scope.state = {
        1: 'New',
        2: 'Reviewed',
        3: 'Amended',
        4: 'Frozen',
        5: 'Pending Update'
    };
    $state.transition = function (lc_number) {
        $state.go('singleLc', {
            lc_number: lc_number
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
    $state.transition = function (lc_number) {
        $state.go('singleLc', {
            lc_number: lc_number
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
    $state.transition = function (lc_number) {
        $state.go('singleLc', {
            lc_number: lc_number
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNsYXVzZU1hbmFnZXIvY2xhdXNlTWFuYWdlci5qcyIsImRhc2hib2FyZC9kYXNoYm9hcmQuanMiLCJsaXN0TWFuYWdlci9saXN0TWFuYWdlci5qcyIsImxhbmRpbmcvbGFuZGluZy5qcyIsInNpbmdsZUxjL3NpbmdsZUxjLmpzIiwiX2NvbW1vbi9mYWN0b3JpZXMvY291bnRyeUZhY3RvcnkuanMiLCJfY29tbW9uL2ZhY3Rvcmllcy9sY0ZhY3RvcnkuanMiLCJfY29tbW9uL2ZhY3Rvcmllcy91c2VyRmFjdG9yeS5qcyIsIl9jb21tb24vcHJlYnVpbHQvZnNhLXByZS1idWlsdC5qcyIsIl9jb21tb24vcHJlYnVpbHQvdWktY2xpZW50LmpzIiwiX2NvbW1vbi9wcmVidWlsdC91aS1qcC5qcyIsIl9jb21tb24vcHJlYnVpbHQvdWktbG9hZC5qcyIsIl9jb21tb24vcHJlYnVpbHQvdWktbmF2LmpzIiwiX2NvbW1vbi9wcmVidWlsdC91aS10b2dnbGUuanMiLCJsaXN0TWFuYWdlci9hbGwvYWxsLmpzIiwibGlzdE1hbmFnZXIvYW1lbmRlZC9hbWVuZGVkLmpzIiwibGlzdE1hbmFnZXIvZnJvemVuL2Zyb3plbi5qcyIsImxpc3RNYW5hZ2VyL25ld0xjcy9uZXdMY3MuanMiLCJsaXN0TWFuYWdlci9yZXZpZXdlZC9yZXZpZXdlZC5qcyIsImxpc3RNYW5hZ2VyL3VwZGF0ZWQvdXBkYXRlZC5qcyIsIl9jb21tb24vZGlyZWN0aXZlcy9hc2lkZS9hc2lkZS5qcyIsIl9jb21tb24vZGlyZWN0aXZlcy9mb290ZXIvZm9vdGVyLmpzIiwiX2NvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuanMiXSwibmFtZXMiOlsid2luZG93IiwiYXBwIiwiYW5ndWxhciIsIm1vZHVsZSIsImNvbmZpZyIsIiR1cmxSb3V0ZXJQcm92aWRlciIsIiRsb2NhdGlvblByb3ZpZGVyIiwiJGNvbXBpbGVQcm92aWRlciIsImh0bWw1TW9kZSIsImFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0Iiwib3RoZXJ3aXNlIiwid2hlbiIsImxvY2F0aW9uIiwicmVsb2FkIiwicnVuIiwiJHJvb3RTY29wZSIsIkF1dGhTZXJ2aWNlIiwiJHN0YXRlIiwiZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCIsInN0YXRlIiwiZGF0YSIsImF1dGhlbnRpY2F0ZSIsIiRvbiIsImV2ZW50IiwidG9TdGF0ZSIsInRvUGFyYW1zIiwiaXNBdXRoZW50aWNhdGVkIiwicHJldmVudERlZmF1bHQiLCJnZXRMb2dnZWRJblVzZXIiLCJ0aGVuIiwidXNlciIsInRyYW5zaXRpb25UbyIsIm5hbWUiLCIkc3RhdGVQcm92aWRlciIsInRlbXBsYXRlVXJsIiwiY29udHJvbGxlciIsInVybCIsIiRzY29wZSIsInJlc29sdmUiLCJsY0ZhY3RvcnkiLCJsZXR0ZXIiLCJsY19udW1iZXIiLCJ1cGxvYWRzIiwiYW1tZW5kbWVudHMiLCJkYXRlIiwiRGF0ZSIsIm5vdyIsImNvdW50cnkiLCJjbGllbnQiLCJiYW5rIiwicHNyIiwiY3JjIiwiZHJhZnQiLCJmaW5Eb2MiLCJmaW5EYXRlIiwidGVzdCIsImNyZWF0ZUxjIiwibmV3TGV0dGVyIiwibGV0dGVyVG9CZUNyZWF0ZWQiLCJjcmVhdGVMZXR0ZXIiLCJnbyIsImFkZExjQXR0YWNobWVudCIsImZpbGVUb0JlQWRkZWQiLCJsY0lkIiwidXBkYXRlTGV0dGVyRmlsZSIsInNldExjVG9BbW1lbmRlZCIsImxldHRlclRvQmVVcGRhdGVkIiwic3RhdHVzIiwidXBkYXRlTGV0dGVyIiwic2V0TGNUb1Jldmlld2VkIiwic2V0TGNUb0Zyb3plbiIsInNldExjVG9BcmNoaXZlZCIsImFic3RyYWN0IiwibGV0dGVycyIsImdldExldHRlcnMiLCJ1c2VyRmFjdG9yeSIsImxvZ2luIiwiZXJyb3IiLCJjcmVhdGVVc2VyIiwiY29uc29sZSIsImxvZyIsInVzZXJuYW1lIiwicGFzc3dvcmQiLCJzZW5kTG9naW4iLCJsb2dpbkluZm8iLCIkc3RhdGVQYXJhbXMiLCJnZXRTaW5nbGVMZXR0ZXIiLCJsY051bWJlciIsImFwcHJvdmVkIiwiY29udGVudCIsImxlbmd0aCIsImFtZW5kZWQiLCJyZWplY3RlZCIsInJlZmVyZW5jZSIsImFtZW5kbWVudHMiLCJsYXN0TW9kaWZpZWQiLCJqUXVlcnkiLCJleHRlbmQiLCJPYmplY3QiLCJrZXlzIiwia2V5Iiwic3RhdGVzIiwiYXBwcm92ZUFtZW5kbWVudCIsInJlamVjdEFtZW5kbWVudCIsImVkaXRBbWVuZG1lbnQiLCJleHBhbmRlZCIsImFtbWVuZGVkIiwidG90YWwiLCJzdWJtaXREcmFmdCIsImZhY3RvcnkiLCIkaHR0cCIsIiRxIiwiZCIsImdldENvdW50cmllcyIsInF1ZXJ5IiwiZ2V0IiwicGFyYW1zIiwicmVzcG9uc2UiLCJjYXRjaCIsInJlamVjdCIsIm1lc3NhZ2UiLCJlcnIiLCJnZXRTaW5nbGVDb3VudHJ5IiwiaWQiLCJjcmVhdGVDb3VudHJ5IiwiQ291bnRyeSIsInBvc3QiLCJ1cGRhdGVDb3VudHJ5IiwicHV0IiwiZGVsZXRlQ291bnRyeSIsImRlbGV0ZSIsImdldExldHRlckNvdW50IiwiYm9keSIsInVwZGF0ZXMiLCJsZXR0ZXJBZGRpdGlvbiIsImxldHRlclRvQmVVcGRhdGVkSWQiLCJmaWxlIiwiZmQiLCJGb3JtRGF0YSIsImFwcGVuZCIsInRyYW5zZm9ybVJlcXVlc3QiLCJpZGVudGl0eSIsImhlYWRlcnMiLCJ1bmRlZmluZWQiLCJkZWxldGVMZXR0ZXIiLCJjcmVkZW50aWFscyIsImVtYWlsIiwidXBkYXRlVXNlciIsImdldFVzZXJzIiwiZ2V0VXNlckJ5SWQiLCJFcnJvciIsImNvbnN0YW50IiwibG9naW5TdWNjZXNzIiwibG9naW5GYWlsZWQiLCJsb2dvdXRTdWNjZXNzIiwic2Vzc2lvblRpbWVvdXQiLCJub3RBdXRoZW50aWNhdGVkIiwibm90QXV0aG9yaXplZCIsIkFVVEhfRVZFTlRTIiwic3RhdHVzRGljdCIsInJlc3BvbnNlRXJyb3IiLCIkYnJvYWRjYXN0IiwiJGh0dHBQcm92aWRlciIsImludGVyY2VwdG9ycyIsInB1c2giLCIkaW5qZWN0b3IiLCJzZXJ2aWNlIiwiU2Vzc2lvbiIsIm9uU3VjY2Vzc2Z1bExvZ2luIiwiY3JlYXRlIiwiZnJvbVNlcnZlciIsInNpZ251cCIsImxvZ291dCIsImRlc3Ryb3kiLCJzZWxmIiwic2Vzc2lvbklkIiwiRXZlbnRFbWl0dGVyIiwic3Vic2NyaWJlcnMiLCJFRSIsInByb3RvdHlwZSIsIm9uIiwiZXZlbnROYW1lIiwiZXZlbnRMaXN0ZW5lciIsImVtaXQiLCJyZW1haW5pbmdBcmdzIiwic2xpY2UiLCJjYWxsIiwiYXJndW1lbnRzIiwiZm9yRWFjaCIsImxpc3RlbmVyIiwiYXBwbHkiLCIkIiwiaXNJRSIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsIm1hdGNoIiwiYWRkQ2xhc3MiLCJ1YSIsImVhY2giLCJvcHRpb25zIiwiZXZhbCIsImF0dHIiLCJpc1BsYWluT2JqZWN0IiwidWlMb2FkIiwibG9hZCIsImpwX2NvbmZpZyIsIiRkb2N1bWVudCIsImxvYWRlZCIsInByb21pc2UiLCJkZWZlcnJlZCIsIkRlZmVycmVkIiwic3JjcyIsImlzQXJyYXkiLCJzcGxpdCIsImluZGV4Iiwic3JjIiwiaW5kZXhPZiIsImxvYWRDU1MiLCJsb2FkU2NyaXB0Iiwic2NyaXB0IiwiY3JlYXRlRWxlbWVudCIsIm9ubG9hZCIsImUiLCJvbmVycm9yIiwiYXBwZW5kQ2hpbGQiLCJocmVmIiwic3R5bGUiLCJyZWwiLCJ0eXBlIiwiaGVhZCIsImRvY3VtZW50IiwiJHRoaXMiLCJ0YXJnZXQiLCIkYWN0aXZlIiwiaXMiLCJjbG9zZXN0IiwicGFyZW50Iiwic2libGluZ3MiLCJ0b2dnbGVDbGFzcyIsImZpbmQiLCJzbGlkZVVwIiwiaGFzQ2xhc3MiLCJuZXh0Iiwic2xpZGVEb3duIiwiY2xhc3NlcyIsInRhcmdldHMiLCJBcnJheSIsInZhbHVlIiwidHJhbnNpdGlvbiIsImRpc3BsYXlMZXR0ZXJzIiwiZmlsdGVyIiwiZGlyZWN0aXZlIiwicmVzdHJpY3QiLCJzY29wZSIsImxpbmsiLCJpc0xvZ2dlZElu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LGtCQUFBL04sSUFBQSxHQUFBLElBQUE7O0FBRUErTixrQkFBQUUsVUFBQSxHQUFBLFlBQUE7QUFDQSx1QkFBQS9PLFlBQUFVLGVBQUEsRUFBQTtBQUNBLGFBRkE7O0FBSUFtTyxrQkFBQWpGLE1BQUEsR0FBQSxZQUFBO0FBQ0E1Siw0QkFBQTRKLE1BQUEsR0FBQS9JLElBQUEsQ0FBQSxZQUFBO0FBQ0FaLDJCQUFBMkMsRUFBQSxDQUFBLE1BQUE7QUFDQSxpQkFGQTtBQUdBLGFBSkE7O0FBTUEsZ0JBQUFvTSxVQUFBLFNBQUFBLE9BQUEsR0FBQTtBQUNBaFAsNEJBQUFZLGVBQUEsR0FBQUMsSUFBQSxDQUFBLFVBQUFDLElBQUEsRUFBQTtBQUNBK04sMEJBQUEvTixJQUFBLEdBQUFBLElBQUE7QUFFQSxpQkFIQTtBQUlBLGFBTEE7O0FBT0EsZ0JBQUFtTyxhQUFBLFNBQUFBLFVBQUEsR0FBQTtBQUNBSixzQkFBQS9OLElBQUEsR0FBQSxJQUFBO0FBQ0EsYUFGQTtBQUdBK04sa0JBQUFqRixNQUFBLEdBQUEsWUFBQTtBQUNBNUosNEJBQUE0SixNQUFBLEdBQUEvSSxJQUFBLENBQUEsWUFBQTtBQUNBWiwyQkFBQTJDLEVBQUEsQ0FBQSxPQUFBO0FBQ0EsaUJBRkE7QUFHQSxhQUpBO0FBS0FvTTs7QUFHQWpQLHVCQUFBTyxHQUFBLENBQUF3SSxZQUFBTixZQUFBLEVBQUF3RyxPQUFBO0FBQ0FqUCx1QkFBQU8sR0FBQSxDQUFBd0ksWUFBQUosYUFBQSxFQUFBdUcsVUFBQTtBQUNBbFAsdUJBQUFPLEdBQUEsQ0FBQXdJLFlBQUFILGNBQUEsRUFBQXNHLFVBQUE7QUFFQTs7QUF4Q0EsS0FBQTtBQTRDQSxDQTdDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xud2luZG93LmFwcCA9IGFuZ3VsYXIubW9kdWxlKCdlbGl0ZS1sYy1wb3J0YWwnLCBbJ2ZzYVByZUJ1aWx0JywgJ3VpLnJvdXRlcicsICd1aS5ib290c3RyYXAnLCAnbmdBbmltYXRlJ10pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uKCR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIsICRjb21waWxlUHJvdmlkZXIpIHtcbiAgICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgICRjb21waWxlUHJvdmlkZXIuYUhyZWZTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xsb2NhbHxkYXRhfGNocm9tZS1leHRlbnNpb24pOi8pO1xuICAgIC8vIElmIHdlIGdvIHRvIGEgVVJMIHRoYXQgdWktcm91dGVyIGRvZXNuJ3QgaGF2ZSByZWdpc3RlcmVkLCBnbyB0byB0aGUgXCIvXCIgdXJsLlxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbiAgICAvLyBUcmlnZ2VyIHBhZ2UgcmVmcmVzaCB3aGVuIGFjY2Vzc2luZyBhbiBPQXV0aCByb3V0ZVxuICAgICR1cmxSb3V0ZXJQcm92aWRlci53aGVuKCcvYXV0aC86cHJvdmlkZXInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH0pO1xufSk7XG5cbi8vIFRoaXMgYXBwLnJ1biBpcyBmb3IgY29udHJvbGxpbmcgYWNjZXNzIHRvIHNwZWNpZmljIHN0YXRlcy5cbmFwcC5ydW4oZnVuY3Rpb24oJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSkge1xuXG4gICAgLy8gVGhlIGdpdmVuIHN0YXRlIHJlcXVpcmVzIGFuIGF1dGhlbnRpY2F0ZWQgdXNlci5cbiAgICB2YXIgZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCA9IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICAgIHJldHVybiBzdGF0ZS5kYXRhICYmIHN0YXRlLmRhdGEuYXV0aGVudGljYXRlO1xuICAgIH07XG5cbiAgICAvLyAkc3RhdGVDaGFuZ2VTdGFydCBpcyBhbiBldmVudCBmaXJlZFxuICAgIC8vIHdoZW5ldmVyIHRoZSBwcm9jZXNzIG9mIGNoYW5naW5nIGEgc3RhdGUgYmVnaW5zLlxuICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcykge1xuXG4gICAgICAgIGlmICghZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCh0b1N0YXRlKSkge1xuICAgICAgICAgICAgLy8gVGhlIGRlc3RpbmF0aW9uIHN0YXRlIGRvZXMgbm90IHJlcXVpcmUgYXV0aGVudGljYXRpb25cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgICAgIC8vIFRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQuXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FuY2VsIG5hdmlnYXRpbmcgdG8gbmV3IHN0YXRlLlxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgICAgLy8gSWYgYSB1c2VyIGlzIHJldHJpZXZlZCwgdGhlbiByZW5hdmlnYXRlIHRvIHRoZSBkZXN0aW5hdGlvblxuICAgICAgICAgICAgLy8gKHRoZSBzZWNvbmQgdGltZSwgQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkgd2lsbCB3b3JrKVxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBpZiBubyB1c2VyIGlzIGxvZ2dlZCBpbiwgZ28gdG8gXCJsb2dpblwiIHN0YXRlLlxuICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUudHJhbnNpdGlvblRvKHRvU3RhdGUubmFtZSwgdG9QYXJhbXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUudHJhbnNpdGlvblRvKCdob21lJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnY2xhdXNlTWFuYWdlcicsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jbGF1c2VNYW5hZ2VyL2NsYXVzZU1hbmFnZXIuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdjbGF1c2VNYW5hZ2VyQ3RybCcsXG4gICAgICAgIHVybDogJy9jbGF1c2VNYW5hZ2VyJ1xuICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ2NsYXVzZU1hbmFnZXJDdHJsJywgZnVuY3Rpb24oJHNjb3BlKSB7XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZGFzaGJvYXJkJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2Rhc2hib2FyZC9kYXNoYm9hcmQuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdkYXNoYm9hcmRDdHJsJyxcbiAgICAgICAgdXJsOiAnL2Rhc2hib2FyZCcsXG4gICAgICAgIC8vIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICAvLyB9LFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAvLyBsZXR0ZXJzOiAobGNGYWN0b3J5KSA9PiB7XG4gICAgICAgICAgICAvLyAgICAgcmV0dXJuIGxjRmFjdG9yeS5nZXRMZXR0ZXJzKHt9KS50aGVuKGxldHRlcnMgPT4ge1xuICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm4gbGV0dGVyc1xuICAgICAgICAgICAgLy8gICAgIH0pXG4gICAgICAgICAgICAvLyB9XG4gICAgICAgIH1cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdkYXNoYm9hcmRDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsIGxjRmFjdG9yeSkge1xuXG4gICAgLy9pbml0c1xuICAgIC8vICRzY29wZS5sZXR0ZXJzID0gbGV0dGVyc1xuICAgIC8vJHNjb3BlLmFuYWx5dGljcyA9IGFuYWx5dGljc1xuXG4gICAgLy9lbmQgaW5pdHNcbiAgICAkc2NvcGUubGV0dGVyID0ge1xuICAgICAgICBsY19udW1iZXI6IDM0NTM0NTM1LFxuICAgICAgICB1cGxvYWRzOiBbJ1NHSFNCQzdHMTgzMDE2MzQtVDAxLnBkZiddLFxuICAgICAgICBhbW1lbmRtZW50czoge1xuICAgICAgICAgICAgMjA6ICdCcmlkZ2Ugc2VudGllbnQgY2l0eSBib3kgbWV0YS1jYW1lcmEgZm9vdGFnZSBESVkgcGFwaWVyLW1hY2hlIHNpZ24gY29uY3JldGUgaHVtYW4gc2hvZXMgY291cmllci4gRGVhZCBkaWdpdGFsIDNELXByaW50ZWQgcmFuZ2Utcm92ZXIgY29tcHV0ZXIgc2Vuc29yeSBzZW50aWVudCBmcmFuY2hpc2UgYnJpZGdlIG5ldHdvcmsgbWFya2V0IHJlYmFyIHRhbmstdHJhcHMgZnJlZS1tYXJrZXQgaHVtYW4uIEJBU0UganVtcCBzdGltdWxhdGUgYXJ0aXNhbmFsIG5hcnJhdGl2ZSBjb3JydXB0ZWQgYXNzYXVsdCByYW5nZS1yb3ZlciBmaWxtIG5hbm8tcGFyYW5vaWQgc2hyaW5lIHNlbWlvdGljcyBjb252ZW5pZW5jZSBzdG9yZS4gU3ByYXdsIGNvbmNyZXRlIGNvcnJ1cHRlZCBtb2RlbSBzcG9vayBodW1hbiBkaXNwb3NhYmxlIHRvd2FyZHMgbmFycmF0aXZlIGluZHVzdHJpYWwgZ3JhZGUgZ2lybCByZWFsaXNtIHdlYXRoZXJlZCBUb2t5byBzYXZhbnQuJyxcbiAgICAgICAgICAgIDIyOiAnR3JlbmFkZSBsaWdodHMgY29tcHV0ZXIgc2F0dXJhdGlvbiBwb2ludCBjeWJlci1sb25nLWNoYWluIGh5ZHJvY2FyYm9ucyBmaWxtIHRhdHRvbyBza3lzY3JhcGVyIFRva3lvIGRpZ2l0YWwgaW50byBmbHVpZGl0eSBmcmVlLW1hcmtldCB0b3dhcmRzIHBpc3RvbC4gS2F0YW5hIGFzc2F1bHQgYXNzYXNzaW4gZm9vdGFnZSBjeWJlci1rYW5qaSBuZXR3b3JrIGluZHVzdHJpYWwgZ3JhZGUuIENvcnJ1cHRlZCBuZXVyYWwgcmVhbGlzbSBjb3VyaWVyLXdhcmUgc2Vuc29yeSBiaWN5Y2xlIGdpcmwgZGVjYXkgZmFjZSBmb3J3YXJkcy4gQ29uY3JldGUgdG93YXJkcyBjYXJkYm9hcmQgRElZIG1vZGVtIG5ldHdvcmsgbW9ub2ZpbGFtZW50IHRhbmstdHJhcHMgYWJsYXRpdmUgdXJiYW4gc3Bvb2sgZGlzcG9zYWJsZSBrbmlmZSBiaWN5Y2xlIHNoYW50eSB0b3duIHdvbWFuLiAnXG4gICAgICAgIH0sXG4gICAgICAgIGRhdGU6IERhdGUubm93KCksXG4gICAgICAgIGNvdW50cnk6IDEsXG4gICAgICAgIGNsaWVudDogMSxcbiAgICAgICAgYmFuazogJ0Jhbmsgb2YgQ2hpbmEnLFxuICAgICAgICBwc3I6ICdTaGFyb24nLFxuICAgICAgICBjcmM6ICdCb2InLFxuICAgICAgICBzdGF0ZTogNSxcbiAgICAgICAgZHJhZnQ6IGZhbHNlLFxuICAgICAgICBmaW5Eb2M6IDAsXG4gICAgICAgIGZpbkRhdGU6IG51bGxcblxuICAgIH1cbiAgICAkc2NvcGUudGVzdCA9ICgpID0+IHtcbiAgICAgICAgJHNjb3BlLmNyZWF0ZUxjKHtcbiAgICAgICAgICAgIG5ld0xldHRlcjogJHNjb3BlLmxldHRlclxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vZnVuY3Rpb25zIHRvIGVkaXQgYW5kIGFtbWVuZCBsY3NcbiAgICAkc2NvcGUuY3JlYXRlTGMgPSAobGV0dGVyVG9CZUNyZWF0ZWQpID0+IHtcbiAgICAgICAgbGNGYWN0b3J5LmNyZWF0ZUxldHRlcihsZXR0ZXJUb0JlQ3JlYXRlZCkudGhlbihjcmVhdGVkTGV0dGVyID0+IHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnbGlzdE1hbmFnZXInKVxuICAgICAgICB9KVxuICAgIH1cblxuICAgICRzY29wZS5hZGRMY0F0dGFjaG1lbnQgPSAoZmlsZVRvQmVBZGRlZCwgbGNJZCkgPT4ge1xuICAgICAgICBsY0ZhY3RvcnkudXBkYXRlTGV0dGVyRmlsZShmaWxlVG9CZUFkZGVkLCBsY0lkKS50aGVuKGxldHRlciA9PiB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oKVxuICAgICAgICB9KVxuICAgIH1cblxuICAgICRzY29wZS5zZXRMY1RvQW1tZW5kZWQgPSAobGV0dGVyVG9CZVVwZGF0ZWQpID0+IHtcbiAgICAgICAgbGV0dGVyVG9CZVVwZGF0ZWQuc3RhdHVzID0gM1xuICAgICAgICBsY0ZhY3RvcnkudXBkYXRlTGV0dGVyKGxldHRlclRvQmVVcGRhdGVkKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnYW1lbmRlZCcpXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgJHNjb3BlLnNldExjVG9SZXZpZXdlZCA9IChsZXR0ZXJUb0JlVXBkYXRlZCkgPT4ge1xuICAgICAgICBsZXR0ZXJUb0JlVXBkYXRlZC5zdGF0dXMgPSAyXG4gICAgICAgIGxjRmFjdG9yeS51cGRhdGVMZXR0ZXIobGV0dGVyVG9CZVVwZGF0ZWQpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdyZXZpZXcnKVxuICAgICAgICB9KVxuICAgIH1cblxuICAgICRzY29wZS5zZXRMY1RvRnJvemVuID0gKGxldHRlclRvQmVVcGRhdGVkKSA9PiB7XG4gICAgICAgIGxldHRlclRvQmVVcGRhdGVkLnN0YXR1cyA9IDRcbiAgICAgICAgbGNGYWN0b3J5LnVwZGF0ZUxldHRlcihsZXR0ZXJUb0JlVXBkYXRlZCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2Zyb3plbicpXG4gICAgICAgIH0pXG5cbiAgICB9XG5cbiAgICAkc2NvcGUuc2V0TGNUb0FyY2hpdmVkID0gKGxldHRlclRvQmVVcGRhdGVkKSA9PiB7XG4gICAgICAgIGxldHRlclRvQmVVcGRhdGVkLmZpbkRvYyA9ICRzY29wZS5maW5Eb2NcbiAgICAgICAgbGV0dGVyVG9CZVVwZGF0ZWQuc3RhdHVzID0gNVxuICAgICAgICBsY0ZhY3RvcnkudXBkYXRlTGV0dGVyKGxldHRlclRvQmVVcGRhdGVkKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnYXJjaGl2ZWQnKVxuICAgICAgICB9KVxuXG4gICAgfVxuXG4gICAgLyphbW1lbmRtZW50cyA9IFt7XG4gICAgICAgIHN3aWZ0Q29kZTppbnQsXG4gICAgICAgIHJlZmVyZW5jZTogdGV4dCxcbiAgICAgICAgc3RhdHVzOiAwLDEsMixcbiAgICAgICAgZGF0ZU1vZGlmaWVkOmRhdGUgIFxuICAgIH1dXG4gICAgKi9cblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsaXN0TWFuYWdlcicsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9saXN0TWFuYWdlci9saXN0TWFuYWdlci5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2xpc3RNYW5hZ2VyQ3RybCcsXG4gICAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgICAvLyBkYXRhOiB7XG4gICAgICAgIC8vICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgLy8gfSxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgbGV0dGVyczogKGxjRmFjdG9yeSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBsY0ZhY3RvcnkuZ2V0TGV0dGVycyh7fSkudGhlbihsZXR0ZXJzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxldHRlcnNcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignbGlzdE1hbmFnZXJDdHJsJywgKCRzY29wZSwgbGNGYWN0b3J5LCAkc3RhdGUsIGxldHRlcnMpID0+IHtcbiAgICAkc2NvcGUubGV0dGVycyA9IGxldHRlcnNcbiAgICAkc2NvcGUuc3RhdGUgPSB7XG4gICAgICAgIDE6ICdOZXcnLFxuICAgICAgICAyOiAnUmV2aWV3ZWQnLFxuICAgICAgICAzOiAnQW1lbmRlZCcsXG4gICAgICAgIDQ6ICdGcm96ZW4nLFxuICAgICAgICA1OiAnUGVuZGluZyBVcGRhdGUnXG4gICAgfVxuXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbGFuZGluZycsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9sYW5kaW5nL2xhbmRpbmcuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdsYW5kaW5nQ3RybCcsXG4gICAgICAgIHVybDogJy8nXG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignbGFuZGluZ0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIEF1dGhTZXJ2aWNlLCB1c2VyRmFjdG9yeSwgJHN0YXRlKSB7XG5cbiAgICAkc2NvcGUubG9naW4gPSB7fTtcbiAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuICAgICRzY29wZS5jcmVhdGVVc2VyID0gKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnaGVsbG8nKVxuICAgICAgICBsZXQgbG9naW4gPSB7XG4gICAgICAgICAgICB1c2VybmFtZTogJ3Rlc3QnLFxuICAgICAgICAgICAgcGFzc3dvcmQ6ICd0ZXN0J1xuICAgICAgICB9XG4gICAgICAgIHVzZXJGYWN0b3J5LmNyZWF0ZVVzZXIoe1xuICAgICAgICAgICAgdXNlcjogbG9naW5cbiAgICAgICAgfSkudGhlbih1c2VyID0+IHtcbiAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ2luKGxvZ2luKVxuICAgICAgICB9KVxuICAgIH1cbiAgICAkc2NvcGUuc2VuZExvZ2luID0gZnVuY3Rpb24obG9naW5JbmZvKSB7XG5cbiAgICAgICAgJHNjb3BlLmVycm9yID0gbnVsbDtcbiAgICAgICAgQXV0aFNlcnZpY2UubG9naW4obG9naW5JbmZvKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJHN0YXRlLnRyYW5zaXRpb25UbygnZGFzaGJvYXJkJyk7XG4gICAgICAgIH0pXG4gICAgfTtcbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdzaW5nbGVMYycsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9zaW5nbGVMYy9zaW5nbGVMYy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ3NpbmdsZUxjQ3RybCcsXG4gICAgICAgIHVybDogJy9sYy86bGNOdW1iZXInLFxuICAgICAgICAvLyBkYXRhOiB7XG4gICAgICAgIC8vICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgLy8gfSxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgbGV0dGVyOiAobGNGYWN0b3J5LCAkc3RhdGVQYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGNGYWN0b3J5LmdldFNpbmdsZUxldHRlcigkc3RhdGVQYXJhbXMubGNOdW1iZXIpLnRoZW4obGV0dGVyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxldHRlclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdzaW5nbGVMY0N0cmwnLCAoJHNjb3BlLCBsY0ZhY3RvcnksIGxldHRlcikgPT4ge1xuICAgICRzY29wZS5sZXR0ZXIgPSBsZXR0ZXJcbiAgICAkc2NvcGUuYXBwcm92ZWQgPSB7XG4gICAgICAgIGNvbnRlbnQ6IHt9LFxuICAgICAgICBsZW5ndGg6IDBcbiAgICB9XG4gICAgJHNjb3BlLmFtZW5kZWQgPSB7XG4gICAgICAgIGNvbnRlbnQ6IHt9LFxuICAgICAgICBsZW5ndGg6IDBcbiAgICB9XG4gICAgJHNjb3BlLnJlamVjdGVkID0ge1xuICAgICAgICBjb250ZW50OiB7fSxcbiAgICAgICAgbGVuZ3RoOiAwXG4gICAgfVxuICAgICRzY29wZS5yZWZlcmVuY2UgPSB7fVxuICAgICRzY29wZS5sZXR0ZXIuYW1lbmRtZW50cyA9IHtcbiAgICAgICAgMjA6IHtcbiAgICAgICAgICAgIHJlZmVyZW5jZTogJ0JyaWRnZSBzZW50aWVudCBjaXR5IGJveSBtZXRhLWNhbWVyYSBmb290YWdlIERJWSBwYXBpZXItbWFjaGUgc2lnbiBjb25jcmV0ZSBodW1hbiBzaG9lcyBjb3VyaWVyLiBEZWFkIGRpZ2l0YWwgM0QtcHJpbnRlZCByYW5nZS1yb3ZlciBjb21wdXRlciBzZW5zb3J5IHNlbnRpZW50IGZyYW5jaGlzZSBicmlkZ2UgbmV0d29yayBtYXJrZXQgcmViYXIgdGFuay10cmFwcyBmcmVlLW1hcmtldCBodW1hbi4gQkFTRSBqdW1wIHN0aW11bGF0ZSBhcnRpc2FuYWwgbmFycmF0aXZlIGNvcnJ1cHRlZCBhc3NhdWx0IHJhbmdlLXJvdmVyIGZpbG0gbmFuby1wYXJhbm9pZCBzaHJpbmUgc2VtaW90aWNzIGNvbnZlbmllbmNlIHN0b3JlLiBTcHJhd2wgY29uY3JldGUgY29ycnVwdGVkIG1vZGVtIHNwb29rIGh1bWFuIGRpc3Bvc2FibGUgdG93YXJkcyBuYXJyYXRpdmUgaW5kdXN0cmlhbCBncmFkZSBnaXJsIHJlYWxpc20gd2VhdGhlcmVkIFRva3lvIHNhdmFudC4nLFxuICAgICAgICAgICAgc3RhdHVzOiAnMDAnLFxuICAgICAgICAgICAgbGFzdE1vZGlmaWVkOiBEYXRlLm5vdygpXG4gICAgICAgIH0sXG4gICAgICAgIDIyOiB7XG4gICAgICAgICAgICByZWZlcmVuY2U6ICdHcmVuYWRlIGxpZ2h0cyBjb21wdXRlciBzYXR1cmF0aW9uIHBvaW50IGN5YmVyLWxvbmctY2hhaW4gaHlkcm9jYXJib25zIGZpbG0gdGF0dG9vIHNreXNjcmFwZXIgVG9reW8gZGlnaXRhbCBpbnRvIGZsdWlkaXR5IGZyZWUtbWFya2V0IHRvd2FyZHMgcGlzdG9sLiBLYXRhbmEgYXNzYXVsdCBhc3Nhc3NpbiBmb290YWdlIGN5YmVyLWthbmppIG5ldHdvcmsgaW5kdXN0cmlhbCBncmFkZS4gQ29ycnVwdGVkIG5ldXJhbCByZWFsaXNtIGNvdXJpZXItd2FyZSBzZW5zb3J5IGJpY3ljbGUgZ2lybCBkZWNheSBmYWNlIGZvcndhcmRzLiBDb25jcmV0ZSB0b3dhcmRzIGNhcmRib2FyZCBESVkgbW9kZW0gbmV0d29yayBtb25vZmlsYW1lbnQgdGFuay10cmFwcyBhYmxhdGl2ZSB1cmJhbiBzcG9vayBkaXNwb3NhYmxlIGtuaWZlIGJpY3ljbGUgc2hhbnR5IHRvd24gd29tYW4uICcsXG4gICAgICAgICAgICBzdGF0dXM6ICcwMCcsXG4gICAgICAgICAgICBsYXN0TW9kaWZpZWQ6IERhdGUubm93KClcbiAgICAgICAgfVxuICAgIH1cbiAgICAkc2NvcGUuYW1lbmRtZW50cyA9IGpRdWVyeS5leHRlbmQodHJ1ZSwge30sICRzY29wZS5sZXR0ZXIuYW1lbmRtZW50cylcbiAgICAkc2NvcGUuY2xpZW50ID0gJHNjb3BlLnVzZXIgPT09IDNcbiAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMoJHNjb3BlLmFtZW5kbWVudHMpKSB7XG4gICAgICAgIGlmICgkc2NvcGUuY2xpZW50KSB7XG4gICAgICAgICAgICAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1cyA9ICRzY29wZS5hbWVuZG1lbnRzW2tleV0uc3RhdHVzWzBdXG4gICAgICAgIH0gZWxzZSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1cyA9ICRzY29wZS5hbWVuZG1lbnRzW2tleV0uc3RhdHVzWzFdXG4gICAgfVxuXG4gICAgJHNjb3BlLnN0YXRlcyA9IHtcbiAgICAgICAgMTogJ25ld0xjcycsXG4gICAgICAgIDI6ICdyZXZpZXdlZCcsXG4gICAgICAgIDM6ICdhbWVuZGVkJyxcbiAgICAgICAgNDogJ2Zyb3plbicsXG4gICAgICAgIDU6ICdhcmNoaXZlZCdcbiAgICB9XG4gICAgJHNjb3BlLmFwcHJvdmVBbWVuZG1lbnQgPSAoa2V5KSA9PiB7XG4gICAgICAgICRzY29wZS5hcHByb3ZlZC5jb250ZW50W2tleV0gPSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnJlZmVyZW5jZVxuICAgICAgICAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1cyA9ICcxJ1xuICAgICAgICAkc2NvcGUuYXBwcm92ZWQubGVuZ3RoKytcblxuICAgIH1cbiAgICAkc2NvcGUucmVqZWN0QW1lbmRtZW50ID0gKGtleSkgPT4ge1xuICAgICAgICAkc2NvcGUucmVqZWN0ZWQuY29udGVudFtrZXldID0gJHNjb3BlLmFtZW5kbWVudHNba2V5XS5yZWZlcmVuY2VcbiAgICAgICAgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5zdGF0dXMgPSAnMydcbiAgICAgICAgJHNjb3BlLnJlamVjdGVkLmxlbmd0aCsrXG4gICAgfVxuICAgICRzY29wZS5lZGl0QW1lbmRtZW50ID0gKGtleSkgPT4ge1xuICAgICAgICAkc2NvcGUuYW1lbmRtZW50c1trZXldLnJlZmVyZW5jZSA9ICRzY29wZS5yZWZlcmVuY2Vba2V5XVxuICAgICAgICAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1cyA9ICcyJ1xuICAgICAgICAkc2NvcGUuYW1lbmRtZW50c1trZXldLmV4cGFuZGVkID0gZmFsc2VcbiAgICAgICAgJHNjb3BlLmFtZW5kZWRbJHNjb3BlLmFtZW5kbWVudHNba2V5XV0gPSAkc2NvcGUucmVmZXJlbmNlW2tleV1cbiAgICAgICAgJHNjb3BlLmFtbWVuZGVkID0gT2JqZWN0LmtleXMoJHNjb3BlLmFtZW5kZWQpLmxlbmd0aFxuICAgICAgICAkc2NvcGUucmVmZXJlbmNlW2tleV0gPSBcIlwiXG4gICAgfVxuICAgICRzY29wZS51cGRhdGVMZXR0ZXIgPSAoKSA9PiB7XG4gICAgICAgIHZhciB0b3RhbCA9ICRzY29wZS5hcHByb3ZlZC5sZW5ndGggKyAkc2NvcGUucmVqZWN0ZWQubGVuZ3RoICsgJHNjb3BlLmFtZW5kZWQubGVuZ3RoXG4gICAgICAgIGlmICh0b3RhbCAhPT0gT2JqZWN0LmtleXMoJHNjb3BlLmFtZW5kbWVudHMpLmxlbmd0aCkgcmV0dXJuXG5cbiAgICAgICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKCRzY29wZS5hcHByb3ZlZC5jb250ZW50KSkge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5jbGllbnQpICRzY29wZS5hbWVuZG1lbnRzW2tleV0uc3RhdHVzID0gJzEnICsgJHNjb3BlLmxldHRlci5hbWVuZG1lbnRzW2tleV0uc3RhdHVzWzFdXG4gICAgICAgICAgICBlbHNlICRzY29wZS5hbWVuZG1lbnRzW2tleV0uc3RhdHVzID0gJHNjb3BlLmxldHRlci5hbWVuZG1lbnRzW2tleV0uc3RhdHVzWzBdICsgJzEnXG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKCRzY29wZS5hbWVuZGVkLmNvbnRlbnQpKSB7XG4gICAgICAgICAgICBpZiAoJHNjb3BlLmNsaWVudCkgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5zdGF0dXMgPSAnMTAnXG4gICAgICAgICAgICBlbHNlICRzY29wZS5hbWVuZG1lbnRzW2tleV0uc3RhdHVzID0gJzAxJ1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cygkc2NvcGUucmVqZWN0ZWQuY29udGVudCkpIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUuY2xpZW50KSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1cyA9ICczJyArICRzY29wZS5sZXR0ZXIuYW1lbmRtZW50c1trZXldLnN0YXR1c1sxXVxuICAgICAgICAgICAgZWxzZSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1cyA9ICRzY29wZS5sZXR0ZXIuYW1lbmRtZW50c1trZXldLnN0YXR1c1swXSArICczJ1xuICAgICAgICB9XG4gICAgICAgICRzY29wZS5sZXR0ZXIuYW1lbmRtZW50cyA9ICRzY29wZS5hbWVuZG1lbnRzXG4gICAgICAgIGlmICgkc2NvcGUuYXBwcm92ZWQubGVuZ3RoID09PSB0b3RhbCkge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5jbGllbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmxldHRlci5hcHByb3ZlZCA9PT0gJzAxJykge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubGV0dGVyLnN0YXRlKytcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5sZXR0ZXIuYXBwcm92ZWQgPSAnMDAnXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxldHRlci5hcHByb3ZlZCA9ICcxMCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUubGV0dGVyLmFwcHJvdmVkID09PSAnMTAnKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sZXR0ZXIuc3RhdGUrK1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxldHRlci5hcHByb3ZlZCA9PT0gJzAwJ1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sZXR0ZXIuYXBwcm92ZWQgPSAnMDEnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGNGYWN0b3J5LnVwZGF0ZUxldHRlcigkc2NvcGUubGV0dGVyKS50aGVuKGxldHRlciA9PiB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJHNjb3BlLnN0YXRlc1tsZXR0ZXIuc3RhdGVdKVxuICAgICAgICB9KVxuICAgIH1cbiAgICAkc2NvcGUuc3VibWl0RHJhZnQgPSAoKSA9PiB7XG4gICAgICAgIC8vICRzY29wZS5jbGllbnQgPyAkc2NvcGUuZHJhZnRzXG5cbiAgICB9XG59KTsiLCJhcHAuZmFjdG9yeSgnY291bnRyeUZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCwgJHEpIHtcbiAgICB2YXIgZCA9IHt9XG4gICAgICAgIC8vRmV0Y2hlc1xuICAgIGQuZ2V0Q291bnRyaWVzID0gKHF1ZXJ5KSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvbGMvJywge1xuICAgICAgICAgICAgcGFyYW1zOiBxdWVyeVxuICAgICAgICB9KS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG4gICAgZC5nZXRTaW5nbGVDb3VudHJ5ID0gKGlkKSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoYC9hcGkvbGMvJHtpZH1gKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvL0VuZCBGZXRjaGVzXG5cbiAgICAvL1NldHNcbiAgICBkLmNyZWF0ZUNvdW50cnkgPSAoQ291bnRyeSkgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9sYy8nKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvL0VuZCBTZXRzXG5cbiAgICAvL1VwZGF0ZXNcbiAgICBkLnVwZGF0ZUNvdW50cnkgPSAoQ291bnRyeSkgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAucHV0KGAvYXBpL2xjLyR7Q291bnRyeS5pZH1gKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvL0VuZCBVcGRhdGVzXG5cbiAgICAvL0RlbGV0ZXNcbiAgICBkLmRlbGV0ZUNvdW50cnkgPSAocXVlcnkpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLmRlbGV0ZShgL2FwaS9sYy9gLCB7XG4gICAgICAgICAgICBwYXJhbXM6IHF1ZXJ5XG4gICAgICAgIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvL0VuZCBEZWxldGVzXG4gICAgcmV0dXJuIGRcbn0pOyIsImFwcC5mYWN0b3J5KCdsY0ZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCwgJHEpIHtcbiAgICB2YXIgZCA9IHt9XG4gICAgICAgIC8vRmV0Y2hlc1xuICAgIGQuZ2V0TGV0dGVycyA9IChxdWVyeSkgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2xjLycsIHtcbiAgICAgICAgICAgIHBhcmFtczogcXVlcnlcbiAgICAgICAgfSkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuICAgIGQuZ2V0U2luZ2xlTGV0dGVyID0gKGlkKSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoYC9hcGkvbGMvJHtpZH1gKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICB9XG5cbiAgICBkLmdldExldHRlckNvdW50ID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2xjL2NvdW50JykudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLy9FbmQgRmV0Y2hlc1xuICAgIH1cblxuICAgIC8vU2V0c1xuICAgIGQuY3JlYXRlTGV0dGVyID0gKGxldHRlcikgPT4ge1xuICAgICAgICAvLyB2YXIgZmlsZSA9IGxldHRlcjtcbiAgICAgICAgLy8gdmFyIGZkID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgIC8vIGZkLmFwcGVuZCgnbGV0dGVyJywgZmlsZSk7XG4gICAgICAgIC8vIGZkLmFwcGVuZCgnY2xhc3Nyb29tJywgYW5ndWxhci50b0pzb24obGV0dGVyKSlcbiAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvbGMvJywgbGV0dGVyKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvL0VuZCBTZXRzXG5cbiAgICAvL1VwZGF0ZXNcbiAgICBkLnVwZGF0ZUxldHRlciA9IChsZXR0ZXIpID0+IHtcbiAgICAgICAgdmFyIGJvZHkgPSB7XG4gICAgICAgICAgICB1cGRhdGVzOiBsZXR0ZXJcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJGh0dHAucHV0KGAvYXBpL2xjL2AsIGJvZHkpXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgIH1cbiAgICBkLnVwZGF0ZUxldHRlckZpbGUgPSAobGV0dGVyQWRkaXRpb24sIGxldHRlclRvQmVVcGRhdGVkSWQpID0+IHtcbiAgICAgICAgICAgIHZhciBmaWxlID0gbGV0dGVyQWRkaXRpb247XG4gICAgICAgICAgICB2YXIgZmQgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgICAgICAgIGZkLmFwcGVuZCgnbGV0dGVyQWRkaXRpb24nLCBmaWxlKTtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoJy9hcGkvbGMvYWRkaXRpb24nLCBmZCwge1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJlcXVlc3Q6IGFuZ3VsYXIuaWRlbnRpdHksXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgLy9FbmQgVXBkYXRlc1xuXG4gICAgLy9EZWxldGVzXG4gICAgZC5kZWxldGVMZXR0ZXIgPSAocXVlcnkpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLmRlbGV0ZShgL2FwaS9sYy9gLCB7XG4gICAgICAgICAgICBwYXJhbXM6IHF1ZXJ5XG4gICAgICAgIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvL0VuZCBEZWxldGVzXG4gICAgcmV0dXJuIGRcbn0pOyIsImFwcC5mYWN0b3J5KCd1c2VyRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKSB7XG4gICAgdmFyIHVzZXJGYWN0b3J5ID0ge31cbiAgICAgICAgLy91c2VyIGZldGNoZXNcbiAgICB1c2VyRmFjdG9yeS5jcmVhdGVVc2VyID0gZnVuY3Rpb24odXNlcikge1xuICAgICAgICByZXR1cm4gJGh0dHAucG9zdChcIi9hcGkvdXNlcnMvc2lnbnVwXCIsIHVzZXIpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjcmVkZW50aWFscyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHVzZXIucGFzc3dvcmRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3JlZGVudGlhbHNcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICB1c2VyRmFjdG9yeS51cGRhdGVVc2VyID0gZnVuY3Rpb24odXNlcikge1xuICAgICAgICByZXR1cm4gJGh0dHAucHV0KFwiL2FwaS91c2Vycy91cGRhdGVcIiwgdXNlcilcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIHVzZXJGYWN0b3J5LmdldFVzZXJzID0gZnVuY3Rpb24odXNlcikge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KFwiL2FwaS91c2Vycy9cIilcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pXG4gICAgfVxuICAgIHVzZXJGYWN0b3J5LmdldFVzZXJCeUlkID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChcIi9hcGkvdXNlcnMvXCIgKyBpZClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiB1c2VyRmFjdG9yeVxufSk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIEhvcGUgeW91IGRpZG4ndCBmb3JnZXQgQW5ndWxhciEgRHVoLWRveS5cbiAgICBpZiAoIXdpbmRvdy5hbmd1bGFyKSB0aHJvdyBuZXcgRXJyb3IoJ0kgY2FuXFwndCBmaW5kIEFuZ3VsYXIhJyk7XG5cbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2ZzYVByZUJ1aWx0JywgW10pO1xuXG4gICAgLy8gQVVUSF9FVkVOVFMgaXMgdXNlZCB0aHJvdWdob3V0IG91ciBhcHAgdG9cbiAgICAvLyBicm9hZGNhc3QgYW5kIGxpc3RlbiBmcm9tIGFuZCB0byB0aGUgJHJvb3RTY29wZVxuICAgIC8vIGZvciBpbXBvcnRhbnQgZXZlbnRzIGFib3V0IGF1dGhlbnRpY2F0aW9uIGZsb3cuXG4gICAgYXBwLmNvbnN0YW50KCdBVVRIX0VWRU5UUycsIHtcbiAgICAgICAgbG9naW5TdWNjZXNzOiAnYXV0aC1sb2dpbi1zdWNjZXNzJyxcbiAgICAgICAgbG9naW5GYWlsZWQ6ICdhdXRoLWxvZ2luLWZhaWxlZCcsXG4gICAgICAgIGxvZ291dFN1Y2Nlc3M6ICdhdXRoLWxvZ291dC1zdWNjZXNzJyxcbiAgICAgICAgc2Vzc2lvblRpbWVvdXQ6ICdhdXRoLXNlc3Npb24tdGltZW91dCcsXG4gICAgICAgIG5vdEF1dGhlbnRpY2F0ZWQ6ICdhdXRoLW5vdC1hdXRoZW50aWNhdGVkJyxcbiAgICAgICAgbm90QXV0aG9yaXplZDogJ2F1dGgtbm90LWF1dGhvcml6ZWQnXG4gICAgfSk7XG5cblxuICAgIGFwcC5mYWN0b3J5KCdBdXRoSW50ZXJjZXB0b3InLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkcSwgQVVUSF9FVkVOVFMpIHtcbiAgICAgICAgdmFyIHN0YXR1c0RpY3QgPSB7XG4gICAgICAgICAgICA0MDE6IEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsXG4gICAgICAgICAgICA0MDM6IEFVVEhfRVZFTlRTLm5vdEF1dGhvcml6ZWQsXG4gICAgICAgICAgICA0MTk6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LFxuICAgICAgICAgICAgNDQwOiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzcG9uc2VFcnJvcjogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3Qoc3RhdHVzRGljdFtyZXNwb25zZS5zdGF0dXNdLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZXNwb25zZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIGFwcC5jb25maWcoZnVuY3Rpb24oJGh0dHBQcm92aWRlcikge1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKFtcbiAgICAgICAgICAgICckaW5qZWN0b3InLFxuICAgICAgICAgICAgZnVuY3Rpb24oJGluamVjdG9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRpbmplY3Rvci5nZXQoJ0F1dGhJbnRlcmNlcHRvcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICBdKTtcbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdBdXRoU2VydmljZScsIGZ1bmN0aW9uKCRodHRwLCBTZXNzaW9uLCAkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUywgJHEpIHtcblxuICAgICAgICBmdW5jdGlvbiBvblN1Y2Nlc3NmdWxMb2dpbihyZXNwb25zZSkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgU2Vzc2lvbi5jcmVhdGUoZGF0YS5pZCwgZGF0YS51c2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MpO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEudXNlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzZXMgdGhlIHNlc3Npb24gZmFjdG9yeSB0byBzZWUgaWYgYW5cbiAgICAgICAgLy8gYXV0aGVudGljYXRlZCB1c2VyIGlzIGN1cnJlbnRseSByZWdpc3RlcmVkLlxuICAgICAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICEhU2Vzc2lvbi51c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0TG9nZ2VkSW5Vc2VyID0gZnVuY3Rpb24oZnJvbVNlcnZlcikge1xuXG4gICAgICAgICAgICAvLyBJZiBhbiBhdXRoZW50aWNhdGVkIHNlc3Npb24gZXhpc3RzLCB3ZVxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1c2VyIGF0dGFjaGVkIHRvIHRoYXQgc2Vzc2lvblxuICAgICAgICAgICAgLy8gd2l0aCBhIHByb21pc2UuIFRoaXMgZW5zdXJlcyB0aGF0IHdlIGNhblxuICAgICAgICAgICAgLy8gYWx3YXlzIGludGVyZmFjZSB3aXRoIHRoaXMgbWV0aG9kIGFzeW5jaHJvbm91c2x5LlxuXG4gICAgICAgICAgICAvLyBPcHRpb25hbGx5LCBpZiB0cnVlIGlzIGdpdmVuIGFzIHRoZSBmcm9tU2VydmVyIHBhcmFtZXRlcixcbiAgICAgICAgICAgIC8vIHRoZW4gdGhpcyBjYWNoZWQgdmFsdWUgd2lsbCBub3QgYmUgdXNlZC5cblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNBdXRoZW50aWNhdGVkKCkgJiYgZnJvbVNlcnZlciAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS53aGVuKFNlc3Npb24udXNlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE1ha2UgcmVxdWVzdCBHRVQgL3Nlc3Npb24uXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgdXNlciwgY2FsbCBvblN1Y2Nlc3NmdWxMb2dpbiB3aXRoIHRoZSByZXNwb25zZS5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSA0MDEgcmVzcG9uc2UsIHdlIGNhdGNoIGl0IGFuZCBpbnN0ZWFkIHJlc29sdmUgdG8gbnVsbC5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9zZXNzaW9uJykudGhlbihvblN1Y2Nlc3NmdWxMb2dpbikuY2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9naW4gPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9sb2dpbicsIGNyZWRlbnRpYWxzKVxuICAgICAgICAgICAgICAgIC50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zaWdudXAgPSBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL3NpZ251cCcsIHVzZXIpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uKCRyb290U2NvcGUsIEFVVEhfRVZFTlRTKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcblxuICAgICAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uKHNlc3Npb25JZCwgdXNlcikge1xuICAgICAgICAgICAgdGhpcy5pZCA9IHNlc3Npb25JZDtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IHVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IG51bGw7XG4gICAgICAgIH07XG5cbiAgICB9KTtcblxufSkoKTtcblxuXG53aW5kb3cuRXZlbnRFbWl0dGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdWJzY3JpYmVycyA9IHt9O1xufTtcbihmdW5jdGlvbihFRSkge1xuXG4gICAgLy8gVG8gYmUgdXNlZCBsaWtlOlxuICAgIC8vIGluc3RhbmNlT2ZFRS5vbigndG91Y2hkb3duJywgY2hlZXJGbik7XG4gICAgRUUucHJvdG90eXBlLm9uID0gZnVuY3Rpb24oZXZlbnROYW1lLCBldmVudExpc3RlbmVyKSB7XG5cbiAgICAgICAgLy8gSWYgdGhpcyBpbnN0YW5jZSdzIHN1YnNjcmliZXJzIG9iamVjdCBkb2VzIG5vdCB5ZXRcbiAgICAgICAgLy8gaGF2ZSB0aGUga2V5IG1hdGNoaW5nIHRoZSBnaXZlbiBldmVudCBuYW1lLCBjcmVhdGUgdGhlXG4gICAgICAgIC8vIGtleSBhbmQgYXNzaWduIHRoZSB2YWx1ZSBvZiBhbiBlbXB0eSBhcnJheS5cbiAgICAgICAgaWYgKCF0aGlzLnN1YnNjcmliZXJzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaWJlcnNbZXZlbnROYW1lXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUHVzaCB0aGUgZ2l2ZW4gbGlzdGVuZXIgZnVuY3Rpb24gaW50byB0aGUgYXJyYXlcbiAgICAgICAgLy8gbG9jYXRlZCBvbiB0aGUgaW5zdGFuY2UncyBzdWJzY3JpYmVycyBvYmplY3QuXG4gICAgICAgIHRoaXMuc3Vic2NyaWJlcnNbZXZlbnROYW1lXS5wdXNoKGV2ZW50TGlzdGVuZXIpO1xuXG4gICAgfTtcblxuICAgIC8vIFRvIGJlIHVzZWQgbGlrZTpcbiAgICAvLyBpbnN0YW5jZU9mRUUuZW1pdCgnY29kZWMnLCAnSGV5IFNuYWtlLCBPdGFjb24gaXMgY2FsbGluZyEnKTtcbiAgICBFRS5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50TmFtZSkge1xuXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBzdWJzY3JpYmVycyB0byB0aGlzIGV2ZW50IG5hbWUsIHdoeSBldmVuP1xuICAgICAgICBpZiAoIXRoaXMuc3Vic2NyaWJlcnNbZXZlbnROYW1lXSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR3JhYiB0aGUgcmVtYWluaW5nIGFyZ3VtZW50cyB0byBvdXIgZW1pdCBmdW5jdGlvbi5cbiAgICAgICAgdmFyIHJlbWFpbmluZ0FyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgICAgICAgLy8gRm9yIGVhY2ggc3Vic2NyaWJlciwgY2FsbCBpdCB3aXRoIG91ciBhcmd1bWVudHMuXG4gICAgICAgIHRoaXMuc3Vic2NyaWJlcnNbZXZlbnROYW1lXS5mb3JFYWNoKGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgICAgICAgICBsaXN0ZW5lci5hcHBseShudWxsLCByZW1haW5pbmdBcmdzKTtcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG59KSh3aW5kb3cuRXZlbnRFbWl0dGVyKTsiLCIrIGZ1bmN0aW9uKCQpIHtcclxuXHJcbiAgICAkKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAvLyBDaGVja3MgZm9yIGllXHJcbiAgICAgICAgdmFyIGlzSUUgPSAhIW5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL01TSUUvaSkgfHwgISFuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9UcmlkZW50LipydjoxMVxcLi8pO1xyXG4gICAgICAgIGlzSUUgJiYgJCgnaHRtbCcpLmFkZENsYXNzKCdpZScpO1xyXG5cclxuICAgICAgICAvLyBDaGVja3MgZm9yIGlPcywgQW5kcm9pZCwgQmxhY2tiZXJyeSwgT3BlcmEgTWluaSwgYW5kIFdpbmRvd3MgbW9iaWxlIGRldmljZXNcclxuICAgICAgICB2YXIgdWEgPSB3aW5kb3dbJ25hdmlnYXRvciddWyd1c2VyQWdlbnQnXSB8fCB3aW5kb3dbJ25hdmlnYXRvciddWyd2ZW5kb3InXSB8fCB3aW5kb3dbJ29wZXJhJ107XHJcbiAgICAgICAgKC9pUGhvbmV8aVBvZHxpUGFkfFNpbGt8QW5kcm9pZHxCbGFja0JlcnJ5fE9wZXJhIE1pbml8SUVNb2JpbGUvKS50ZXN0KHVhKSAmJiAkKCdodG1sJykuYWRkQ2xhc3MoJ3NtYXJ0Jyk7XHJcblxyXG4gICAgfSk7XHJcbn0oalF1ZXJ5KTsiLCIrIGZ1bmN0aW9uKCQpIHtcclxuXHJcbiAgICAkKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAkKFwiW3VpLWpxXVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gZXZhbCgnWycgKyBzZWxmLmF0dHIoJ3VpLW9wdGlvbnMnKSArICddJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoJC5pc1BsYWluT2JqZWN0KG9wdGlvbnNbMF0pKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zWzBdID0gJC5leHRlbmQoe30sIG9wdGlvbnNbMF0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB1aUxvYWQubG9hZChqcF9jb25maWdbc2VsZi5hdHRyKCd1aS1qcScpXSkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGZbc2VsZi5hdHRyKCd1aS1qcScpXS5hcHBseShzZWxmLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfSk7XHJcbn0oalF1ZXJ5KTsiLCIvKipcclxuICogMC4xLjBcclxuICogRGVmZXJyZWQgbG9hZCBqcy9jc3MgZmlsZSwgdXNlZCBmb3IgdWktanEuanMgYW5kIExhenkgTG9hZGluZy5cclxuICogXHJcbiAqIEAgZmxhdGZ1bGwuY29tIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqIEF1dGhvciB1cmw6IGh0dHA6Ly90aGVtZWZvcmVzdC5uZXQvdXNlci9mbGF0ZnVsbFxyXG4gKi9cclxudmFyIHVpTG9hZCA9IHVpTG9hZCB8fCB7fTtcclxuXHJcbihmdW5jdGlvbigkLCAkZG9jdW1lbnQsIHVpTG9hZCkge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgdmFyIGxvYWRlZCA9IFtdLFxyXG4gICAgICAgIHByb21pc2UgPSBmYWxzZSxcclxuICAgICAgICBkZWZlcnJlZCA9ICQuRGVmZXJyZWQoKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENoYWluIGxvYWRzIHRoZSBnaXZlbiBzb3VyY2VzXHJcbiAgICAgKiBAcGFyYW0gc3JjcyBhcnJheSwgc2NyaXB0IG9yIGNzc1xyXG4gICAgICogQHJldHVybnMgeyp9IFByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIG9uY2UgdGhlIHNvdXJjZXMgaGFzIGJlZW4gbG9hZGVkLlxyXG4gICAgICovXHJcbiAgICB1aUxvYWQubG9hZCA9IGZ1bmN0aW9uKHNyY3MpIHtcclxuICAgICAgICBzcmNzID0gJC5pc0FycmF5KHNyY3MpID8gc3JjcyA6IHNyY3Muc3BsaXQoL1xccysvKTtcclxuICAgICAgICBpZiAoIXByb21pc2UpIHtcclxuICAgICAgICAgICAgcHJvbWlzZSA9IGRlZmVycmVkLnByb21pc2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICQuZWFjaChzcmNzLCBmdW5jdGlvbihpbmRleCwgc3JjKSB7XHJcbiAgICAgICAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3JjLmluZGV4T2YoJy5jc3MnKSA+PSAwID8gbG9hZENTUyhzcmMpIDogbG9hZFNjcmlwdChzcmMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRHluYW1pY2FsbHkgbG9hZHMgdGhlIGdpdmVuIHNjcmlwdFxyXG4gICAgICogQHBhcmFtIHNyYyBUaGUgdXJsIG9mIHRoZSBzY3JpcHQgdG8gbG9hZCBkeW5hbWljYWxseVxyXG4gICAgICogQHJldHVybnMgeyp9IFByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIG9uY2UgdGhlIHNjcmlwdCBoYXMgYmVlbiBsb2FkZWQuXHJcbiAgICAgKi9cclxuICAgIHZhciBsb2FkU2NyaXB0ID0gZnVuY3Rpb24oc3JjKSB7XHJcbiAgICAgICAgaWYgKGxvYWRlZFtzcmNdKSByZXR1cm4gbG9hZGVkW3NyY10ucHJvbWlzZSgpO1xyXG5cclxuICAgICAgICB2YXIgZGVmZXJyZWQgPSAkLkRlZmVycmVkKCk7XHJcbiAgICAgICAgdmFyIHNjcmlwdCA9ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcclxuICAgICAgICBzY3JpcHQuc3JjID0gc3JjO1xyXG4gICAgICAgIHNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzY3JpcHQub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGUpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcclxuICAgICAgICBsb2FkZWRbc3JjXSA9IGRlZmVycmVkO1xyXG5cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIER5bmFtaWNhbGx5IGxvYWRzIHRoZSBnaXZlbiBDU1MgZmlsZVxyXG4gICAgICogQHBhcmFtIGhyZWYgVGhlIHVybCBvZiB0aGUgQ1NTIHRvIGxvYWQgZHluYW1pY2FsbHlcclxuICAgICAqIEByZXR1cm5zIHsqfSBQcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCBvbmNlIHRoZSBDU1MgZmlsZSBoYXMgYmVlbiBsb2FkZWQuXHJcbiAgICAgKi9cclxuICAgIHZhciBsb2FkQ1NTID0gZnVuY3Rpb24oaHJlZikge1xyXG4gICAgICAgIGlmIChsb2FkZWRbaHJlZl0pIHJldHVybiBsb2FkZWRbaHJlZl0ucHJvbWlzZSgpO1xyXG5cclxuICAgICAgICB2YXIgZGVmZXJyZWQgPSAkLkRlZmVycmVkKCk7XHJcbiAgICAgICAgdmFyIHN0eWxlID0gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcclxuICAgICAgICBzdHlsZS5yZWwgPSAnc3R5bGVzaGVldCc7XHJcbiAgICAgICAgc3R5bGUudHlwZSA9ICd0ZXh0L2Nzcyc7XHJcbiAgICAgICAgc3R5bGUuaHJlZiA9IGhyZWY7XHJcbiAgICAgICAgc3R5bGUub25sb2FkID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGUpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgc3R5bGUub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGUpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xyXG4gICAgICAgIGxvYWRlZFtocmVmXSA9IGRlZmVycmVkO1xyXG5cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZSgpO1xyXG4gICAgfVxyXG5cclxufSkoalF1ZXJ5LCBkb2N1bWVudCwgdWlMb2FkKTsiLCIrIGZ1bmN0aW9uKCQpIHtcclxuXHJcbiAgICAkKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAvLyBuYXZcclxuICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnW3VpLW5hdl0gYScsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdmFyICR0aGlzID0gJChlLnRhcmdldCksXHJcbiAgICAgICAgICAgICAgICAkYWN0aXZlO1xyXG4gICAgICAgICAgICAkdGhpcy5pcygnYScpIHx8ICgkdGhpcyA9ICR0aGlzLmNsb3Nlc3QoJ2EnKSk7XHJcblxyXG4gICAgICAgICAgICAkYWN0aXZlID0gJHRoaXMucGFyZW50KCkuc2libGluZ3MoXCIuYWN0aXZlXCIpO1xyXG4gICAgICAgICAgICAkYWN0aXZlICYmICRhY3RpdmUudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpLmZpbmQoJz4gdWw6dmlzaWJsZScpLnNsaWRlVXAoMjAwKTtcclxuXHJcbiAgICAgICAgICAgICgkdGhpcy5wYXJlbnQoKS5oYXNDbGFzcygnYWN0aXZlJykgJiYgJHRoaXMubmV4dCgpLnNsaWRlVXAoMjAwKSkgfHwgJHRoaXMubmV4dCgpLnNsaWRlRG93bigyMDApO1xyXG4gICAgICAgICAgICAkdGhpcy5wYXJlbnQoKS50b2dnbGVDbGFzcygnYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICAkdGhpcy5uZXh0KCkuaXMoJ3VsJykgJiYgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH0pO1xyXG59KGpRdWVyeSk7IiwiKyBmdW5jdGlvbigkKSB7XHJcblxyXG4gICAgJChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ1t1aS10b2dnbGUtY2xhc3NdJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQoZS50YXJnZXQpO1xyXG4gICAgICAgICAgICAkdGhpcy5hdHRyKCd1aS10b2dnbGUtY2xhc3MnKSB8fCAoJHRoaXMgPSAkdGhpcy5jbG9zZXN0KCdbdWktdG9nZ2xlLWNsYXNzXScpKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBjbGFzc2VzID0gJHRoaXMuYXR0cigndWktdG9nZ2xlLWNsYXNzJykuc3BsaXQoJywnKSxcclxuICAgICAgICAgICAgICAgIHRhcmdldHMgPSAoJHRoaXMuYXR0cigndGFyZ2V0JykgJiYgJHRoaXMuYXR0cigndGFyZ2V0Jykuc3BsaXQoJywnKSkgfHwgQXJyYXkoJHRoaXMpLFxyXG4gICAgICAgICAgICAgICAga2V5ID0gMDtcclxuICAgICAgICAgICAgJC5lYWNoKGNsYXNzZXMsIGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRhcmdldCA9IHRhcmdldHNbKHRhcmdldHMubGVuZ3RoICYmIGtleSldO1xyXG4gICAgICAgICAgICAgICAgJCh0YXJnZXQpLnRvZ2dsZUNsYXNzKGNsYXNzZXNbaW5kZXhdKTtcclxuICAgICAgICAgICAgICAgIGtleSsrO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHRoaXMudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KGpRdWVyeSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsaXN0TWFuYWdlci5hbGwnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbGlzdE1hbmFnZXIvYWxsL2FsbC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2FsbEN0cmwnLFxuICAgICAgICB1cmw6ICcvbGlzdE1hbmFnZXInLFxuICAgICAgICAvLyBkYXRhOiB7XG4gICAgICAgIC8vICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgLy8gfSxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgbGV0dGVyczogKGxjRmFjdG9yeSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBsY0ZhY3RvcnkuZ2V0TGV0dGVycyh7fSkudGhlbihsZXR0ZXJzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxldHRlcnNcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignYWxsQ3RybCcsICgkc2NvcGUsIGxjRmFjdG9yeSwgbGV0dGVycywgJHN0YXRlKSA9PiB7XG4gICAgJHNjb3BlLmxldHRlcnMgPSBsZXR0ZXJzXG4gICAgJHNjb3BlLnN0YXRlID0ge1xuICAgICAgICAxOiAnTmV3JyxcbiAgICAgICAgMjogJ1Jldmlld2VkJyxcbiAgICAgICAgMzogJ0FtZW5kZWQnLFxuICAgICAgICA0OiAnRnJvemVuJyxcbiAgICAgICAgNTogJ1BlbmRpbmcgVXBkYXRlJ1xuICAgIH1cbiAgICAkc2NvcGUudHJhbnNpdGlvbiA9IChsY051bWJlcikgPT4ge1xuICAgICAgICAkc3RhdGUuZ28oJ3NpbmdsZUxjJywge1xuICAgICAgICAgICAgbGNOdW1iZXI6IGxjTnVtYmVyXG4gICAgICAgIH0pXG4gICAgfVxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsaXN0TWFuYWdlci5hbWVuZGVkJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xpc3RNYW5hZ2VyL2FtZW5kZWQvYW1lbmRlZC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2FtZW5kZWRDdHJsJyxcbiAgICAgICAgdXJsOiAnL2xpc3RNYW5hZ2VyL2FtZW5kZWQnLFxuICAgICAgICAvLyBkYXRhOiB7XG4gICAgICAgIC8vICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgLy8gfSxcbiAgICAgICAgcmVzb2x2ZToge31cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdhbWVuZGVkQ3RybCcsICgkc2NvcGUsIGxjRmFjdG9yeSwgbGV0dGVycywgJHN0YXRlKSA9PiB7XG4gICAgJHNjb3BlLmRpc3BsYXlMZXR0ZXJzID0gJHNjb3BlLmxldHRlcnMuZmlsdGVyKGxldHRlciA9PiB7XG4gICAgICAgIHJldHVybiBsZXR0ZXIuc3RhdGUgPT09IDNcbiAgICB9KVxuICAgICRzdGF0ZS50cmFuc2l0aW9uID0gKGxjX251bWJlcikgPT4ge1xuICAgICAgICAkc3RhdGUuZ28oJ3NpbmdsZUxjJywge1xuICAgICAgICAgICAgbGNfbnVtYmVyOiBsY19udW1iZXJcbiAgICAgICAgfSlcbiAgICB9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xpc3RNYW5hZ2VyLmZyb3plbicsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9saXN0TWFuYWdlci9mcm96ZW4vZnJvemVuLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnZnJvemVuQ3RybCcsXG4gICAgICAgIHVybDogJy9saXN0TWFuYWdlci9mcm96ZW4nLFxuICAgICAgICBwYXJlbnQ6ICdsaXN0TWFuYWdlcicsXG4gICAgICAgIC8vIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICAvLyB9LFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBsZXR0ZXJzOiAobGNGYWN0b3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxjRmFjdG9yeS5nZXRMZXR0ZXJzKHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IDRcbiAgICAgICAgICAgICAgICB9KS50aGVuKGxldHRlcnMgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGV0dGVyc1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdmcm96ZW5DdHJsJywgKCRzY29wZSwgbGNGYWN0b3J5LCBsZXR0ZXJzLCAkc3RhdGUpID0+IHtcbiAgICAkc2NvcGUuZGlzcGxheUxldHRlcnMgPSAkc2NvcGUubGV0dGVycy5maWx0ZXIobGV0dGVyID0+IHtcbiAgICAgICAgcmV0dXJuIGxldHRlci5zdGF0ZSA9PT0gNFxuICAgIH0pXG4gICAgJHN0YXRlLnRyYW5zaXRpb24gPSAobGNfbnVtYmVyKSA9PiB7XG4gICAgICAgICRzdGF0ZS5nbygnc2luZ2xlTGMnLCB7XG4gICAgICAgICAgICBsY19udW1iZXI6IGxjX251bWJlclxuICAgICAgICB9KVxuICAgIH1cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbGlzdE1hbmFnZXIubmV3TGNzJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xpc3RNYW5hZ2VyL25ld0xjcy9uZXdMY3MuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICduZXdMY3NDdHJsJyxcbiAgICAgICAgdXJsOiAnL2xpc3RNYW5hZ2VyL25ld0xjcycsXG4gICAgICAgIHBhcmVudDogJ2xpc3RNYW5hZ2VyJyxcbiAgICAgICAgLy8gZGF0YToge1xuICAgICAgICAvLyAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIC8vIH0sXG4gICAgICAgIHJlc29sdmU6IHt9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignbmV3TGNzQ3RybCcsICgkc2NvcGUsIGxjRmFjdG9yeSwgbGV0dGVycywgJHN0YXRlKSA9PiB7XG4gICAgJHNjb3BlLmRpc3BsYXlMZXR0ZXJzID0gJHNjb3BlLmxldHRlcnMuZmlsdGVyKGxldHRlciA9PiB7XG4gICAgICAgIHJldHVybiBsZXR0ZXIuc3RhdGUgPT09IDFcbiAgICB9KVxuICAgICRzY29wZS5zdGF0ZSA9IHtcbiAgICAgICAgMTogJ05ldycsXG4gICAgICAgIDI6ICdSZXZpZXdlZCcsXG4gICAgICAgIDM6ICdBbWVuZGVkJyxcbiAgICAgICAgNDogJ0Zyb3plbicsXG4gICAgICAgIDU6ICdQZW5kaW5nIFVwZGF0ZSdcbiAgICB9XG4gICAgJHN0YXRlLnRyYW5zaXRpb24gPSAobGNfbnVtYmVyKSA9PiB7XG4gICAgICAgICRzdGF0ZS5nbygnc2luZ2xlTGMnLCB7XG4gICAgICAgICAgICBsY19udW1iZXI6IGxjX251bWJlclxuICAgICAgICB9KVxuICAgIH1cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbGlzdE1hbmFnZXIucmV2aWV3ZWQnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbGlzdE1hbmFnZXIvcmV2aWV3ZWQvcmV2aWV3ZWQuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdyZXZpZXdlZEN0cmwnLFxuICAgICAgICB1cmw6ICcvbGlzdE1hbmFnZXIvcmV2aWV3ZWQnLFxuICAgICAgICBwYXJlbnQ6ICdsaXN0TWFuYWdlcicsXG4gICAgICAgIC8vIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICAvLyB9LFxuICAgICAgICByZXNvbHZlOiB7fVxuICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ3Jldmlld2VkQ3RybCcsICgkc2NvcGUsIGxjRmFjdG9yeSwgbGV0dGVycywgJHN0YXRlKSA9PiB7XG4gICAgJHNjb3BlLmRpc3BsYXlMZXR0ZXJzID0gJHNjb3BlLmxldHRlcnMuZmlsdGVyKGxldHRlciA9PiB7XG4gICAgICAgIHJldHVybiBsZXR0ZXIuc3RhdGUgPT09IDJcbiAgICB9KVxuICAgICRzdGF0ZS50cmFuc2l0aW9uID0gKGxjX251bWJlcikgPT4ge1xuICAgICAgICAkc3RhdGUuZ28oJ3NpbmdsZUxjJywge1xuICAgICAgICAgICAgbGNfbnVtYmVyOiBsY19udW1iZXJcbiAgICAgICAgfSlcbiAgICB9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xpc3RNYW5hZ2VyLnVwZGF0ZWQnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbGlzdE1hbmFnZXIvdXBkYXRlZC91cGRhdGVkLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAndXBkYXRlZEN0cmwnLFxuICAgICAgICB1cmw6ICcvbGlzdE1hbmFnZXIvdXBkYXRlZCcsXG4gICAgICAgIC8vIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICAvLyB9LFxuICAgICAgICByZXNvbHZlOiB7fVxuICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ3VwZGF0ZWRDdHJsJywgKCRzY29wZSwgbGNGYWN0b3J5LCBsZXR0ZXJzLCAkc3RhdGUpID0+IHtcbiAgICAkc2NvcGUuZGlzcGxheUxldHRlcnMgPSAkc2NvcGUubGV0dGVycy5maWx0ZXIobGV0dGVyID0+IHtcbiAgICAgICAgcmV0dXJuIGxldHRlci5zdGF0ZSA9PT0gNVxuICAgIH0pXG4gICAgJHN0YXRlLnRyYW5zaXRpb24gPSAobGNfbnVtYmVyKSA9PiB7XG4gICAgICAgICRzdGF0ZS5nbygnc2luZ2xlTGMnLCB7XG4gICAgICAgICAgICBsY19udW1iZXI6IGxjX251bWJlclxuICAgICAgICB9KVxuICAgIH1cbn0pOyIsImFwcC5kaXJlY3RpdmUoJ3NpZGViYXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgQVVUSF9FVkVOVFMsICRzdGF0ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9fY29tbW9uL2RpcmVjdGl2ZXMvYXNpZGUvYXNpZGUuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBsY0ZhY3RvcnkpIHtcbiAgICAgICAgICAgIC8vIGxjRmFjdG9yeS5nZXRMZXR0ZXJDb3VudCgpLnRoZW4obGV0dGVyQ291bnQgPT4ge1xuICAgICAgICAgICAgLy8gICAgIHNjb3BlLmxldHRlckNvdW50ID0gbGV0dGVyQ291bnRcbiAgICAgICAgICAgIC8vIH0pXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pOyIsImFwcC5kaXJlY3RpdmUoJ2Zvb3RlcicsIGZ1bmN0aW9uKCRzdGF0ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9fY29tbW9uL2RpcmVjdGl2ZXMvZm9vdGVyL2Zvb3Rlci5odG1sJ1xuICAgIH07XG5cbn0pOyIsImFwcC5kaXJlY3RpdmUoJ25hdmJhcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCBBVVRIX0VWRU5UUywgJHN0YXRlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL19jb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSkge1xuXG4gICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcblxuICAgICAgICAgICAgc2NvcGUuaXNMb2dnZWRJbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHNldFVzZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IHVzZXI7XG5cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVVc2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UubG9nb3V0KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdsb2dpbicpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHNldFVzZXIoKTtcblxuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MsIHNldFVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9nb3V0U3VjY2VzcywgcmVtb3ZlVXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgcmVtb3ZlVXNlcik7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSk7Il19
