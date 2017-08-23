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

                if ($scope.client) $scope.amendments[_key].status = '2' + $scope.letter.amendments[_key].status[1];else $scope.amendments[_key].status = $scope.letter.amendments[_key].status[0] + '2';
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

        console.log($scope.amendments);
        $scope.letter.amendments = $scope.amendments;

        // lcFactory.updateLetter().then(letter => {
        //     $state.go($scope.states[letter.state])
        // })
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
        return $http.put('/api/lc/' + letter.id).then(function (response) {
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImNsYXVzZU1hbmFnZXIvY2xhdXNlTWFuYWdlci5qcyIsImRhc2hib2FyZC9kYXNoYm9hcmQuanMiLCJsYW5kaW5nL2xhbmRpbmcuanMiLCJsaXN0TWFuYWdlci9saXN0TWFuYWdlci5qcyIsInNpbmdsZUxjL3NpbmdsZUxjLmpzIiwiX2NvbW1vbi9mYWN0b3JpZXMvY291bnRyeUZhY3RvcnkuanMiLCJfY29tbW9uL2ZhY3Rvcmllcy9sY0ZhY3RvcnkuanMiLCJfY29tbW9uL2ZhY3Rvcmllcy91c2VyRmFjdG9yeS5qcyIsIl9jb21tb24vcHJlYnVpbHQvZnNhLXByZS1idWlsdC5qcyIsIl9jb21tb24vcHJlYnVpbHQvdWktY2xpZW50LmpzIiwiX2NvbW1vbi9wcmVidWlsdC91aS1qcC5qcyIsIl9jb21tb24vcHJlYnVpbHQvdWktbG9hZC5qcyIsIl9jb21tb24vcHJlYnVpbHQvdWktbmF2LmpzIiwiX2NvbW1vbi9wcmVidWlsdC91aS10b2dnbGUuanMiLCJsaXN0TWFuYWdlci9hbGwvYWxsLmpzIiwibGlzdE1hbmFnZXIvYW1lbmRlZC9hbWVuZGVkLmpzIiwibGlzdE1hbmFnZXIvZnJvemVuL2Zyb3plbi5qcyIsImxpc3RNYW5hZ2VyL25ld0xjcy9uZXdMY3MuanMiLCJsaXN0TWFuYWdlci9yZXZpZXdlZC9yZXZpZXdlZC5qcyIsImxpc3RNYW5hZ2VyL3VwZGF0ZWQvdXBkYXRlZC5qcyIsIl9jb21tb24vZGlyZWN0aXZlcy9hc2lkZS9hc2lkZS5qcyIsIl9jb21tb24vZGlyZWN0aXZlcy9mb290ZXIvZm9vdGVyLmpzIiwiX2NvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuanMiXSwibmFtZXMiOlsid2luZG93IiwiYXBwIiwiYW5ndWxhciIsIm1vZHVsZSIsImNvbmZpZyIsIiR1cmxSb3V0ZXJQcm92aWRlciIsIiRsb2NhdGlvblByb3ZpZGVyIiwiJGNvbXBpbGVQcm92aWRlciIsImh0bWw1TW9kZSIsImFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0Iiwib3RoZXJ3aXNlIiwid2hlbiIsImxvY2F0aW9uIiwicmVsb2FkIiwicnVuIiwiJHJvb3RTY29wZSIsIkF1dGhTZXJ2aWNlIiwiJHN0YXRlIiwiZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCIsInN0YXRlIiwiZGF0YSIsImF1dGhlbnRpY2F0ZSIsIiRvbiIsImV2ZW50IiwidG9TdGF0ZSIsInRvUGFyYW1zIiwiaXNBdXRoZW50aWNhdGVkIiwicHJldmVudERlZmF1bHQiLCJnZXRMb2dnZWRJblVzZXIiLCJ0aGVuIiwidXNlciIsInRyYW5zaXRpb25UbyIsIm5hbWUiLCIkc3RhdGVQcm92aWRlciIsInRlbXBsYXRlVXJsIiwiY29udHJvbGxlciIsInVybCIsIiRzY29wZSIsInJlc29sdmUiLCJsY0ZhY3RvcnkiLCJsZXR0ZXIiLCJsY19udW1iZXIiLCJ1cGxvYWRzIiwiYW1tZW5kbWVudHMiLCJkYXRlIiwiRGF0ZSIsIm5vdyIsImNvdW50cnkiLCJjbGllbnQiLCJiYW5rIiwicHNyIiwiY3JjIiwiZHJhZnQiLCJmaW5Eb2MiLCJmaW5EYXRlIiwidGVzdCIsImNyZWF0ZUxjIiwibmV3TGV0dGVyIiwibGV0dGVyVG9CZUNyZWF0ZWQiLCJjcmVhdGVMZXR0ZXIiLCJnbyIsImFkZExjQXR0YWNobWVudCIsImZpbGVUb0JlQWRkZWQiLCJsY0lkIiwidXBkYXRlTGV0dGVyRmlsZSIsInNldExjVG9BbW1lbmRlZCIsImxldHRlclRvQmVVcGRhdGVkIiwic3RhdHVzIiwidXBkYXRlTGV0dGVyIiwic2V0TGNUb1Jldmlld2VkIiwic2V0TGNUb0Zyb3plbiIsInNldExjVG9BcmNoaXZlZCIsInVzZXJGYWN0b3J5IiwibG9naW4iLCJlcnJvciIsImNyZWF0ZVVzZXIiLCJjb25zb2xlIiwibG9nIiwidXNlcm5hbWUiLCJwYXNzd29yZCIsInNlbmRMb2dpbiIsImxvZ2luSW5mbyIsImFic3RyYWN0IiwibGV0dGVycyIsImdldExldHRlcnMiLCIkc3RhdGVQYXJhbXMiLCJnZXRTaW5nbGVMZXR0ZXIiLCJsY051bWJlciIsImFwcHJvdmVkIiwiY29udGVudCIsImxlbmd0aCIsImFtZW5kZWQiLCJyZWplY3RlZCIsInJlZmVyZW5jZSIsImFtZW5kbWVudHMiLCJsYXN0TW9kaWZpZWQiLCJqUXVlcnkiLCJleHRlbmQiLCJPYmplY3QiLCJrZXlzIiwia2V5Iiwic3RhdGVzIiwiYXBwcm92ZUFtZW5kbWVudCIsInJlamVjdEFtZW5kbWVudCIsImVkaXRBbWVuZG1lbnQiLCJleHBhbmRlZCIsImFtbWVuZGVkIiwidG90YWwiLCJzdWJtaXREcmFmdCIsImZhY3RvcnkiLCIkaHR0cCIsIiRxIiwiZCIsImdldENvdW50cmllcyIsInF1ZXJ5IiwiZ2V0IiwicGFyYW1zIiwicmVzcG9uc2UiLCJjYXRjaCIsInJlamVjdCIsIm1lc3NhZ2UiLCJlcnIiLCJnZXRTaW5nbGVDb3VudHJ5IiwiaWQiLCJjcmVhdGVDb3VudHJ5IiwiQ291bnRyeSIsInBvc3QiLCJ1cGRhdGVDb3VudHJ5IiwicHV0IiwiZGVsZXRlQ291bnRyeSIsImRlbGV0ZSIsImdldExldHRlckNvdW50IiwibGV0dGVyQWRkaXRpb24iLCJsZXR0ZXJUb0JlVXBkYXRlZElkIiwiZmlsZSIsImZkIiwiRm9ybURhdGEiLCJhcHBlbmQiLCJ0cmFuc2Zvcm1SZXF1ZXN0IiwiaWRlbnRpdHkiLCJoZWFkZXJzIiwidW5kZWZpbmVkIiwiZGVsZXRlTGV0dGVyIiwiY3JlZGVudGlhbHMiLCJlbWFpbCIsInVwZGF0ZVVzZXIiLCJnZXRVc2VycyIsImdldFVzZXJCeUlkIiwiRXJyb3IiLCJjb25zdGFudCIsImxvZ2luU3VjY2VzcyIsImxvZ2luRmFpbGVkIiwibG9nb3V0U3VjY2VzcyIsInNlc3Npb25UaW1lb3V0Iiwibm90QXV0aGVudGljYXRlZCIsIm5vdEF1dGhvcml6ZWQiLCJBVVRIX0VWRU5UUyIsInN0YXR1c0RpY3QiLCJyZXNwb25zZUVycm9yIiwiJGJyb2FkY2FzdCIsIiRodHRwUHJvdmlkZXIiLCJpbnRlcmNlcHRvcnMiLCJwdXNoIiwiJGluamVjdG9yIiwic2VydmljZSIsIlNlc3Npb24iLCJvblN1Y2Nlc3NmdWxMb2dpbiIsImNyZWF0ZSIsImZyb21TZXJ2ZXIiLCJzaWdudXAiLCJsb2dvdXQiLCJkZXN0cm95Iiwic2VsZiIsInNlc3Npb25JZCIsIkV2ZW50RW1pdHRlciIsInN1YnNjcmliZXJzIiwiRUUiLCJwcm90b3R5cGUiLCJvbiIsImV2ZW50TmFtZSIsImV2ZW50TGlzdGVuZXIiLCJlbWl0IiwicmVtYWluaW5nQXJncyIsInNsaWNlIiwiY2FsbCIsImFyZ3VtZW50cyIsImZvckVhY2giLCJsaXN0ZW5lciIsImFwcGx5IiwiJCIsImlzSUUiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJtYXRjaCIsImFkZENsYXNzIiwidWEiLCJlYWNoIiwib3B0aW9ucyIsImV2YWwiLCJhdHRyIiwiaXNQbGFpbk9iamVjdCIsInVpTG9hZCIsImxvYWQiLCJqcF9jb25maWciLCIkZG9jdW1lbnQiLCJsb2FkZWQiLCJwcm9taXNlIiwiZGVmZXJyZWQiLCJEZWZlcnJlZCIsInNyY3MiLCJpc0FycmF5Iiwic3BsaXQiLCJpbmRleCIsInNyYyIsImluZGV4T2YiLCJsb2FkQ1NTIiwibG9hZFNjcmlwdCIsInNjcmlwdCIsImNyZWF0ZUVsZW1lbnQiLCJvbmxvYWQiLCJlIiwib25lcnJvciIsImJvZHkiLCJhcHBlbmRDaGlsZCIsImhyZWYiLCJzdHlsZSIsInJlbCIsInR5cGUiLCJoZWFkIiwiZG9jdW1lbnQiLCIkdGhpcyIsInRhcmdldCIsIiRhY3RpdmUiLCJpcyIsImNsb3Nlc3QiLCJwYXJlbnQiLCJzaWJsaW5ncyIsInRvZ2dsZUNsYXNzIiwiZmluZCIsInNsaWRlVXAiLCJoYXNDbGFzcyIsIm5leHQiLCJzbGlkZURvd24iLCJjbGFzc2VzIiwidGFyZ2V0cyIsIkFycmF5IiwidmFsdWUiLCJ0cmFuc2l0aW9uIiwiZGlzcGxheUxldHRlcnMiLCJmaWx0ZXIiLCJkaXJlY3RpdmUiLCJyZXN0cmljdCIsInNjb3BlIiwibGluayIsImlzTG9nZ2VkSW4iLCJzZXRVc2Vy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TUFBQSxHQUFBN0ksSUFBQSxDQUFBLFlBQUE7QUFDQVosMkJBQUEyQyxFQUFBLENBQUEsT0FBQTtBQUNBLGlCQUZBO0FBR0EsYUFKQTtBQUtBbU07O0FBR0FoUCx1QkFBQU8sR0FBQSxDQUFBc0ksWUFBQU4sWUFBQSxFQUFBeUcsT0FBQTtBQUNBaFAsdUJBQUFPLEdBQUEsQ0FBQXNJLFlBQUFKLGFBQUEsRUFBQXdHLFVBQUE7QUFDQWpQLHVCQUFBTyxHQUFBLENBQUFzSSxZQUFBSCxjQUFBLEVBQUF1RyxVQUFBO0FBRUE7O0FBeENBLEtBQUE7QUE0Q0EsQ0E3Q0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnZWxpdGUtbGMtcG9ydGFsJywgWydmc2FQcmVCdWlsdCcsICd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nQW5pbWF0ZSddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbigkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98bG9jYWx8ZGF0YXxjaHJvbWUtZXh0ZW5zaW9uKTovKTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG4gICAgLy8gVHJpZ2dlciBwYWdlIHJlZnJlc2ggd2hlbiBhY2Nlc3NpbmcgYW4gT0F1dGggcm91dGVcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIud2hlbignL2F1dGgvOnByb3ZpZGVyJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9KTtcbn0pO1xuXG4vLyBUaGlzIGFwcC5ydW4gaXMgZm9yIGNvbnRyb2xsaW5nIGFjY2VzcyB0byBzcGVjaWZpYyBzdGF0ZXMuXG5hcHAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgIC8vIFRoZSBnaXZlbiBzdGF0ZSByZXF1aXJlcyBhbiBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAgdmFyIGRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGggPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmF1dGhlbnRpY2F0ZTtcbiAgICB9O1xuXG4gICAgLy8gJHN0YXRlQ2hhbmdlU3RhcnQgaXMgYW4gZXZlbnQgZmlyZWRcbiAgICAvLyB3aGVuZXZlciB0aGUgcHJvY2VzcyBvZiBjaGFuZ2luZyBhIHN0YXRlIGJlZ2lucy5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMpIHtcblxuICAgICAgICBpZiAoIWRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGgodG9TdGF0ZSkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBkZXN0aW5hdGlvbiBzdGF0ZSBkb2VzIG5vdCByZXF1aXJlIGF1dGhlbnRpY2F0aW9uXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgICAgICAvLyBUaGUgdXNlciBpcyBhdXRoZW50aWNhdGVkLlxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbmNlbCBuYXZpZ2F0aW5nIHRvIG5ldyBzdGF0ZS5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgIC8vIElmIGEgdXNlciBpcyByZXRyaWV2ZWQsIHRoZW4gcmVuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb25cbiAgICAgICAgICAgIC8vICh0aGUgc2Vjb25kIHRpbWUsIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpIHdpbGwgd29yaylcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4sIGdvIHRvIFwibG9naW5cIiBzdGF0ZS5cbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLnRyYW5zaXRpb25Ubyh0b1N0YXRlLm5hbWUsIHRvUGFyYW1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLnRyYW5zaXRpb25UbygnaG9tZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2NsYXVzZU1hbmFnZXInLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY2xhdXNlTWFuYWdlci9jbGF1c2VNYW5hZ2VyLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnY2xhdXNlTWFuYWdlckN0cmwnLFxuICAgICAgICB1cmw6ICcvY2xhdXNlTWFuYWdlcidcbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdjbGF1c2VNYW5hZ2VyQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSkge1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Rhc2hib2FyZCcsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9kYXNoYm9hcmQvZGFzaGJvYXJkLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnZGFzaGJvYXJkQ3RybCcsXG4gICAgICAgIHVybDogJy9kYXNoYm9hcmQnLFxuICAgICAgICAvLyBkYXRhOiB7XG4gICAgICAgIC8vICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgLy8gfSxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgLy8gbGV0dGVyczogKGxjRmFjdG9yeSkgPT4ge1xuICAgICAgICAgICAgLy8gICAgIHJldHVybiBsY0ZhY3RvcnkuZ2V0TGV0dGVycyh7fSkudGhlbihsZXR0ZXJzID0+IHtcbiAgICAgICAgICAgIC8vICAgICAgICAgcmV0dXJuIGxldHRlcnNcbiAgICAgICAgICAgIC8vICAgICB9KVxuICAgICAgICAgICAgLy8gfVxuICAgICAgICB9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignZGFzaGJvYXJkQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCBsY0ZhY3RvcnkpIHtcblxuICAgIC8vaW5pdHNcbiAgICAvLyAkc2NvcGUubGV0dGVycyA9IGxldHRlcnNcbiAgICAvLyRzY29wZS5hbmFseXRpY3MgPSBhbmFseXRpY3NcblxuICAgIC8vZW5kIGluaXRzXG4gICAgJHNjb3BlLmxldHRlciA9IHtcbiAgICAgICAgbGNfbnVtYmVyOiAzNDUzNDUzNSxcbiAgICAgICAgdXBsb2FkczogWydTR0hTQkM3RzE4MzAxNjM0LVQwMS5wZGYnXSxcbiAgICAgICAgYW1tZW5kbWVudHM6IHtcbiAgICAgICAgICAgIDIwOiAnQnJpZGdlIHNlbnRpZW50IGNpdHkgYm95IG1ldGEtY2FtZXJhIGZvb3RhZ2UgRElZIHBhcGllci1tYWNoZSBzaWduIGNvbmNyZXRlIGh1bWFuIHNob2VzIGNvdXJpZXIuIERlYWQgZGlnaXRhbCAzRC1wcmludGVkIHJhbmdlLXJvdmVyIGNvbXB1dGVyIHNlbnNvcnkgc2VudGllbnQgZnJhbmNoaXNlIGJyaWRnZSBuZXR3b3JrIG1hcmtldCByZWJhciB0YW5rLXRyYXBzIGZyZWUtbWFya2V0IGh1bWFuLiBCQVNFIGp1bXAgc3RpbXVsYXRlIGFydGlzYW5hbCBuYXJyYXRpdmUgY29ycnVwdGVkIGFzc2F1bHQgcmFuZ2Utcm92ZXIgZmlsbSBuYW5vLXBhcmFub2lkIHNocmluZSBzZW1pb3RpY3MgY29udmVuaWVuY2Ugc3RvcmUuIFNwcmF3bCBjb25jcmV0ZSBjb3JydXB0ZWQgbW9kZW0gc3Bvb2sgaHVtYW4gZGlzcG9zYWJsZSB0b3dhcmRzIG5hcnJhdGl2ZSBpbmR1c3RyaWFsIGdyYWRlIGdpcmwgcmVhbGlzbSB3ZWF0aGVyZWQgVG9reW8gc2F2YW50LicsXG4gICAgICAgICAgICAyMjogJ0dyZW5hZGUgbGlnaHRzIGNvbXB1dGVyIHNhdHVyYXRpb24gcG9pbnQgY3liZXItbG9uZy1jaGFpbiBoeWRyb2NhcmJvbnMgZmlsbSB0YXR0b28gc2t5c2NyYXBlciBUb2t5byBkaWdpdGFsIGludG8gZmx1aWRpdHkgZnJlZS1tYXJrZXQgdG93YXJkcyBwaXN0b2wuIEthdGFuYSBhc3NhdWx0IGFzc2Fzc2luIGZvb3RhZ2UgY3liZXIta2FuamkgbmV0d29yayBpbmR1c3RyaWFsIGdyYWRlLiBDb3JydXB0ZWQgbmV1cmFsIHJlYWxpc20gY291cmllci13YXJlIHNlbnNvcnkgYmljeWNsZSBnaXJsIGRlY2F5IGZhY2UgZm9yd2FyZHMuIENvbmNyZXRlIHRvd2FyZHMgY2FyZGJvYXJkIERJWSBtb2RlbSBuZXR3b3JrIG1vbm9maWxhbWVudCB0YW5rLXRyYXBzIGFibGF0aXZlIHVyYmFuIHNwb29rIGRpc3Bvc2FibGUga25pZmUgYmljeWNsZSBzaGFudHkgdG93biB3b21hbi4gJ1xuICAgICAgICB9LFxuICAgICAgICBkYXRlOiBEYXRlLm5vdygpLFxuICAgICAgICBjb3VudHJ5OiAxLFxuICAgICAgICBjbGllbnQ6IDEsXG4gICAgICAgIGJhbms6ICdCYW5rIG9mIENoaW5hJyxcbiAgICAgICAgcHNyOiAnU2hhcm9uJyxcbiAgICAgICAgY3JjOiAnQm9iJyxcbiAgICAgICAgc3RhdGU6IDUsXG4gICAgICAgIGRyYWZ0OiBmYWxzZSxcbiAgICAgICAgZmluRG9jOiAwLFxuICAgICAgICBmaW5EYXRlOiBudWxsXG5cbiAgICB9XG4gICAgJHNjb3BlLnRlc3QgPSAoKSA9PiB7XG4gICAgICAgICRzY29wZS5jcmVhdGVMYyh7XG4gICAgICAgICAgICBuZXdMZXR0ZXI6ICRzY29wZS5sZXR0ZXJcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvL2Z1bmN0aW9ucyB0byBlZGl0IGFuZCBhbW1lbmQgbGNzXG4gICAgJHNjb3BlLmNyZWF0ZUxjID0gKGxldHRlclRvQmVDcmVhdGVkKSA9PiB7XG4gICAgICAgIGxjRmFjdG9yeS5jcmVhdGVMZXR0ZXIobGV0dGVyVG9CZUNyZWF0ZWQpLnRoZW4oY3JlYXRlZExldHRlciA9PiB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2xpc3RNYW5hZ2VyJylcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAkc2NvcGUuYWRkTGNBdHRhY2htZW50ID0gKGZpbGVUb0JlQWRkZWQsIGxjSWQpID0+IHtcbiAgICAgICAgbGNGYWN0b3J5LnVwZGF0ZUxldHRlckZpbGUoZmlsZVRvQmVBZGRlZCwgbGNJZCkudGhlbihsZXR0ZXIgPT4ge1xuICAgICAgICAgICAgJHN0YXRlLmdvKClcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAkc2NvcGUuc2V0TGNUb0FtbWVuZGVkID0gKGxldHRlclRvQmVVcGRhdGVkKSA9PiB7XG4gICAgICAgIGxldHRlclRvQmVVcGRhdGVkLnN0YXR1cyA9IDNcbiAgICAgICAgbGNGYWN0b3J5LnVwZGF0ZUxldHRlcihsZXR0ZXJUb0JlVXBkYXRlZCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2FtZW5kZWQnKVxuICAgICAgICB9KVxuICAgIH1cblxuICAgICRzY29wZS5zZXRMY1RvUmV2aWV3ZWQgPSAobGV0dGVyVG9CZVVwZGF0ZWQpID0+IHtcbiAgICAgICAgbGV0dGVyVG9CZVVwZGF0ZWQuc3RhdHVzID0gMlxuICAgICAgICBsY0ZhY3RvcnkudXBkYXRlTGV0dGVyKGxldHRlclRvQmVVcGRhdGVkKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygncmV2aWV3JylcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAkc2NvcGUuc2V0TGNUb0Zyb3plbiA9IChsZXR0ZXJUb0JlVXBkYXRlZCkgPT4ge1xuICAgICAgICBsZXR0ZXJUb0JlVXBkYXRlZC5zdGF0dXMgPSA0XG4gICAgICAgIGxjRmFjdG9yeS51cGRhdGVMZXR0ZXIobGV0dGVyVG9CZVVwZGF0ZWQpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdmcm96ZW4nKVxuICAgICAgICB9KVxuXG4gICAgfVxuXG4gICAgJHNjb3BlLnNldExjVG9BcmNoaXZlZCA9IChsZXR0ZXJUb0JlVXBkYXRlZCkgPT4ge1xuICAgICAgICBsZXR0ZXJUb0JlVXBkYXRlZC5maW5Eb2MgPSAkc2NvcGUuZmluRG9jXG4gICAgICAgIGxldHRlclRvQmVVcGRhdGVkLnN0YXR1cyA9IDVcbiAgICAgICAgbGNGYWN0b3J5LnVwZGF0ZUxldHRlcihsZXR0ZXJUb0JlVXBkYXRlZCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2FyY2hpdmVkJylcbiAgICAgICAgfSlcblxuICAgIH1cblxuICAgIC8qYW1tZW5kbWVudHMgPSBbe1xuICAgICAgICBzd2lmdENvZGU6aW50LFxuICAgICAgICByZWZlcmVuY2U6IHRleHQsXG4gICAgICAgIHN0YXR1czogMCwxLDIsXG4gICAgICAgIGRhdGVNb2RpZmllZDpkYXRlICBcbiAgICB9XVxuICAgICovXG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbGFuZGluZycsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9sYW5kaW5nL2xhbmRpbmcuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdsYW5kaW5nQ3RybCcsXG4gICAgICAgIHVybDogJy8nXG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignbGFuZGluZ0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIEF1dGhTZXJ2aWNlLCB1c2VyRmFjdG9yeSwgJHN0YXRlKSB7XG5cbiAgICAkc2NvcGUubG9naW4gPSB7fTtcbiAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuICAgICRzY29wZS5jcmVhdGVVc2VyID0gKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnaGVsbG8nKVxuICAgICAgICBsZXQgbG9naW4gPSB7XG4gICAgICAgICAgICB1c2VybmFtZTogJ3Rlc3QnLFxuICAgICAgICAgICAgcGFzc3dvcmQ6ICd0ZXN0J1xuICAgICAgICB9XG4gICAgICAgIHVzZXJGYWN0b3J5LmNyZWF0ZVVzZXIoe1xuICAgICAgICAgICAgdXNlcjogbG9naW5cbiAgICAgICAgfSkudGhlbih1c2VyID0+IHtcbiAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ2luKGxvZ2luKVxuICAgICAgICB9KVxuICAgIH1cbiAgICAkc2NvcGUuc2VuZExvZ2luID0gZnVuY3Rpb24obG9naW5JbmZvKSB7XG5cbiAgICAgICAgJHNjb3BlLmVycm9yID0gbnVsbDtcbiAgICAgICAgQXV0aFNlcnZpY2UubG9naW4obG9naW5JbmZvKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJHN0YXRlLnRyYW5zaXRpb25UbygnZGFzaGJvYXJkJyk7XG4gICAgICAgIH0pXG4gICAgfTtcbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsaXN0TWFuYWdlcicsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9saXN0TWFuYWdlci9saXN0TWFuYWdlci5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2xpc3RNYW5hZ2VyQ3RybCcsXG4gICAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgICAvLyBkYXRhOiB7XG4gICAgICAgIC8vICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgLy8gfSxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgbGV0dGVyczogKGxjRmFjdG9yeSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBsY0ZhY3RvcnkuZ2V0TGV0dGVycyh7fSkudGhlbihsZXR0ZXJzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxldHRlcnNcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignbGlzdE1hbmFnZXJDdHJsJywgKCRzY29wZSwgbGNGYWN0b3J5LCAkc3RhdGUsIGxldHRlcnMpID0+IHtcbiAgICAkc2NvcGUubGV0dGVycyA9IGxldHRlcnNcbiAgICAkc2NvcGUuc3RhdGUgPSB7XG4gICAgICAgIDE6ICdOZXcnLFxuICAgICAgICAyOiAnUmV2aWV3ZWQnLFxuICAgICAgICAzOiAnQW1lbmRlZCcsXG4gICAgICAgIDQ6ICdGcm96ZW4nLFxuICAgICAgICA1OiAnUGVuZGluZyBVcGRhdGUnXG4gICAgfVxuXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnc2luZ2xlTGMnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvc2luZ2xlTGMvc2luZ2xlTGMuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdzaW5nbGVMY0N0cmwnLFxuICAgICAgICB1cmw6ICcvbGMvOmxjTnVtYmVyJyxcbiAgICAgICAgLy8gZGF0YToge1xuICAgICAgICAvLyAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIC8vIH0sXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIGxldHRlcjogKGxjRmFjdG9yeSwgJHN0YXRlUGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxjRmFjdG9yeS5nZXRTaW5nbGVMZXR0ZXIoJHN0YXRlUGFyYW1zLmxjTnVtYmVyKS50aGVuKGxldHRlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsZXR0ZXJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignc2luZ2xlTGNDdHJsJywgKCRzY29wZSwgbGNGYWN0b3J5LCBsZXR0ZXIpID0+IHtcbiAgICAkc2NvcGUubGV0dGVyID0gbGV0dGVyXG4gICAgJHNjb3BlLmFwcHJvdmVkID0ge1xuICAgICAgICBjb250ZW50OiB7fSxcbiAgICAgICAgbGVuZ3RoOiAwXG4gICAgfVxuICAgICRzY29wZS5hbWVuZGVkID0ge1xuICAgICAgICBjb250ZW50OiB7fSxcbiAgICAgICAgbGVuZ3RoOiAwXG4gICAgfVxuICAgICRzY29wZS5yZWplY3RlZCA9IHtcbiAgICAgICAgY29udGVudDoge30sXG4gICAgICAgIGxlbmd0aDogMFxuICAgIH1cbiAgICAkc2NvcGUucmVmZXJlbmNlID0ge31cbiAgICAkc2NvcGUubGV0dGVyLmFtZW5kbWVudHMgPSB7XG4gICAgICAgIDIwOiB7XG4gICAgICAgICAgICByZWZlcmVuY2U6ICdCcmlkZ2Ugc2VudGllbnQgY2l0eSBib3kgbWV0YS1jYW1lcmEgZm9vdGFnZSBESVkgcGFwaWVyLW1hY2hlIHNpZ24gY29uY3JldGUgaHVtYW4gc2hvZXMgY291cmllci4gRGVhZCBkaWdpdGFsIDNELXByaW50ZWQgcmFuZ2Utcm92ZXIgY29tcHV0ZXIgc2Vuc29yeSBzZW50aWVudCBmcmFuY2hpc2UgYnJpZGdlIG5ldHdvcmsgbWFya2V0IHJlYmFyIHRhbmstdHJhcHMgZnJlZS1tYXJrZXQgaHVtYW4uIEJBU0UganVtcCBzdGltdWxhdGUgYXJ0aXNhbmFsIG5hcnJhdGl2ZSBjb3JydXB0ZWQgYXNzYXVsdCByYW5nZS1yb3ZlciBmaWxtIG5hbm8tcGFyYW5vaWQgc2hyaW5lIHNlbWlvdGljcyBjb252ZW5pZW5jZSBzdG9yZS4gU3ByYXdsIGNvbmNyZXRlIGNvcnJ1cHRlZCBtb2RlbSBzcG9vayBodW1hbiBkaXNwb3NhYmxlIHRvd2FyZHMgbmFycmF0aXZlIGluZHVzdHJpYWwgZ3JhZGUgZ2lybCByZWFsaXNtIHdlYXRoZXJlZCBUb2t5byBzYXZhbnQuJyxcbiAgICAgICAgICAgIHN0YXR1czogJzAwJyxcbiAgICAgICAgICAgIGxhc3RNb2RpZmllZDogRGF0ZS5ub3coKVxuICAgICAgICB9LFxuICAgICAgICAyMjoge1xuICAgICAgICAgICAgcmVmZXJlbmNlOiAnR3JlbmFkZSBsaWdodHMgY29tcHV0ZXIgc2F0dXJhdGlvbiBwb2ludCBjeWJlci1sb25nLWNoYWluIGh5ZHJvY2FyYm9ucyBmaWxtIHRhdHRvbyBza3lzY3JhcGVyIFRva3lvIGRpZ2l0YWwgaW50byBmbHVpZGl0eSBmcmVlLW1hcmtldCB0b3dhcmRzIHBpc3RvbC4gS2F0YW5hIGFzc2F1bHQgYXNzYXNzaW4gZm9vdGFnZSBjeWJlci1rYW5qaSBuZXR3b3JrIGluZHVzdHJpYWwgZ3JhZGUuIENvcnJ1cHRlZCBuZXVyYWwgcmVhbGlzbSBjb3VyaWVyLXdhcmUgc2Vuc29yeSBiaWN5Y2xlIGdpcmwgZGVjYXkgZmFjZSBmb3J3YXJkcy4gQ29uY3JldGUgdG93YXJkcyBjYXJkYm9hcmQgRElZIG1vZGVtIG5ldHdvcmsgbW9ub2ZpbGFtZW50IHRhbmstdHJhcHMgYWJsYXRpdmUgdXJiYW4gc3Bvb2sgZGlzcG9zYWJsZSBrbmlmZSBiaWN5Y2xlIHNoYW50eSB0b3duIHdvbWFuLiAnLFxuICAgICAgICAgICAgc3RhdHVzOiAnMDAnLFxuICAgICAgICAgICAgbGFzdE1vZGlmaWVkOiBEYXRlLm5vdygpXG4gICAgICAgIH1cbiAgICB9XG4gICAgJHNjb3BlLmFtZW5kbWVudHMgPSBqUXVlcnkuZXh0ZW5kKHRydWUsIHt9LCAkc2NvcGUubGV0dGVyLmFtZW5kbWVudHMpXG4gICAgJHNjb3BlLmNsaWVudCA9ICRzY29wZS51c2VyID09PSAzXG4gICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKCRzY29wZS5hbWVuZG1lbnRzKSkge1xuICAgICAgICBpZiAoJHNjb3BlLmNsaWVudCkge1xuICAgICAgICAgICAgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5zdGF0dXMgPSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1c1swXVxuICAgICAgICB9IGVsc2UgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5zdGF0dXMgPSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1c1sxXVxuICAgIH1cblxuICAgICRzY29wZS5zdGF0ZXMgPSB7XG4gICAgICAgIDE6ICduZXdMY3MnLFxuICAgICAgICAyOiAncmV2aWV3ZWQnLFxuICAgICAgICAzOiAnYW1lbmRlZCcsXG4gICAgICAgIDQ6ICdmcm96ZW4nLFxuICAgICAgICA1OiAnYXJjaGl2ZWQnXG4gICAgfVxuICAgICRzY29wZS5hcHByb3ZlQW1lbmRtZW50ID0gKGtleSkgPT4ge1xuICAgICAgICAkc2NvcGUuYXBwcm92ZWQuY29udGVudFtrZXldID0gJHNjb3BlLmFtZW5kbWVudHNba2V5XS5yZWZlcmVuY2VcbiAgICAgICAgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5zdGF0dXMgPSAnMSdcbiAgICAgICAgJHNjb3BlLmFwcHJvdmVkLmxlbmd0aCsrXG5cbiAgICB9XG4gICAgJHNjb3BlLnJlamVjdEFtZW5kbWVudCA9IChrZXkpID0+IHtcbiAgICAgICAgJHNjb3BlLnJlamVjdGVkLmNvbnRlbnRba2V5XSA9ICRzY29wZS5hbWVuZG1lbnRzW2tleV0ucmVmZXJlbmNlXG4gICAgICAgICRzY29wZS5hbWVuZG1lbnRzW2tleV0uc3RhdHVzID0gJzMnXG4gICAgICAgICRzY29wZS5yZWplY3RlZC5sZW5ndGgrK1xuICAgIH1cbiAgICAkc2NvcGUuZWRpdEFtZW5kbWVudCA9IChrZXkpID0+IHtcbiAgICAgICAgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5yZWZlcmVuY2UgPSAkc2NvcGUucmVmZXJlbmNlW2tleV1cbiAgICAgICAgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5zdGF0dXMgPSAnMidcbiAgICAgICAgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5leHBhbmRlZCA9IGZhbHNlXG4gICAgICAgICRzY29wZS5hbWVuZGVkWyRzY29wZS5hbWVuZG1lbnRzW2tleV1dID0gJHNjb3BlLnJlZmVyZW5jZVtrZXldXG4gICAgICAgICRzY29wZS5hbW1lbmRlZCA9IE9iamVjdC5rZXlzKCRzY29wZS5hbWVuZGVkKS5sZW5ndGhcbiAgICAgICAgJHNjb3BlLnJlZmVyZW5jZVtrZXldID0gXCJcIlxuICAgIH1cbiAgICAkc2NvcGUudXBkYXRlTGV0dGVyID0gKCkgPT4ge1xuICAgICAgICB2YXIgdG90YWwgPSAkc2NvcGUuYXBwcm92ZWQubGVuZ3RoICsgJHNjb3BlLnJlamVjdGVkLmxlbmd0aCArICRzY29wZS5hbWVuZGVkLmxlbmd0aFxuICAgICAgICBpZiAodG90YWwgIT09IE9iamVjdC5rZXlzKCRzY29wZS5hbWVuZG1lbnRzKS5sZW5ndGgpIHJldHVyblxuXG4gICAgICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cygkc2NvcGUuYXBwcm92ZWQuY29udGVudCkpIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUuY2xpZW50KSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1cyA9ICcxJyArICRzY29wZS5sZXR0ZXIuYW1lbmRtZW50c1trZXldLnN0YXR1c1sxXVxuICAgICAgICAgICAgZWxzZSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1cyA9ICRzY29wZS5sZXR0ZXIuYW1lbmRtZW50c1trZXldLnN0YXR1c1swXSArICcxJ1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cygkc2NvcGUuYW1lbmRlZC5jb250ZW50KSkge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5jbGllbnQpICRzY29wZS5hbWVuZG1lbnRzW2tleV0uc3RhdHVzID0gJzInICsgJHNjb3BlLmxldHRlci5hbWVuZG1lbnRzW2tleV0uc3RhdHVzWzFdXG4gICAgICAgICAgICBlbHNlICRzY29wZS5hbWVuZG1lbnRzW2tleV0uc3RhdHVzID0gJHNjb3BlLmxldHRlci5hbWVuZG1lbnRzW2tleV0uc3RhdHVzWzBdICsgJzInXG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKCRzY29wZS5yZWplY3RlZC5jb250ZW50KSkge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5jbGllbnQpICRzY29wZS5hbWVuZG1lbnRzW2tleV0uc3RhdHVzID0gJzMnICsgJHNjb3BlLmxldHRlci5hbWVuZG1lbnRzW2tleV0uc3RhdHVzWzFdXG4gICAgICAgICAgICBlbHNlICRzY29wZS5hbWVuZG1lbnRzW2tleV0uc3RhdHVzID0gJHNjb3BlLmxldHRlci5hbWVuZG1lbnRzW2tleV0uc3RhdHVzWzBdICsgJzMnXG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLmFtZW5kbWVudHMpXG4gICAgICAgICRzY29wZS5sZXR0ZXIuYW1lbmRtZW50cyA9ICRzY29wZS5hbWVuZG1lbnRzXG5cbiAgICAgICAgLy8gbGNGYWN0b3J5LnVwZGF0ZUxldHRlcigpLnRoZW4obGV0dGVyID0+IHtcbiAgICAgICAgLy8gICAgICRzdGF0ZS5nbygkc2NvcGUuc3RhdGVzW2xldHRlci5zdGF0ZV0pXG4gICAgICAgIC8vIH0pXG4gICAgfVxuICAgICRzY29wZS5zdWJtaXREcmFmdCA9ICgpID0+IHtcbiAgICAgICAgLy8gJHNjb3BlLmNsaWVudCA/ICRzY29wZS5kcmFmdHNcblxuICAgIH1cbn0pOyIsImFwcC5mYWN0b3J5KCdjb3VudHJ5RmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwLCAkcSkge1xuICAgIHZhciBkID0ge31cbiAgICAgICAgLy9GZXRjaGVzXG4gICAgZC5nZXRDb3VudHJpZXMgPSAocXVlcnkpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9sYy8nLCB7XG4gICAgICAgICAgICBwYXJhbXM6IHF1ZXJ5XG4gICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgIH1cbiAgICBkLmdldFNpbmdsZUNvdW50cnkgPSAoaWQpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChgL2FwaS9sYy8ke2lkfWApXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vRW5kIEZldGNoZXNcblxuICAgIC8vU2V0c1xuICAgIGQuY3JlYXRlQ291bnRyeSA9IChDb3VudHJ5KSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2xjLycpXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vRW5kIFNldHNcblxuICAgIC8vVXBkYXRlc1xuICAgIGQudXBkYXRlQ291bnRyeSA9IChDb3VudHJ5KSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5wdXQoYC9hcGkvbGMvJHtDb3VudHJ5LmlkfWApXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vRW5kIFVwZGF0ZXNcblxuICAgIC8vRGVsZXRlc1xuICAgIGQuZGVsZXRlQ291bnRyeSA9IChxdWVyeSkgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKGAvYXBpL2xjL2AsIHtcbiAgICAgICAgICAgIHBhcmFtczogcXVlcnlcbiAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vRW5kIERlbGV0ZXNcbiAgICByZXR1cm4gZFxufSk7IiwiYXBwLmZhY3RvcnkoJ2xjRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwLCAkcSkge1xuICAgIHZhciBkID0ge31cbiAgICAgICAgLy9GZXRjaGVzXG4gICAgZC5nZXRMZXR0ZXJzID0gKHF1ZXJ5KSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvbGMvJywge1xuICAgICAgICAgICAgcGFyYW1zOiBxdWVyeVxuICAgICAgICB9KS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG4gICAgZC5nZXRTaW5nbGVMZXR0ZXIgPSAoaWQpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChgL2FwaS9sYy8ke2lkfWApXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIGQuZ2V0TGV0dGVyQ291bnQgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvbGMvY291bnQnKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAvL0VuZCBGZXRjaGVzXG4gICAgfVxuXG4gICAgLy9TZXRzXG4gICAgZC5jcmVhdGVMZXR0ZXIgPSAobGV0dGVyKSA9PiB7XG4gICAgICAgIC8vIHZhciBmaWxlID0gbGV0dGVyO1xuICAgICAgICAvLyB2YXIgZmQgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgICAgLy8gZmQuYXBwZW5kKCdsZXR0ZXInLCBmaWxlKTtcbiAgICAgICAgLy8gZmQuYXBwZW5kKCdjbGFzc3Jvb20nLCBhbmd1bGFyLnRvSnNvbihsZXR0ZXIpKVxuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9sYy8nLCBsZXR0ZXIpXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vRW5kIFNldHNcblxuICAgIC8vVXBkYXRlc1xuICAgIGQudXBkYXRlTGV0dGVyID0gKGxldHRlcikgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAucHV0KGAvYXBpL2xjLyR7bGV0dGVyLmlkfWApXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgIH1cbiAgICBkLnVwZGF0ZUxldHRlckZpbGUgPSAobGV0dGVyQWRkaXRpb24sIGxldHRlclRvQmVVcGRhdGVkSWQpID0+IHtcbiAgICAgICAgICAgIHZhciBmaWxlID0gbGV0dGVyQWRkaXRpb247XG4gICAgICAgICAgICB2YXIgZmQgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgICAgICAgIGZkLmFwcGVuZCgnbGV0dGVyQWRkaXRpb24nLCBmaWxlKTtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoJy9hcGkvbGMvYWRkaXRpb24nLCBmZCwge1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJlcXVlc3Q6IGFuZ3VsYXIuaWRlbnRpdHksXG4gICAgICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgLy9FbmQgVXBkYXRlc1xuXG4gICAgLy9EZWxldGVzXG4gICAgZC5kZWxldGVMZXR0ZXIgPSAocXVlcnkpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLmRlbGV0ZShgL2FwaS9sYy9gLCB7XG4gICAgICAgICAgICBwYXJhbXM6IHF1ZXJ5XG4gICAgICAgIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvL0VuZCBEZWxldGVzXG4gICAgcmV0dXJuIGRcbn0pOyIsImFwcC5mYWN0b3J5KCd1c2VyRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKSB7XG4gICAgdmFyIHVzZXJGYWN0b3J5ID0ge31cbiAgICAgICAgLy91c2VyIGZldGNoZXNcbiAgICB1c2VyRmFjdG9yeS5jcmVhdGVVc2VyID0gZnVuY3Rpb24odXNlcikge1xuICAgICAgICByZXR1cm4gJGh0dHAucG9zdChcIi9hcGkvdXNlcnMvc2lnbnVwXCIsIHVzZXIpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjcmVkZW50aWFscyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHVzZXIucGFzc3dvcmRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3JlZGVudGlhbHNcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICB1c2VyRmFjdG9yeS51cGRhdGVVc2VyID0gZnVuY3Rpb24odXNlcikge1xuICAgICAgICByZXR1cm4gJGh0dHAucHV0KFwiL2FwaS91c2Vycy91cGRhdGVcIiwgdXNlcilcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIHVzZXJGYWN0b3J5LmdldFVzZXJzID0gZnVuY3Rpb24odXNlcikge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KFwiL2FwaS91c2Vycy9cIilcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pXG4gICAgfVxuICAgIHVzZXJGYWN0b3J5LmdldFVzZXJCeUlkID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChcIi9hcGkvdXNlcnMvXCIgKyBpZClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiB1c2VyRmFjdG9yeVxufSk7IiwiKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIEhvcGUgeW91IGRpZG4ndCBmb3JnZXQgQW5ndWxhciEgRHVoLWRveS5cbiAgICBpZiAoIXdpbmRvdy5hbmd1bGFyKSB0aHJvdyBuZXcgRXJyb3IoJ0kgY2FuXFwndCBmaW5kIEFuZ3VsYXIhJyk7XG5cbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2ZzYVByZUJ1aWx0JywgW10pO1xuXG4gICAgLy8gQVVUSF9FVkVOVFMgaXMgdXNlZCB0aHJvdWdob3V0IG91ciBhcHAgdG9cbiAgICAvLyBicm9hZGNhc3QgYW5kIGxpc3RlbiBmcm9tIGFuZCB0byB0aGUgJHJvb3RTY29wZVxuICAgIC8vIGZvciBpbXBvcnRhbnQgZXZlbnRzIGFib3V0IGF1dGhlbnRpY2F0aW9uIGZsb3cuXG4gICAgYXBwLmNvbnN0YW50KCdBVVRIX0VWRU5UUycsIHtcbiAgICAgICAgbG9naW5TdWNjZXNzOiAnYXV0aC1sb2dpbi1zdWNjZXNzJyxcbiAgICAgICAgbG9naW5GYWlsZWQ6ICdhdXRoLWxvZ2luLWZhaWxlZCcsXG4gICAgICAgIGxvZ291dFN1Y2Nlc3M6ICdhdXRoLWxvZ291dC1zdWNjZXNzJyxcbiAgICAgICAgc2Vzc2lvblRpbWVvdXQ6ICdhdXRoLXNlc3Npb24tdGltZW91dCcsXG4gICAgICAgIG5vdEF1dGhlbnRpY2F0ZWQ6ICdhdXRoLW5vdC1hdXRoZW50aWNhdGVkJyxcbiAgICAgICAgbm90QXV0aG9yaXplZDogJ2F1dGgtbm90LWF1dGhvcml6ZWQnXG4gICAgfSk7XG5cblxuICAgIGFwcC5mYWN0b3J5KCdBdXRoSW50ZXJjZXB0b3InLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkcSwgQVVUSF9FVkVOVFMpIHtcbiAgICAgICAgdmFyIHN0YXR1c0RpY3QgPSB7XG4gICAgICAgICAgICA0MDE6IEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsXG4gICAgICAgICAgICA0MDM6IEFVVEhfRVZFTlRTLm5vdEF1dGhvcml6ZWQsXG4gICAgICAgICAgICA0MTk6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LFxuICAgICAgICAgICAgNDQwOiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzcG9uc2VFcnJvcjogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3Qoc3RhdHVzRGljdFtyZXNwb25zZS5zdGF0dXNdLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZXNwb25zZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIGFwcC5jb25maWcoZnVuY3Rpb24oJGh0dHBQcm92aWRlcikge1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKFtcbiAgICAgICAgICAgICckaW5qZWN0b3InLFxuICAgICAgICAgICAgZnVuY3Rpb24oJGluamVjdG9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRpbmplY3Rvci5nZXQoJ0F1dGhJbnRlcmNlcHRvcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICBdKTtcbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdBdXRoU2VydmljZScsIGZ1bmN0aW9uKCRodHRwLCBTZXNzaW9uLCAkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUywgJHEpIHtcblxuICAgICAgICBmdW5jdGlvbiBvblN1Y2Nlc3NmdWxMb2dpbihyZXNwb25zZSkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgU2Vzc2lvbi5jcmVhdGUoZGF0YS5pZCwgZGF0YS51c2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MpO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEudXNlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzZXMgdGhlIHNlc3Npb24gZmFjdG9yeSB0byBzZWUgaWYgYW5cbiAgICAgICAgLy8gYXV0aGVudGljYXRlZCB1c2VyIGlzIGN1cnJlbnRseSByZWdpc3RlcmVkLlxuICAgICAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICEhU2Vzc2lvbi51c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0TG9nZ2VkSW5Vc2VyID0gZnVuY3Rpb24oZnJvbVNlcnZlcikge1xuXG4gICAgICAgICAgICAvLyBJZiBhbiBhdXRoZW50aWNhdGVkIHNlc3Npb24gZXhpc3RzLCB3ZVxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1c2VyIGF0dGFjaGVkIHRvIHRoYXQgc2Vzc2lvblxuICAgICAgICAgICAgLy8gd2l0aCBhIHByb21pc2UuIFRoaXMgZW5zdXJlcyB0aGF0IHdlIGNhblxuICAgICAgICAgICAgLy8gYWx3YXlzIGludGVyZmFjZSB3aXRoIHRoaXMgbWV0aG9kIGFzeW5jaHJvbm91c2x5LlxuXG4gICAgICAgICAgICAvLyBPcHRpb25hbGx5LCBpZiB0cnVlIGlzIGdpdmVuIGFzIHRoZSBmcm9tU2VydmVyIHBhcmFtZXRlcixcbiAgICAgICAgICAgIC8vIHRoZW4gdGhpcyBjYWNoZWQgdmFsdWUgd2lsbCBub3QgYmUgdXNlZC5cblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNBdXRoZW50aWNhdGVkKCkgJiYgZnJvbVNlcnZlciAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS53aGVuKFNlc3Npb24udXNlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE1ha2UgcmVxdWVzdCBHRVQgL3Nlc3Npb24uXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgdXNlciwgY2FsbCBvblN1Y2Nlc3NmdWxMb2dpbiB3aXRoIHRoZSByZXNwb25zZS5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSA0MDEgcmVzcG9uc2UsIHdlIGNhdGNoIGl0IGFuZCBpbnN0ZWFkIHJlc29sdmUgdG8gbnVsbC5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9zZXNzaW9uJykudGhlbihvblN1Y2Nlc3NmdWxMb2dpbikuY2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9naW4gPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9sb2dpbicsIGNyZWRlbnRpYWxzKVxuICAgICAgICAgICAgICAgIC50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zaWdudXAgPSBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL3NpZ251cCcsIHVzZXIpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uKCRyb290U2NvcGUsIEFVVEhfRVZFTlRTKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcblxuICAgICAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uKHNlc3Npb25JZCwgdXNlcikge1xuICAgICAgICAgICAgdGhpcy5pZCA9IHNlc3Npb25JZDtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IHVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IG51bGw7XG4gICAgICAgIH07XG5cbiAgICB9KTtcblxufSkoKTtcblxuXG53aW5kb3cuRXZlbnRFbWl0dGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdWJzY3JpYmVycyA9IHt9O1xufTtcbihmdW5jdGlvbihFRSkge1xuXG4gICAgLy8gVG8gYmUgdXNlZCBsaWtlOlxuICAgIC8vIGluc3RhbmNlT2ZFRS5vbigndG91Y2hkb3duJywgY2hlZXJGbik7XG4gICAgRUUucHJvdG90eXBlLm9uID0gZnVuY3Rpb24oZXZlbnROYW1lLCBldmVudExpc3RlbmVyKSB7XG5cbiAgICAgICAgLy8gSWYgdGhpcyBpbnN0YW5jZSdzIHN1YnNjcmliZXJzIG9iamVjdCBkb2VzIG5vdCB5ZXRcbiAgICAgICAgLy8gaGF2ZSB0aGUga2V5IG1hdGNoaW5nIHRoZSBnaXZlbiBldmVudCBuYW1lLCBjcmVhdGUgdGhlXG4gICAgICAgIC8vIGtleSBhbmQgYXNzaWduIHRoZSB2YWx1ZSBvZiBhbiBlbXB0eSBhcnJheS5cbiAgICAgICAgaWYgKCF0aGlzLnN1YnNjcmliZXJzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgICAgIHRoaXMuc3Vic2NyaWJlcnNbZXZlbnROYW1lXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUHVzaCB0aGUgZ2l2ZW4gbGlzdGVuZXIgZnVuY3Rpb24gaW50byB0aGUgYXJyYXlcbiAgICAgICAgLy8gbG9jYXRlZCBvbiB0aGUgaW5zdGFuY2UncyBzdWJzY3JpYmVycyBvYmplY3QuXG4gICAgICAgIHRoaXMuc3Vic2NyaWJlcnNbZXZlbnROYW1lXS5wdXNoKGV2ZW50TGlzdGVuZXIpO1xuXG4gICAgfTtcblxuICAgIC8vIFRvIGJlIHVzZWQgbGlrZTpcbiAgICAvLyBpbnN0YW5jZU9mRUUuZW1pdCgnY29kZWMnLCAnSGV5IFNuYWtlLCBPdGFjb24gaXMgY2FsbGluZyEnKTtcbiAgICBFRS5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50TmFtZSkge1xuXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBzdWJzY3JpYmVycyB0byB0aGlzIGV2ZW50IG5hbWUsIHdoeSBldmVuP1xuICAgICAgICBpZiAoIXRoaXMuc3Vic2NyaWJlcnNbZXZlbnROYW1lXSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR3JhYiB0aGUgcmVtYWluaW5nIGFyZ3VtZW50cyB0byBvdXIgZW1pdCBmdW5jdGlvbi5cbiAgICAgICAgdmFyIHJlbWFpbmluZ0FyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgICAgICAgLy8gRm9yIGVhY2ggc3Vic2NyaWJlciwgY2FsbCBpdCB3aXRoIG91ciBhcmd1bWVudHMuXG4gICAgICAgIHRoaXMuc3Vic2NyaWJlcnNbZXZlbnROYW1lXS5mb3JFYWNoKGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgICAgICAgICBsaXN0ZW5lci5hcHBseShudWxsLCByZW1haW5pbmdBcmdzKTtcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG59KSh3aW5kb3cuRXZlbnRFbWl0dGVyKTsiLCIrIGZ1bmN0aW9uKCQpIHtcclxuXHJcbiAgICAkKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAvLyBDaGVja3MgZm9yIGllXHJcbiAgICAgICAgdmFyIGlzSUUgPSAhIW5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL01TSUUvaSkgfHwgISFuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9UcmlkZW50LipydjoxMVxcLi8pO1xyXG4gICAgICAgIGlzSUUgJiYgJCgnaHRtbCcpLmFkZENsYXNzKCdpZScpO1xyXG5cclxuICAgICAgICAvLyBDaGVja3MgZm9yIGlPcywgQW5kcm9pZCwgQmxhY2tiZXJyeSwgT3BlcmEgTWluaSwgYW5kIFdpbmRvd3MgbW9iaWxlIGRldmljZXNcclxuICAgICAgICB2YXIgdWEgPSB3aW5kb3dbJ25hdmlnYXRvciddWyd1c2VyQWdlbnQnXSB8fCB3aW5kb3dbJ25hdmlnYXRvciddWyd2ZW5kb3InXSB8fCB3aW5kb3dbJ29wZXJhJ107XHJcbiAgICAgICAgKC9pUGhvbmV8aVBvZHxpUGFkfFNpbGt8QW5kcm9pZHxCbGFja0JlcnJ5fE9wZXJhIE1pbml8SUVNb2JpbGUvKS50ZXN0KHVhKSAmJiAkKCdodG1sJykuYWRkQ2xhc3MoJ3NtYXJ0Jyk7XHJcblxyXG4gICAgfSk7XHJcbn0oalF1ZXJ5KTsiLCIrIGZ1bmN0aW9uKCQpIHtcclxuXHJcbiAgICAkKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAkKFwiW3VpLWpxXVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgc2VsZiA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gZXZhbCgnWycgKyBzZWxmLmF0dHIoJ3VpLW9wdGlvbnMnKSArICddJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoJC5pc1BsYWluT2JqZWN0KG9wdGlvbnNbMF0pKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zWzBdID0gJC5leHRlbmQoe30sIG9wdGlvbnNbMF0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB1aUxvYWQubG9hZChqcF9jb25maWdbc2VsZi5hdHRyKCd1aS1qcScpXSkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNlbGZbc2VsZi5hdHRyKCd1aS1qcScpXS5hcHBseShzZWxmLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfSk7XHJcbn0oalF1ZXJ5KTsiLCIvKipcclxuICogMC4xLjBcclxuICogRGVmZXJyZWQgbG9hZCBqcy9jc3MgZmlsZSwgdXNlZCBmb3IgdWktanEuanMgYW5kIExhenkgTG9hZGluZy5cclxuICogXHJcbiAqIEAgZmxhdGZ1bGwuY29tIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXHJcbiAqIEF1dGhvciB1cmw6IGh0dHA6Ly90aGVtZWZvcmVzdC5uZXQvdXNlci9mbGF0ZnVsbFxyXG4gKi9cclxudmFyIHVpTG9hZCA9IHVpTG9hZCB8fCB7fTtcclxuXHJcbihmdW5jdGlvbigkLCAkZG9jdW1lbnQsIHVpTG9hZCkge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgdmFyIGxvYWRlZCA9IFtdLFxyXG4gICAgICAgIHByb21pc2UgPSBmYWxzZSxcclxuICAgICAgICBkZWZlcnJlZCA9ICQuRGVmZXJyZWQoKTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENoYWluIGxvYWRzIHRoZSBnaXZlbiBzb3VyY2VzXHJcbiAgICAgKiBAcGFyYW0gc3JjcyBhcnJheSwgc2NyaXB0IG9yIGNzc1xyXG4gICAgICogQHJldHVybnMgeyp9IFByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIG9uY2UgdGhlIHNvdXJjZXMgaGFzIGJlZW4gbG9hZGVkLlxyXG4gICAgICovXHJcbiAgICB1aUxvYWQubG9hZCA9IGZ1bmN0aW9uKHNyY3MpIHtcclxuICAgICAgICBzcmNzID0gJC5pc0FycmF5KHNyY3MpID8gc3JjcyA6IHNyY3Muc3BsaXQoL1xccysvKTtcclxuICAgICAgICBpZiAoIXByb21pc2UpIHtcclxuICAgICAgICAgICAgcHJvbWlzZSA9IGRlZmVycmVkLnByb21pc2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICQuZWFjaChzcmNzLCBmdW5jdGlvbihpbmRleCwgc3JjKSB7XHJcbiAgICAgICAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3JjLmluZGV4T2YoJy5jc3MnKSA+PSAwID8gbG9hZENTUyhzcmMpIDogbG9hZFNjcmlwdChzcmMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRHluYW1pY2FsbHkgbG9hZHMgdGhlIGdpdmVuIHNjcmlwdFxyXG4gICAgICogQHBhcmFtIHNyYyBUaGUgdXJsIG9mIHRoZSBzY3JpcHQgdG8gbG9hZCBkeW5hbWljYWxseVxyXG4gICAgICogQHJldHVybnMgeyp9IFByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIG9uY2UgdGhlIHNjcmlwdCBoYXMgYmVlbiBsb2FkZWQuXHJcbiAgICAgKi9cclxuICAgIHZhciBsb2FkU2NyaXB0ID0gZnVuY3Rpb24oc3JjKSB7XHJcbiAgICAgICAgaWYgKGxvYWRlZFtzcmNdKSByZXR1cm4gbG9hZGVkW3NyY10ucHJvbWlzZSgpO1xyXG5cclxuICAgICAgICB2YXIgZGVmZXJyZWQgPSAkLkRlZmVycmVkKCk7XHJcbiAgICAgICAgdmFyIHNjcmlwdCA9ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcclxuICAgICAgICBzY3JpcHQuc3JjID0gc3JjO1xyXG4gICAgICAgIHNjcmlwdC5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzY3JpcHQub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGUpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcclxuICAgICAgICBsb2FkZWRbc3JjXSA9IGRlZmVycmVkO1xyXG5cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIER5bmFtaWNhbGx5IGxvYWRzIHRoZSBnaXZlbiBDU1MgZmlsZVxyXG4gICAgICogQHBhcmFtIGhyZWYgVGhlIHVybCBvZiB0aGUgQ1NTIHRvIGxvYWQgZHluYW1pY2FsbHlcclxuICAgICAqIEByZXR1cm5zIHsqfSBQcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCBvbmNlIHRoZSBDU1MgZmlsZSBoYXMgYmVlbiBsb2FkZWQuXHJcbiAgICAgKi9cclxuICAgIHZhciBsb2FkQ1NTID0gZnVuY3Rpb24oaHJlZikge1xyXG4gICAgICAgIGlmIChsb2FkZWRbaHJlZl0pIHJldHVybiBsb2FkZWRbaHJlZl0ucHJvbWlzZSgpO1xyXG5cclxuICAgICAgICB2YXIgZGVmZXJyZWQgPSAkLkRlZmVycmVkKCk7XHJcbiAgICAgICAgdmFyIHN0eWxlID0gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcclxuICAgICAgICBzdHlsZS5yZWwgPSAnc3R5bGVzaGVldCc7XHJcbiAgICAgICAgc3R5bGUudHlwZSA9ICd0ZXh0L2Nzcyc7XHJcbiAgICAgICAgc3R5bGUuaHJlZiA9IGhyZWY7XHJcbiAgICAgICAgc3R5bGUub25sb2FkID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGUpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgc3R5bGUub25lcnJvciA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGUpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xyXG4gICAgICAgIGxvYWRlZFtocmVmXSA9IGRlZmVycmVkO1xyXG5cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZSgpO1xyXG4gICAgfVxyXG5cclxufSkoalF1ZXJ5LCBkb2N1bWVudCwgdWlMb2FkKTsiLCIrIGZ1bmN0aW9uKCQpIHtcclxuXHJcbiAgICAkKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAvLyBuYXZcclxuICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnW3VpLW5hdl0gYScsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgdmFyICR0aGlzID0gJChlLnRhcmdldCksXHJcbiAgICAgICAgICAgICAgICAkYWN0aXZlO1xyXG4gICAgICAgICAgICAkdGhpcy5pcygnYScpIHx8ICgkdGhpcyA9ICR0aGlzLmNsb3Nlc3QoJ2EnKSk7XHJcblxyXG4gICAgICAgICAgICAkYWN0aXZlID0gJHRoaXMucGFyZW50KCkuc2libGluZ3MoXCIuYWN0aXZlXCIpO1xyXG4gICAgICAgICAgICAkYWN0aXZlICYmICRhY3RpdmUudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpLmZpbmQoJz4gdWw6dmlzaWJsZScpLnNsaWRlVXAoMjAwKTtcclxuXHJcbiAgICAgICAgICAgICgkdGhpcy5wYXJlbnQoKS5oYXNDbGFzcygnYWN0aXZlJykgJiYgJHRoaXMubmV4dCgpLnNsaWRlVXAoMjAwKSkgfHwgJHRoaXMubmV4dCgpLnNsaWRlRG93bigyMDApO1xyXG4gICAgICAgICAgICAkdGhpcy5wYXJlbnQoKS50b2dnbGVDbGFzcygnYWN0aXZlJyk7XHJcblxyXG4gICAgICAgICAgICAkdGhpcy5uZXh0KCkuaXMoJ3VsJykgJiYgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH0pO1xyXG59KGpRdWVyeSk7IiwiKyBmdW5jdGlvbigkKSB7XHJcblxyXG4gICAgJChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ1t1aS10b2dnbGUtY2xhc3NdJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQoZS50YXJnZXQpO1xyXG4gICAgICAgICAgICAkdGhpcy5hdHRyKCd1aS10b2dnbGUtY2xhc3MnKSB8fCAoJHRoaXMgPSAkdGhpcy5jbG9zZXN0KCdbdWktdG9nZ2xlLWNsYXNzXScpKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBjbGFzc2VzID0gJHRoaXMuYXR0cigndWktdG9nZ2xlLWNsYXNzJykuc3BsaXQoJywnKSxcclxuICAgICAgICAgICAgICAgIHRhcmdldHMgPSAoJHRoaXMuYXR0cigndGFyZ2V0JykgJiYgJHRoaXMuYXR0cigndGFyZ2V0Jykuc3BsaXQoJywnKSkgfHwgQXJyYXkoJHRoaXMpLFxyXG4gICAgICAgICAgICAgICAga2V5ID0gMDtcclxuICAgICAgICAgICAgJC5lYWNoKGNsYXNzZXMsIGZ1bmN0aW9uKGluZGV4LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRhcmdldCA9IHRhcmdldHNbKHRhcmdldHMubGVuZ3RoICYmIGtleSldO1xyXG4gICAgICAgICAgICAgICAgJCh0YXJnZXQpLnRvZ2dsZUNsYXNzKGNsYXNzZXNbaW5kZXhdKTtcclxuICAgICAgICAgICAgICAgIGtleSsrO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHRoaXMudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KGpRdWVyeSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsaXN0TWFuYWdlci5hbGwnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbGlzdE1hbmFnZXIvYWxsL2FsbC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2FsbEN0cmwnLFxuICAgICAgICB1cmw6ICcvbGlzdE1hbmFnZXInLFxuICAgICAgICAvLyBkYXRhOiB7XG4gICAgICAgIC8vICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgLy8gfSxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgbGV0dGVyczogKGxjRmFjdG9yeSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBsY0ZhY3RvcnkuZ2V0TGV0dGVycyh7fSkudGhlbihsZXR0ZXJzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxldHRlcnNcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignYWxsQ3RybCcsICgkc2NvcGUsIGxjRmFjdG9yeSwgbGV0dGVycywgJHN0YXRlKSA9PiB7XG4gICAgJHNjb3BlLmxldHRlcnMgPSBsZXR0ZXJzXG4gICAgJHNjb3BlLnN0YXRlID0ge1xuICAgICAgICAxOiAnTmV3JyxcbiAgICAgICAgMjogJ1Jldmlld2VkJyxcbiAgICAgICAgMzogJ0FtZW5kZWQnLFxuICAgICAgICA0OiAnRnJvemVuJyxcbiAgICAgICAgNTogJ1BlbmRpbmcgVXBkYXRlJ1xuICAgIH1cbiAgICAkc2NvcGUudHJhbnNpdGlvbiA9IChsY051bWJlcikgPT4ge1xuICAgICAgICAkc3RhdGUuZ28oJ3NpbmdsZUxjJywge1xuICAgICAgICAgICAgbGNOdW1iZXI6IGxjTnVtYmVyXG4gICAgICAgIH0pXG4gICAgfVxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsaXN0TWFuYWdlci5hbWVuZGVkJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xpc3RNYW5hZ2VyL2FtZW5kZWQvYW1lbmRlZC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2FtZW5kZWRDdHJsJyxcbiAgICAgICAgdXJsOiAnL2xpc3RNYW5hZ2VyL2FtZW5kZWQnLFxuICAgICAgICAvLyBkYXRhOiB7XG4gICAgICAgIC8vICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgLy8gfSxcbiAgICAgICAgcmVzb2x2ZToge31cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdhbWVuZGVkQ3RybCcsICgkc2NvcGUsIGxjRmFjdG9yeSwgbGV0dGVycywgJHN0YXRlKSA9PiB7XG4gICAgJHNjb3BlLmRpc3BsYXlMZXR0ZXJzID0gJHNjb3BlLmxldHRlcnMuZmlsdGVyKGxldHRlciA9PiB7XG4gICAgICAgIHJldHVybiBsZXR0ZXIuc3RhdGUgPT09IDNcbiAgICB9KVxuICAgICRzdGF0ZS50cmFuc2l0aW9uID0gKGxjX251bWJlcikgPT4ge1xuICAgICAgICAkc3RhdGUuZ28oJ3NpbmdsZUxjJywge1xuICAgICAgICAgICAgbGNfbnVtYmVyOiBsY19udW1iZXJcbiAgICAgICAgfSlcbiAgICB9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xpc3RNYW5hZ2VyLmZyb3plbicsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9saXN0TWFuYWdlci9mcm96ZW4vZnJvemVuLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnZnJvemVuQ3RybCcsXG4gICAgICAgIHVybDogJy9saXN0TWFuYWdlci9mcm96ZW4nLFxuICAgICAgICBwYXJlbnQ6ICdsaXN0TWFuYWdlcicsXG4gICAgICAgIC8vIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICAvLyB9LFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBsZXR0ZXJzOiAobGNGYWN0b3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxjRmFjdG9yeS5nZXRMZXR0ZXJzKHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IDRcbiAgICAgICAgICAgICAgICB9KS50aGVuKGxldHRlcnMgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGV0dGVyc1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdmcm96ZW5DdHJsJywgKCRzY29wZSwgbGNGYWN0b3J5LCBsZXR0ZXJzLCAkc3RhdGUpID0+IHtcbiAgICAkc2NvcGUuZGlzcGxheUxldHRlcnMgPSAkc2NvcGUubGV0dGVycy5maWx0ZXIobGV0dGVyID0+IHtcbiAgICAgICAgcmV0dXJuIGxldHRlci5zdGF0ZSA9PT0gNFxuICAgIH0pXG4gICAgJHN0YXRlLnRyYW5zaXRpb24gPSAobGNfbnVtYmVyKSA9PiB7XG4gICAgICAgICRzdGF0ZS5nbygnc2luZ2xlTGMnLCB7XG4gICAgICAgICAgICBsY19udW1iZXI6IGxjX251bWJlclxuICAgICAgICB9KVxuICAgIH1cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbGlzdE1hbmFnZXIubmV3TGNzJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xpc3RNYW5hZ2VyL25ld0xjcy9uZXdMY3MuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICduZXdMY3NDdHJsJyxcbiAgICAgICAgdXJsOiAnL2xpc3RNYW5hZ2VyL25ld0xjcycsXG4gICAgICAgIHBhcmVudDogJ2xpc3RNYW5hZ2VyJyxcbiAgICAgICAgLy8gZGF0YToge1xuICAgICAgICAvLyAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIC8vIH0sXG4gICAgICAgIHJlc29sdmU6IHt9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignbmV3TGNzQ3RybCcsICgkc2NvcGUsIGxjRmFjdG9yeSwgbGV0dGVycywgJHN0YXRlKSA9PiB7XG4gICAgJHNjb3BlLmRpc3BsYXlMZXR0ZXJzID0gJHNjb3BlLmxldHRlcnMuZmlsdGVyKGxldHRlciA9PiB7XG4gICAgICAgIHJldHVybiBsZXR0ZXIuc3RhdGUgPT09IDFcbiAgICB9KVxuICAgICRzY29wZS5zdGF0ZSA9IHtcbiAgICAgICAgMTogJ05ldycsXG4gICAgICAgIDI6ICdSZXZpZXdlZCcsXG4gICAgICAgIDM6ICdBbWVuZGVkJyxcbiAgICAgICAgNDogJ0Zyb3plbicsXG4gICAgICAgIDU6ICdQZW5kaW5nIFVwZGF0ZSdcbiAgICB9XG4gICAgJHN0YXRlLnRyYW5zaXRpb24gPSAobGNfbnVtYmVyKSA9PiB7XG4gICAgICAgICRzdGF0ZS5nbygnc2luZ2xlTGMnLCB7XG4gICAgICAgICAgICBsY19udW1iZXI6IGxjX251bWJlclxuICAgICAgICB9KVxuICAgIH1cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbGlzdE1hbmFnZXIucmV2aWV3ZWQnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbGlzdE1hbmFnZXIvcmV2aWV3ZWQvcmV2aWV3ZWQuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdyZXZpZXdlZEN0cmwnLFxuICAgICAgICB1cmw6ICcvbGlzdE1hbmFnZXIvcmV2aWV3ZWQnLFxuICAgICAgICBwYXJlbnQ6ICdsaXN0TWFuYWdlcicsXG4gICAgICAgIC8vIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICAvLyB9LFxuICAgICAgICByZXNvbHZlOiB7fVxuICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ3Jldmlld2VkQ3RybCcsICgkc2NvcGUsIGxjRmFjdG9yeSwgbGV0dGVycywgJHN0YXRlKSA9PiB7XG4gICAgJHNjb3BlLmRpc3BsYXlMZXR0ZXJzID0gJHNjb3BlLmxldHRlcnMuZmlsdGVyKGxldHRlciA9PiB7XG4gICAgICAgIHJldHVybiBsZXR0ZXIuc3RhdGUgPT09IDJcbiAgICB9KVxuICAgICRzdGF0ZS50cmFuc2l0aW9uID0gKGxjX251bWJlcikgPT4ge1xuICAgICAgICAkc3RhdGUuZ28oJ3NpbmdsZUxjJywge1xuICAgICAgICAgICAgbGNfbnVtYmVyOiBsY19udW1iZXJcbiAgICAgICAgfSlcbiAgICB9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xpc3RNYW5hZ2VyLnVwZGF0ZWQnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbGlzdE1hbmFnZXIvdXBkYXRlZC91cGRhdGVkLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAndXBkYXRlZEN0cmwnLFxuICAgICAgICB1cmw6ICcvbGlzdE1hbmFnZXIvdXBkYXRlZCcsXG4gICAgICAgIC8vIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICAvLyB9LFxuICAgICAgICByZXNvbHZlOiB7fVxuICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ3VwZGF0ZWRDdHJsJywgKCRzY29wZSwgbGNGYWN0b3J5LCBsZXR0ZXJzLCAkc3RhdGUpID0+IHtcbiAgICAkc2NvcGUuZGlzcGxheUxldHRlcnMgPSAkc2NvcGUubGV0dGVycy5maWx0ZXIobGV0dGVyID0+IHtcbiAgICAgICAgcmV0dXJuIGxldHRlci5zdGF0ZSA9PT0gNVxuICAgIH0pXG4gICAgJHN0YXRlLnRyYW5zaXRpb24gPSAobGNfbnVtYmVyKSA9PiB7XG4gICAgICAgICRzdGF0ZS5nbygnc2luZ2xlTGMnLCB7XG4gICAgICAgICAgICBsY19udW1iZXI6IGxjX251bWJlclxuICAgICAgICB9KVxuICAgIH1cbn0pOyIsImFwcC5kaXJlY3RpdmUoJ3NpZGViYXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgQVVUSF9FVkVOVFMsICRzdGF0ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9fY29tbW9uL2RpcmVjdGl2ZXMvYXNpZGUvYXNpZGUuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBsY0ZhY3RvcnkpIHtcbiAgICAgICAgICAgIC8vIGxjRmFjdG9yeS5nZXRMZXR0ZXJDb3VudCgpLnRoZW4obGV0dGVyQ291bnQgPT4ge1xuICAgICAgICAgICAgLy8gICAgIHNjb3BlLmxldHRlckNvdW50ID0gbGV0dGVyQ291bnRcbiAgICAgICAgICAgIC8vIH0pXG4gICAgICAgIH1cblxuICAgIH07XG5cbn0pOyIsImFwcC5kaXJlY3RpdmUoJ2Zvb3RlcicsIGZ1bmN0aW9uKCRzdGF0ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9fY29tbW9uL2RpcmVjdGl2ZXMvZm9vdGVyL2Zvb3Rlci5odG1sJ1xuICAgIH07XG5cbn0pOyIsImFwcC5kaXJlY3RpdmUoJ25hdmJhcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCBBVVRIX0VWRU5UUywgJHN0YXRlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL19jb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSkge1xuXG4gICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcblxuICAgICAgICAgICAgc2NvcGUuaXNMb2dnZWRJbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHNldFVzZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IHVzZXI7XG5cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVVc2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UubG9nb3V0KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdsb2dpbicpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHNldFVzZXIoKTtcblxuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MsIHNldFVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9nb3V0U3VjY2VzcywgcmVtb3ZlVXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgcmVtb3ZlVXNlcik7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSk7Il19
