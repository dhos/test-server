'use strict';

window.app = angular.module('elite-lc-portal', ['fsaPreBuilt', 'ui.router', 'ui.bootstrap', 'ngMaterial', 'ngFileUpload', 'ngAnimate']);

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
    $stateProvider.state('amendLc', {
        templateUrl: 'js/amendLc/amendLc.html',
        controller: 'amendLcCtrl',
        url: '/amend/:lc_number',
        resolve: {
            letter: function letter(lcFactory, $stateParams) {
                return lcFactory.getSingleLetter($stateParams.lc_number).then(function (letter) {
                    return letter;
                });
            }
        }
    });
});

app.controller('amendLcCtrl', function ($scope, lcFactory, countryFactory, userFactory, bankFactory, letter, $state) {
    $scope.letter = letter;

    $scope.updateLc = function () {
        console.log($scope.updatedFile);
        lcFactory.updateLetterFile($scope.letter, $scope.updatedFile).then(function (letter) {
            $state.go('singleLc', {
                lc_number: letter.lc_number
            });
        });
    };

    //get banks
    bankFactory.getBanks({}).then(function (banks) {
        $scope.banks = banks;
    });
    //get countries
    countryFactory.getCountries({}).then(function (countries) {
        $scope.countries = countries;
    });
    //get picusers
    userFactory.getUsers({
        role: 1
    }).then(function (picUsers) {
        $scope.picUsers = picUsers;
    });
    //get cspusers
    userFactory.getUsers({
        role: 2
    }).then(function (cspUsers) {
        $scope.cspUsers = cspUsers;
    });
});
app.config(function ($stateProvider) {
    $stateProvider.state('amendList', {
        templateUrl: 'js/amendList/amendList.html',
        controller: 'amendListCtrl',
        url: '/amendList',
        resolve: {
            amended: function amended(lcFactory) {
                return lcFactory.getLetters({
                    state: 3
                }).then(function (amended) {
                    return amended;
                });
            }
        }
    });
});

app.controller('amendListCtrl', function ($scope, amended, $state, countryFactory, userFactory, bankFactory) {
    //get banks
    $scope.banks = {};
    bankFactory.getBanks({}).then(function (banks) {
        banks.forEach(function (bank) {
            $scope.banks[bank.id] = bank.name;
        });
    });
    //get countries
    $scope.countries = {};
    countryFactory.getCountries({}).then(function (countries) {
        countries.forEach(function (country) {
            $scope.countries[country.id] = country.name;
        });
    });

    //get picusers
    $scope.picUsers = {};
    userFactory.getUsers({
        role: 1
    }).then(function (picUsers) {
        picUsers.forEach(function (user) {
            $scope.picUsers[user.id] = user.username;
        });
    });
    //get cspusers
    $scope.cspUsers = {};
    userFactory.getUsers({
        role: 2
    }).then(function (cspUsers) {
        cspUsers.forEach(function (user) {
            $scope.cspUsers[user.id] = user.username;
        });
    });
    $scope.letters = amended;
    $scope.transition = function (lc_number) {
        $state.go('amendLc', {
            lc_number: lc_number
        });
    };
});
app.config(function ($stateProvider) {
    $stateProvider.state('archive', {
        templateUrl: 'js/archive/archive.html',
        controller: 'archiveCtrl',
        url: '/archive',
        resolve: {
            archivedLetters: function archivedLetters(lcFactory) {
                return lcFactory.getLetters({
                    archived: true
                }).then(function (archived) {
                    return archived;
                });
            }
        }
    });
});

app.controller('archiveCtrl', function ($scope, archived) {
    $scope.letters = archived;
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
    $stateProvider.state('createLc', {
        templateUrl: 'js/createLc/createLc.html',
        controller: 'createLcCtrl',
        url: '/createLc'
    });
});

app.controller('createLcCtrl', function ($scope, lcFactory, countryFactory, userFactory, bankFactory) {
    //find the users that are clients,
    //find the users that are csp/pic
    $scope.createLc = function () {
        lcFactory.createLetter($scope.letter, $scope.file).then(function (letter) {
            $state.go('singleLc', {
                lc_number: letter.lc_number
            });
        });
    };

    //get banks
    bankFactory.getBanks({}).then(function (banks) {
        $scope.banks = banks;
    });
    //get countries
    countryFactory.getCountries({}).then(function (countries) {
        $scope.countries = countries;
    });
    //get picusers
    userFactory.getUsers({
        role: 1
    }).then(function (picUsers) {
        $scope.picUsers = picUsers;
    });
    //get cspusers
    userFactory.getUsers({
        role: 2
    }).then(function (cspUsers) {
        $scope.cspUsers = cspUsers;
    });
});
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
        url: '/',
        resolve: {
            user: function user(AuthService, $state) {
                AuthService.getLoggedInUser().then(function (user) {
                    if (user) $state.go('dashboard');
                });
            }
        }
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
    $stateProvider.state('drafts', {
        templateUrl: 'js/drafts/drafts.html',
        controller: 'draftsCtrl',
        url: '/drafts',
        resolve: {
            draftsdLetters: function draftsdLetters(lcFactory) {
                return lcFactory.getLetters({
                    draft: true
                }).then(function (drafts) {
                    return drafts;
                });
            }
        }
    });
});

app.controller('draftsCtrl', function ($scope, drafts) {
    $scope.letters = drafts;
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

app.factory('bankFactory', function ($http, $q) {
    var d = {};
    //Fetches
    d.getBanks = function (query) {
        return $http.get('/api/banks/', {
            params: query
        }).then(function (response) {
            return response.data;
        }).catch(function (err) {
            return $q.reject({
                message: err
            });
        });
    };
    d.getSingleBank = function (id) {
        return $http.get('/api/banks/' + id).then(function (response) {
            return response.data;
        }).catch(function (err) {
            return $q.reject({
                message: err
            });
        });
    };

    //End Fetches

    //Sets
    d.createBank = function (bank) {
        return $http.post('/api/banks/').then(function (response) {
            return response.data;
        }).catch(function (err) {
            return $q.reject({
                message: err
            });
        });
    };

    //End Sets

    //Updates
    d.updateBank = function (bank) {
        return $http.put('/api/banks/' + bank.id).then(function (response) {
            return response.data;
        }).catch(function (err) {
            return $q.reject({
                message: err
            });
        });
    };

    //End Updates

    //Deletes
    d.deleteBank = function (query) {
        return $http.delete('/api/banks/', {
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
app.factory('countryFactory', function ($http, $q) {
    var d = {};
    //Fetches
    d.getCountries = function (query) {
        return $http.get('/api/countries/', {
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
    d.createLetter = function (letter, file) {
        var file = file;
        console.log(letter);
        var fd = new FormData();
        fd.append('file', file);
        fd.append('newLetter', angular.toJson(letter));
        return $http.post('/api/lc/', fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).then(function (response) {
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
    d.updateLetterFile = function (letter, file) {
        var file = file;
        console.log(letter);
        var fd = new FormData();
        fd.append('file', file);
        fd.append('updates', angular.toJson(letter));
        return $http.put('/api/lc/amend', fd, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        }).then(function (response) {
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

    userFactory.getUsers = function (query) {
        return $http.get('/api/users/', {
            params: query
        }).then(function (response) {
            return response.data;
        }).catch(function (err) {
            return $q.reject({
                message: err
            });
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
    app.factory('Socket', function ($rootScope) {
        if (!window.io) throw new Error('socket.io not found!');
        var socket = io.connect(window.location.origin);

        return {
            on: function on(eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function emit(eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
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
app.directive('chat', function ($rootScope, AuthService, AUTH_EVENTS, $state) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/_common/directives/chat/chat.html',
        link: function link(scope, Socket) {
            scope.chat = false;
            scope.open = function () {
                console.log(scope.chat);
                scope.chat = !scope.chat;
            };
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFtZW5kTGMvYW1lbmRMYy5qcyIsImFtZW5kTGlzdC9hbWVuZExpc3QuanMiLCJhcmNoaXZlL2FyY2hpdmUuanMiLCJjbGF1c2VNYW5hZ2VyL2NsYXVzZU1hbmFnZXIuanMiLCJjcmVhdGVMYy9jcmVhdGVMYy5qcyIsImRhc2hib2FyZC9kYXNoYm9hcmQuanMiLCJsYW5kaW5nL2xhbmRpbmcuanMiLCJkcmFmdHMvZHJhZnRzLmpzIiwibGlzdE1hbmFnZXIvbGlzdE1hbmFnZXIuanMiLCJzaW5nbGVMYy9zaW5nbGVMYy5qcyIsIl9jb21tb24vZmFjdG9yaWVzL2JhbmtGYWN0b3J5LmpzIiwiX2NvbW1vbi9mYWN0b3JpZXMvY291bnRyeUZhY3RvcnkuanMiLCJfY29tbW9uL2ZhY3Rvcmllcy9sY0ZhY3RvcnkuanMiLCJfY29tbW9uL2ZhY3Rvcmllcy91c2VyRmFjdG9yeS5qcyIsIl9jb21tb24vcHJlYnVpbHQvZnNhLXByZS1idWlsdC5qcyIsIl9jb21tb24vcHJlYnVpbHQvdWktY2xpZW50LmpzIiwiX2NvbW1vbi9wcmVidWlsdC91aS1qcC5qcyIsIl9jb21tb24vcHJlYnVpbHQvdWktbG9hZC5qcyIsIl9jb21tb24vcHJlYnVpbHQvdWktbmF2LmpzIiwiX2NvbW1vbi9wcmVidWlsdC91aS10b2dnbGUuanMiLCJsaXN0TWFuYWdlci9hbGwvYWxsLmpzIiwibGlzdE1hbmFnZXIvYW1lbmRlZC9hbWVuZGVkLmpzIiwibGlzdE1hbmFnZXIvZnJvemVuL2Zyb3plbi5qcyIsImxpc3RNYW5hZ2VyL25ld0xjcy9uZXdMY3MuanMiLCJsaXN0TWFuYWdlci9yZXZpZXdlZC9yZXZpZXdlZC5qcyIsImxpc3RNYW5hZ2VyL3VwZGF0ZWQvdXBkYXRlZC5qcyIsIl9jb21tb24vZGlyZWN0aXZlcy9jaGF0L2NoYXQuanMiLCJfY29tbW9uL2RpcmVjdGl2ZXMvZm9vdGVyL2Zvb3Rlci5qcyIsIl9jb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmpzIl0sIm5hbWVzIjpbIndpbmRvdyIsImFwcCIsImFuZ3VsYXIiLCJtb2R1bGUiLCJjb25maWciLCIkdXJsUm91dGVyUHJvdmlkZXIiLCIkbG9jYXRpb25Qcm92aWRlciIsIiRjb21waWxlUHJvdmlkZXIiLCJodG1sNU1vZGUiLCJhSHJlZlNhbml0aXphdGlvbldoaXRlbGlzdCIsIm90aGVyd2lzZSIsIndoZW4iLCJsb2NhdGlvbiIsInJlbG9hZCIsInJ1biIsIiRyb290U2NvcGUiLCJBdXRoU2VydmljZSIsIiRzdGF0ZSIsImRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGgiLCJzdGF0ZSIsImRhdGEiLCJhdXRoZW50aWNhdGUiLCIkb24iLCJldmVudCIsInRvU3RhdGUiLCJ0b1BhcmFtcyIsImlzQXV0aGVudGljYXRlZCIsInByZXZlbnREZWZhdWx0IiwiZ2V0TG9nZ2VkSW5Vc2VyIiwidGhlbiIsInVzZXIiLCJ0cmFuc2l0aW9uVG8iLCJuYW1lIiwiJHN0YXRlUHJvdmlkZXIiLCJ0ZW1wbGF0ZVVybCIsImNvbnRyb2xsZXIiLCJ1cmwiLCJyZXNvbHZlIiwibGV0dGVyIiwibGNGYWN0b3J5IiwiJHN0YXRlUGFyYW1zIiwiZ2V0U2luZ2xlTGV0dGVyIiwibGNfbnVtYmVyIiwiJHNjb3BlIiwiY291bnRyeUZhY3RvcnkiLCJ1c2VyRmFjdG9yeSIsImJhbmtGYWN0b3J5IiwidXBkYXRlTGMiLCJjb25zb2xlIiwibG9nIiwidXBkYXRlZEZpbGUiLCJ1cGRhdGVMZXR0ZXJGaWxlIiwiZ28iLCJnZXRCYW5rcyIsImJhbmtzIiwiZ2V0Q291bnRyaWVzIiwiY291bnRyaWVzIiwiZ2V0VXNlcnMiLCJyb2xlIiwicGljVXNlcnMiLCJjc3BVc2VycyIsImFtZW5kZWQiLCJnZXRMZXR0ZXJzIiwiZm9yRWFjaCIsImJhbmsiLCJpZCIsImNvdW50cnkiLCJ1c2VybmFtZSIsImxldHRlcnMiLCJ0cmFuc2l0aW9uIiwiYXJjaGl2ZWRMZXR0ZXJzIiwiYXJjaGl2ZWQiLCJjcmVhdGVMYyIsImNyZWF0ZUxldHRlciIsImZpbGUiLCJ1cGxvYWRzIiwiYW1tZW5kbWVudHMiLCJkYXRlIiwiRGF0ZSIsIm5vdyIsImNsaWVudCIsInBzciIsImNyYyIsImRyYWZ0IiwiZmluRG9jIiwiZmluRGF0ZSIsInRlc3QiLCJsZXR0ZXJUb0JlQ3JlYXRlZCIsImFkZExjQXR0YWNobWVudCIsImZpbGVUb0JlQWRkZWQiLCJsY0lkIiwic2V0TGNUb0FtbWVuZGVkIiwibGV0dGVyVG9CZVVwZGF0ZWQiLCJzdGF0dXMiLCJ1cGRhdGVMZXR0ZXIiLCJzZXRMY1RvUmV2aWV3ZWQiLCJzZXRMY1RvRnJvemVuIiwic2V0TGNUb0FyY2hpdmVkIiwibG9naW4iLCJlcnJvciIsImNyZWF0ZVVzZXIiLCJwYXNzd29yZCIsInNlbmRMb2dpbiIsImxvZ2luSW5mbyIsImRyYWZ0c2RMZXR0ZXJzIiwiZHJhZnRzIiwiYWJzdHJhY3QiLCJsY051bWJlciIsImFwcHJvdmVkIiwiY29udGVudCIsImxlbmd0aCIsInJlamVjdGVkIiwicmVmZXJlbmNlIiwiYW1lbmRtZW50cyIsImxhc3RNb2RpZmllZCIsImpRdWVyeSIsImV4dGVuZCIsIk9iamVjdCIsImtleXMiLCJrZXkiLCJzdGF0ZXMiLCJhcHByb3ZlQW1lbmRtZW50IiwicmVqZWN0QW1lbmRtZW50IiwiZWRpdEFtZW5kbWVudCIsImV4cGFuZGVkIiwiYW1tZW5kZWQiLCJ0b3RhbCIsInN1Ym1pdERyYWZ0IiwiZmFjdG9yeSIsIiRodHRwIiwiJHEiLCJkIiwicXVlcnkiLCJnZXQiLCJwYXJhbXMiLCJyZXNwb25zZSIsImNhdGNoIiwicmVqZWN0IiwibWVzc2FnZSIsImVyciIsImdldFNpbmdsZUJhbmsiLCJjcmVhdGVCYW5rIiwicG9zdCIsInVwZGF0ZUJhbmsiLCJwdXQiLCJkZWxldGVCYW5rIiwiZGVsZXRlIiwiZ2V0U2luZ2xlQ291bnRyeSIsImNyZWF0ZUNvdW50cnkiLCJDb3VudHJ5IiwidXBkYXRlQ291bnRyeSIsImRlbGV0ZUNvdW50cnkiLCJnZXRMZXR0ZXJDb3VudCIsImZkIiwiRm9ybURhdGEiLCJhcHBlbmQiLCJ0b0pzb24iLCJ0cmFuc2Zvcm1SZXF1ZXN0IiwiaWRlbnRpdHkiLCJoZWFkZXJzIiwidW5kZWZpbmVkIiwiYm9keSIsInVwZGF0ZXMiLCJkZWxldGVMZXR0ZXIiLCJjcmVkZW50aWFscyIsImVtYWlsIiwidXBkYXRlVXNlciIsImdldFVzZXJCeUlkIiwiRXJyb3IiLCJpbyIsInNvY2tldCIsImNvbm5lY3QiLCJvcmlnaW4iLCJvbiIsImV2ZW50TmFtZSIsImNhbGxiYWNrIiwiYXJncyIsImFyZ3VtZW50cyIsIiRhcHBseSIsImFwcGx5IiwiZW1pdCIsImNvbnN0YW50IiwibG9naW5TdWNjZXNzIiwibG9naW5GYWlsZWQiLCJsb2dvdXRTdWNjZXNzIiwic2Vzc2lvblRpbWVvdXQiLCJub3RBdXRoZW50aWNhdGVkIiwibm90QXV0aG9yaXplZCIsIkFVVEhfRVZFTlRTIiwic3RhdHVzRGljdCIsInJlc3BvbnNlRXJyb3IiLCIkYnJvYWRjYXN0IiwiJGh0dHBQcm92aWRlciIsImludGVyY2VwdG9ycyIsInB1c2giLCIkaW5qZWN0b3IiLCJzZXJ2aWNlIiwiU2Vzc2lvbiIsIm9uU3VjY2Vzc2Z1bExvZ2luIiwiY3JlYXRlIiwiZnJvbVNlcnZlciIsInNpZ251cCIsImxvZ291dCIsImRlc3Ryb3kiLCJzZWxmIiwic2Vzc2lvbklkIiwiRXZlbnRFbWl0dGVyIiwic3Vic2NyaWJlcnMiLCJFRSIsInByb3RvdHlwZSIsImV2ZW50TGlzdGVuZXIiLCJyZW1haW5pbmdBcmdzIiwic2xpY2UiLCJjYWxsIiwibGlzdGVuZXIiLCIkIiwiaXNJRSIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsIm1hdGNoIiwiYWRkQ2xhc3MiLCJ1YSIsImVhY2giLCJvcHRpb25zIiwiZXZhbCIsImF0dHIiLCJpc1BsYWluT2JqZWN0IiwidWlMb2FkIiwibG9hZCIsImpwX2NvbmZpZyIsIiRkb2N1bWVudCIsImxvYWRlZCIsInByb21pc2UiLCJkZWZlcnJlZCIsIkRlZmVycmVkIiwic3JjcyIsImlzQXJyYXkiLCJzcGxpdCIsImluZGV4Iiwic3JjIiwiaW5kZXhPZiIsImxvYWRDU1MiLCJsb2FkU2NyaXB0Iiwic2NyaXB0IiwiY3JlYXRlRWxlbWVudCIsIm9ubG9hZCIsImUiLCJvbmVycm9yIiwiYXBwZW5kQ2hpbGQiLCJocmVmIiwic3R5bGUiLCJyZWwiLCJ0eXBlIiwiaGVhZCIsImRvY3VtZW50IiwiJHRoaXMiLCJ0YXJnZXQiLCIkYWN0aXZlIiwiaXMiLCJjbG9zZXN0IiwicGFyZW50Iiwic2libGluZ3MiLCJ0b2dnbGVDbGFzcyIsImZpbmQiLCJzbGlkZVVwIiwiaGFzQ2xhc3MiLCJuZXh0Iiwic2xpZGVEb3duIiwiY2xhc3NlcyIsInRhcmdldHMiLCJBcnJheSIsInZhbHVlIiwiZGlzcGxheUxldHRlcnMiLCJmaWx0ZXIiLCJkaXJlY3RpdmUiLCJyZXN0cmljdCIsInNjb3BlIiwibGluayIsIlNvY2tldCIsImNoYXQiLCJvcGVuIiwiaXNMb2dnZWRJbiIsInNldFVzZXIiLCJyZW1vdmVVc2VyIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFDQUEsT0FBQUMsR0FBQSxHQUFBQyxRQUFBQyxNQUFBLENBQUEsaUJBQUEsRUFBQSxDQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsY0FBQSxFQUFBLFlBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxDQUFBLENBQUE7O0FBRUFGLElBQUFHLE1BQUEsQ0FBQSxVQUFBQyxrQkFBQSxFQUFBQyxpQkFBQSxFQUFBQyxnQkFBQSxFQUFBO0FBQ0E7QUFDQUQsc0JBQUFFLFNBQUEsQ0FBQSxJQUFBO0FBQ0FELHFCQUFBRSwwQkFBQSxDQUFBLDJDQUFBO0FBQ0E7QUFDQUosdUJBQUFLLFNBQUEsQ0FBQSxHQUFBO0FBQ0E7QUFDQUwsdUJBQUFNLElBQUEsQ0FBQSxpQkFBQSxFQUFBLFlBQUE7QUFDQVgsZUFBQVksUUFBQSxDQUFBQyxNQUFBO0FBQ0EsS0FGQTtBQUdBLENBVkE7O0FBWUE7QUFDQVosSUFBQWEsR0FBQSxDQUFBLFVBQUFDLFVBQUEsRUFBQUMsV0FBQSxFQUFBQyxNQUFBLEVBQUE7O0FBRUE7QUFD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SyxZQUFBSCxjQUFBLEVBQUFrRyxVQUFBO0FBRUE7O0FBcENBLEtBQUE7QUF3Q0EsQ0F6Q0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnZWxpdGUtbGMtcG9ydGFsJywgWydmc2FQcmVCdWlsdCcsICd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nTWF0ZXJpYWwnLCAnbmdGaWxlVXBsb2FkJywgJ25nQW5pbWF0ZSddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbigkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98bG9jYWx8ZGF0YXxjaHJvbWUtZXh0ZW5zaW9uKTovKTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG4gICAgLy8gVHJpZ2dlciBwYWdlIHJlZnJlc2ggd2hlbiBhY2Nlc3NpbmcgYW4gT0F1dGggcm91dGVcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIud2hlbignL2F1dGgvOnByb3ZpZGVyJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9KTtcbn0pO1xuXG4vLyBUaGlzIGFwcC5ydW4gaXMgZm9yIGNvbnRyb2xsaW5nIGFjY2VzcyB0byBzcGVjaWZpYyBzdGF0ZXMuXG5hcHAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgIC8vIFRoZSBnaXZlbiBzdGF0ZSByZXF1aXJlcyBhbiBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAgdmFyIGRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGggPSBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmF1dGhlbnRpY2F0ZTtcbiAgICB9O1xuXG4gICAgLy8gJHN0YXRlQ2hhbmdlU3RhcnQgaXMgYW4gZXZlbnQgZmlyZWRcbiAgICAvLyB3aGVuZXZlciB0aGUgcHJvY2VzcyBvZiBjaGFuZ2luZyBhIHN0YXRlIGJlZ2lucy5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMpIHtcblxuICAgICAgICBpZiAoIWRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGgodG9TdGF0ZSkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBkZXN0aW5hdGlvbiBzdGF0ZSBkb2VzIG5vdCByZXF1aXJlIGF1dGhlbnRpY2F0aW9uXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgICAgICAvLyBUaGUgdXNlciBpcyBhdXRoZW50aWNhdGVkLlxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbmNlbCBuYXZpZ2F0aW5nIHRvIG5ldyBzdGF0ZS5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgIC8vIElmIGEgdXNlciBpcyByZXRyaWV2ZWQsIHRoZW4gcmVuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb25cbiAgICAgICAgICAgIC8vICh0aGUgc2Vjb25kIHRpbWUsIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpIHdpbGwgd29yaylcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4sIGdvIHRvIFwibG9naW5cIiBzdGF0ZS5cbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLnRyYW5zaXRpb25Ubyh0b1N0YXRlLm5hbWUsIHRvUGFyYW1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLnRyYW5zaXRpb25UbygnaG9tZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2FtZW5kTGMnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvYW1lbmRMYy9hbWVuZExjLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnYW1lbmRMY0N0cmwnLFxuICAgICAgICB1cmw6ICcvYW1lbmQvOmxjX251bWJlcicsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIGxldHRlcjogKGxjRmFjdG9yeSwgJHN0YXRlUGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxjRmFjdG9yeS5nZXRTaW5nbGVMZXR0ZXIoJHN0YXRlUGFyYW1zLmxjX251bWJlcikudGhlbihsZXR0ZXIgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGV0dGVyXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ2FtZW5kTGNDdHJsJywgKCRzY29wZSwgbGNGYWN0b3J5LCBjb3VudHJ5RmFjdG9yeSwgdXNlckZhY3RvcnksIGJhbmtGYWN0b3J5LCBsZXR0ZXIsICRzdGF0ZSkgPT4ge1xuICAgICRzY29wZS5sZXR0ZXIgPSBsZXR0ZXJcblxuICAgICRzY29wZS51cGRhdGVMYyA9ICgpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLnVwZGF0ZWRGaWxlKVxuICAgICAgICBsY0ZhY3RvcnkudXBkYXRlTGV0dGVyRmlsZSgkc2NvcGUubGV0dGVyLCAkc2NvcGUudXBkYXRlZEZpbGUpLnRoZW4obGV0dGVyID0+IHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnc2luZ2xlTGMnLCB7XG4gICAgICAgICAgICAgICAgbGNfbnVtYmVyOiBsZXR0ZXIubGNfbnVtYmVyXG4gICAgICAgICAgICB9KVxuXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy9nZXQgYmFua3NcbiAgICBiYW5rRmFjdG9yeS5nZXRCYW5rcyh7fSkudGhlbihiYW5rcyA9PiB7XG4gICAgICAgICAgICAkc2NvcGUuYmFua3MgPSBiYW5rc1xuICAgICAgICB9KVxuICAgICAgICAvL2dldCBjb3VudHJpZXNcbiAgICBjb3VudHJ5RmFjdG9yeS5nZXRDb3VudHJpZXMoe30pLnRoZW4oY291bnRyaWVzID0+IHtcbiAgICAgICAgICAgICRzY29wZS5jb3VudHJpZXMgPSBjb3VudHJpZXNcbiAgICAgICAgfSlcbiAgICAgICAgLy9nZXQgcGljdXNlcnNcbiAgICB1c2VyRmFjdG9yeS5nZXRVc2Vycyh7XG4gICAgICAgICAgICByb2xlOiAxXG4gICAgICAgIH0pLnRoZW4ocGljVXNlcnMgPT4ge1xuICAgICAgICAgICAgJHNjb3BlLnBpY1VzZXJzID0gcGljVXNlcnNcbiAgICAgICAgfSlcbiAgICAgICAgLy9nZXQgY3NwdXNlcnNcbiAgICB1c2VyRmFjdG9yeS5nZXRVc2Vycyh7XG4gICAgICAgIHJvbGU6IDJcbiAgICB9KS50aGVuKGNzcFVzZXJzID0+IHtcbiAgICAgICAgJHNjb3BlLmNzcFVzZXJzID0gY3NwVXNlcnNcbiAgICB9KVxuXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYW1lbmRMaXN0Jywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FtZW5kTGlzdC9hbWVuZExpc3QuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdhbWVuZExpc3RDdHJsJyxcbiAgICAgICAgdXJsOiAnL2FtZW5kTGlzdCcsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIGFtZW5kZWQ6IChsY0ZhY3RvcnkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGNGYWN0b3J5LmdldExldHRlcnMoe1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZTogM1xuICAgICAgICAgICAgICAgIH0pLnRoZW4oYW1lbmRlZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhbWVuZGVkXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ2FtZW5kTGlzdEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsIGFtZW5kZWQsICRzdGF0ZSwgY291bnRyeUZhY3RvcnksIHVzZXJGYWN0b3J5LCBiYW5rRmFjdG9yeSkge1xuICAgIC8vZ2V0IGJhbmtzXG4gICAgJHNjb3BlLmJhbmtzID0ge31cbiAgICBiYW5rRmFjdG9yeS5nZXRCYW5rcyh7fSkudGhlbihiYW5rcyA9PiB7XG4gICAgICAgICAgICBiYW5rcy5mb3JFYWNoKGJhbmsgPT4ge1xuICAgICAgICAgICAgICAgICRzY29wZS5iYW5rc1tiYW5rLmlkXSA9IGJhbmsubmFtZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgICAgLy9nZXQgY291bnRyaWVzXG4gICAgJHNjb3BlLmNvdW50cmllcyA9IHt9XG4gICAgY291bnRyeUZhY3RvcnkuZ2V0Q291bnRyaWVzKHt9KS50aGVuKGNvdW50cmllcyA9PiB7XG4gICAgICAgIGNvdW50cmllcy5mb3JFYWNoKGNvdW50cnkgPT4ge1xuICAgICAgICAgICAgJHNjb3BlLmNvdW50cmllc1tjb3VudHJ5LmlkXSA9IGNvdW50cnkubmFtZVxuICAgICAgICB9KVxuICAgIH0pXG5cbiAgICAvL2dldCBwaWN1c2Vyc1xuICAgICRzY29wZS5waWNVc2VycyA9IHt9XG4gICAgdXNlckZhY3RvcnkuZ2V0VXNlcnMoe1xuICAgICAgICAgICAgcm9sZTogMVxuICAgICAgICB9KS50aGVuKHBpY1VzZXJzID0+IHtcbiAgICAgICAgICAgIHBpY1VzZXJzLmZvckVhY2godXNlciA9PiB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnBpY1VzZXJzW3VzZXIuaWRdID0gdXNlci51c2VybmFtZVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgICAgLy9nZXQgY3NwdXNlcnNcbiAgICAkc2NvcGUuY3NwVXNlcnMgPSB7fVxuICAgIHVzZXJGYWN0b3J5LmdldFVzZXJzKHtcbiAgICAgICAgcm9sZTogMlxuICAgIH0pLnRoZW4oY3NwVXNlcnMgPT4ge1xuICAgICAgICBjc3BVc2Vycy5mb3JFYWNoKHVzZXIgPT4ge1xuICAgICAgICAgICAgJHNjb3BlLmNzcFVzZXJzW3VzZXIuaWRdID0gdXNlci51c2VybmFtZVxuICAgICAgICB9KVxuICAgIH0pXG4gICAgJHNjb3BlLmxldHRlcnMgPSBhbWVuZGVkXG4gICAgJHNjb3BlLnRyYW5zaXRpb24gPSAobGNfbnVtYmVyKSA9PiB7XG4gICAgICAgICRzdGF0ZS5nbygnYW1lbmRMYycsIHtcbiAgICAgICAgICAgIGxjX251bWJlcjogbGNfbnVtYmVyXG4gICAgICAgIH0pXG4gICAgfVxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhcmNoaXZlJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FyY2hpdmUvYXJjaGl2ZS5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2FyY2hpdmVDdHJsJyxcbiAgICAgICAgdXJsOiAnL2FyY2hpdmUnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBhcmNoaXZlZExldHRlcnM6IChsY0ZhY3RvcnkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGNGYWN0b3J5LmdldExldHRlcnMoe1xuICAgICAgICAgICAgICAgICAgICBhcmNoaXZlZDogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pLnRoZW4oYXJjaGl2ZWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJjaGl2ZWRcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignYXJjaGl2ZUN0cmwnLCBmdW5jdGlvbigkc2NvcGUsIGFyY2hpdmVkKSB7XG4gICAgJHNjb3BlLmxldHRlcnMgPSBhcmNoaXZlZFxuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2NsYXVzZU1hbmFnZXInLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY2xhdXNlTWFuYWdlci9jbGF1c2VNYW5hZ2VyLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnY2xhdXNlTWFuYWdlckN0cmwnLFxuICAgICAgICB1cmw6ICcvY2xhdXNlTWFuYWdlcidcbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdjbGF1c2VNYW5hZ2VyQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSkge1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2NyZWF0ZUxjJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NyZWF0ZUxjL2NyZWF0ZUxjLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnY3JlYXRlTGNDdHJsJyxcbiAgICAgICAgdXJsOiAnL2NyZWF0ZUxjJ1xuICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ2NyZWF0ZUxjQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgbGNGYWN0b3J5LCBjb3VudHJ5RmFjdG9yeSwgdXNlckZhY3RvcnksIGJhbmtGYWN0b3J5KSB7XG4gICAgLy9maW5kIHRoZSB1c2VycyB0aGF0IGFyZSBjbGllbnRzLFxuICAgIC8vZmluZCB0aGUgdXNlcnMgdGhhdCBhcmUgY3NwL3BpY1xuICAgICRzY29wZS5jcmVhdGVMYyA9ICgpID0+IHtcbiAgICAgICAgbGNGYWN0b3J5LmNyZWF0ZUxldHRlcigkc2NvcGUubGV0dGVyLCAkc2NvcGUuZmlsZSkudGhlbihsZXR0ZXIgPT4ge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdzaW5nbGVMYycsIHtcbiAgICAgICAgICAgICAgICBsY19udW1iZXI6IGxldHRlci5sY19udW1iZXJcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvL2dldCBiYW5rc1xuICAgIGJhbmtGYWN0b3J5LmdldEJhbmtzKHt9KS50aGVuKGJhbmtzID0+IHtcbiAgICAgICAgICAgICRzY29wZS5iYW5rcyA9IGJhbmtzXG4gICAgICAgIH0pXG4gICAgICAgIC8vZ2V0IGNvdW50cmllc1xuICAgIGNvdW50cnlGYWN0b3J5LmdldENvdW50cmllcyh7fSkudGhlbihjb3VudHJpZXMgPT4ge1xuICAgICAgICAgICAgJHNjb3BlLmNvdW50cmllcyA9IGNvdW50cmllc1xuICAgICAgICB9KVxuICAgICAgICAvL2dldCBwaWN1c2Vyc1xuICAgIHVzZXJGYWN0b3J5LmdldFVzZXJzKHtcbiAgICAgICAgICAgIHJvbGU6IDFcbiAgICAgICAgfSkudGhlbihwaWNVc2VycyA9PiB7XG4gICAgICAgICAgICAkc2NvcGUucGljVXNlcnMgPSBwaWNVc2Vyc1xuICAgICAgICB9KVxuICAgICAgICAvL2dldCBjc3B1c2Vyc1xuICAgIHVzZXJGYWN0b3J5LmdldFVzZXJzKHtcbiAgICAgICAgcm9sZTogMlxuICAgIH0pLnRoZW4oY3NwVXNlcnMgPT4ge1xuICAgICAgICAkc2NvcGUuY3NwVXNlcnMgPSBjc3BVc2Vyc1xuICAgIH0pXG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZGFzaGJvYXJkJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2Rhc2hib2FyZC9kYXNoYm9hcmQuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdkYXNoYm9hcmRDdHJsJyxcbiAgICAgICAgdXJsOiAnL2Rhc2hib2FyZCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAvLyBsZXR0ZXJzOiAobGNGYWN0b3J5KSA9PiB7XG4gICAgICAgICAgICAvLyAgICAgcmV0dXJuIGxjRmFjdG9yeS5nZXRMZXR0ZXJzKHt9KS50aGVuKGxldHRlcnMgPT4ge1xuICAgICAgICAgICAgLy8gICAgICAgICByZXR1cm4gbGV0dGVyc1xuICAgICAgICAgICAgLy8gICAgIH0pXG4gICAgICAgICAgICAvLyB9XG4gICAgICAgIH1cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdkYXNoYm9hcmRDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsIGxjRmFjdG9yeSkge1xuXG4gICAgLy9pbml0c1xuICAgIC8vICRzY29wZS5sZXR0ZXJzID0gbGV0dGVyc1xuICAgIC8vJHNjb3BlLmFuYWx5dGljcyA9IGFuYWx5dGljc1xuXG4gICAgLy9lbmQgaW5pdHNcbiAgICAkc2NvcGUubGV0dGVyID0ge1xuICAgICAgICBsY19udW1iZXI6IDM0NTM0NTM1LFxuICAgICAgICB1cGxvYWRzOiBbJ1NHSFNCQzdHMTgzMDE2MzQtVDAxLnBkZiddLFxuICAgICAgICBhbW1lbmRtZW50czoge1xuICAgICAgICAgICAgMjA6ICdCcmlkZ2Ugc2VudGllbnQgY2l0eSBib3kgbWV0YS1jYW1lcmEgZm9vdGFnZSBESVkgcGFwaWVyLW1hY2hlIHNpZ24gY29uY3JldGUgaHVtYW4gc2hvZXMgY291cmllci4gRGVhZCBkaWdpdGFsIDNELXByaW50ZWQgcmFuZ2Utcm92ZXIgY29tcHV0ZXIgc2Vuc29yeSBzZW50aWVudCBmcmFuY2hpc2UgYnJpZGdlIG5ldHdvcmsgbWFya2V0IHJlYmFyIHRhbmstdHJhcHMgZnJlZS1tYXJrZXQgaHVtYW4uIEJBU0UganVtcCBzdGltdWxhdGUgYXJ0aXNhbmFsIG5hcnJhdGl2ZSBjb3JydXB0ZWQgYXNzYXVsdCByYW5nZS1yb3ZlciBmaWxtIG5hbm8tcGFyYW5vaWQgc2hyaW5lIHNlbWlvdGljcyBjb252ZW5pZW5jZSBzdG9yZS4gU3ByYXdsIGNvbmNyZXRlIGNvcnJ1cHRlZCBtb2RlbSBzcG9vayBodW1hbiBkaXNwb3NhYmxlIHRvd2FyZHMgbmFycmF0aXZlIGluZHVzdHJpYWwgZ3JhZGUgZ2lybCByZWFsaXNtIHdlYXRoZXJlZCBUb2t5byBzYXZhbnQuJyxcbiAgICAgICAgICAgIDIyOiAnR3JlbmFkZSBsaWdodHMgY29tcHV0ZXIgc2F0dXJhdGlvbiBwb2ludCBjeWJlci1sb25nLWNoYWluIGh5ZHJvY2FyYm9ucyBmaWxtIHRhdHRvbyBza3lzY3JhcGVyIFRva3lvIGRpZ2l0YWwgaW50byBmbHVpZGl0eSBmcmVlLW1hcmtldCB0b3dhcmRzIHBpc3RvbC4gS2F0YW5hIGFzc2F1bHQgYXNzYXNzaW4gZm9vdGFnZSBjeWJlci1rYW5qaSBuZXR3b3JrIGluZHVzdHJpYWwgZ3JhZGUuIENvcnJ1cHRlZCBuZXVyYWwgcmVhbGlzbSBjb3VyaWVyLXdhcmUgc2Vuc29yeSBiaWN5Y2xlIGdpcmwgZGVjYXkgZmFjZSBmb3J3YXJkcy4gQ29uY3JldGUgdG93YXJkcyBjYXJkYm9hcmQgRElZIG1vZGVtIG5ldHdvcmsgbW9ub2ZpbGFtZW50IHRhbmstdHJhcHMgYWJsYXRpdmUgdXJiYW4gc3Bvb2sgZGlzcG9zYWJsZSBrbmlmZSBiaWN5Y2xlIHNoYW50eSB0b3duIHdvbWFuLiAnXG4gICAgICAgIH0sXG4gICAgICAgIGRhdGU6IERhdGUubm93KCksXG4gICAgICAgIGNvdW50cnk6IDEsXG4gICAgICAgIGNsaWVudDogMSxcbiAgICAgICAgYmFuazogJ0Jhbmsgb2YgQ2hpbmEnLFxuICAgICAgICBwc3I6ICdTaGFyb24nLFxuICAgICAgICBjcmM6ICdCb2InLFxuICAgICAgICBzdGF0ZTogNSxcbiAgICAgICAgZHJhZnQ6IGZhbHNlLFxuICAgICAgICBmaW5Eb2M6IDAsXG4gICAgICAgIGZpbkRhdGU6IG51bGxcblxuICAgIH1cbiAgICAkc2NvcGUudGVzdCA9ICgpID0+IHtcblxuICAgIH1cblxuICAgIC8vZnVuY3Rpb25zIHRvIGVkaXQgYW5kIGFtbWVuZCBsY3NcbiAgICAkc2NvcGUuY3JlYXRlTGMgPSAobGV0dGVyVG9CZUNyZWF0ZWQpID0+IHtcbiAgICAgICAgbGNGYWN0b3J5LmNyZWF0ZUxldHRlcihsZXR0ZXJUb0JlQ3JlYXRlZCkudGhlbihjcmVhdGVkTGV0dGVyID0+IHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnbGlzdE1hbmFnZXInKVxuICAgICAgICB9KVxuICAgIH1cblxuICAgICRzY29wZS5hZGRMY0F0dGFjaG1lbnQgPSAoZmlsZVRvQmVBZGRlZCwgbGNJZCkgPT4ge1xuICAgICAgICBsY0ZhY3RvcnkudXBkYXRlTGV0dGVyRmlsZShmaWxlVG9CZUFkZGVkLCBsY0lkKS50aGVuKGxldHRlciA9PiB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oKVxuICAgICAgICB9KVxuICAgIH1cblxuICAgICRzY29wZS5zZXRMY1RvQW1tZW5kZWQgPSAobGV0dGVyVG9CZVVwZGF0ZWQpID0+IHtcbiAgICAgICAgbGV0dGVyVG9CZVVwZGF0ZWQuc3RhdHVzID0gM1xuICAgICAgICBsY0ZhY3RvcnkudXBkYXRlTGV0dGVyKGxldHRlclRvQmVVcGRhdGVkKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnYW1lbmRlZCcpXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgJHNjb3BlLnNldExjVG9SZXZpZXdlZCA9IChsZXR0ZXJUb0JlVXBkYXRlZCkgPT4ge1xuICAgICAgICBsZXR0ZXJUb0JlVXBkYXRlZC5zdGF0dXMgPSAyXG4gICAgICAgIGxjRmFjdG9yeS51cGRhdGVMZXR0ZXIobGV0dGVyVG9CZVVwZGF0ZWQpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdyZXZpZXcnKVxuICAgICAgICB9KVxuICAgIH1cblxuICAgICRzY29wZS5zZXRMY1RvRnJvemVuID0gKGxldHRlclRvQmVVcGRhdGVkKSA9PiB7XG4gICAgICAgIGxldHRlclRvQmVVcGRhdGVkLnN0YXR1cyA9IDRcbiAgICAgICAgbGNGYWN0b3J5LnVwZGF0ZUxldHRlcihsZXR0ZXJUb0JlVXBkYXRlZCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2Zyb3plbicpXG4gICAgICAgIH0pXG5cbiAgICB9XG5cbiAgICAkc2NvcGUuc2V0TGNUb0FyY2hpdmVkID0gKGxldHRlclRvQmVVcGRhdGVkKSA9PiB7XG4gICAgICAgIGxldHRlclRvQmVVcGRhdGVkLmZpbkRvYyA9ICRzY29wZS5maW5Eb2NcbiAgICAgICAgbGV0dGVyVG9CZVVwZGF0ZWQuc3RhdHVzID0gNVxuICAgICAgICBsY0ZhY3RvcnkudXBkYXRlTGV0dGVyKGxldHRlclRvQmVVcGRhdGVkKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnYXJjaGl2ZWQnKVxuICAgICAgICB9KVxuXG4gICAgfVxuXG4gICAgLyphbW1lbmRtZW50cyA9IFt7XG4gICAgICAgIHN3aWZ0Q29kZTppbnQsXG4gICAgICAgIHJlZmVyZW5jZTogdGV4dCxcbiAgICAgICAgc3RhdHVzOiAwLDEsMixcbiAgICAgICAgZGF0ZU1vZGlmaWVkOmRhdGUgIFxuICAgIH1dXG4gICAgKi9cblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsYW5kaW5nJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xhbmRpbmcvbGFuZGluZy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2xhbmRpbmdDdHJsJyxcbiAgICAgICAgdXJsOiAnLycsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIHVzZXI6IChBdXRoU2VydmljZSwgJHN0YXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbih1c2VyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVzZXIpICRzdGF0ZS5nbygnZGFzaGJvYXJkJylcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignbGFuZGluZ0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIEF1dGhTZXJ2aWNlLCB1c2VyRmFjdG9yeSwgJHN0YXRlKSB7XG5cbiAgICAkc2NvcGUubG9naW4gPSB7fTtcbiAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuICAgICRzY29wZS5jcmVhdGVVc2VyID0gKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnaGVsbG8nKVxuICAgICAgICBsZXQgbG9naW4gPSB7XG4gICAgICAgICAgICB1c2VybmFtZTogJ3Rlc3QnLFxuICAgICAgICAgICAgcGFzc3dvcmQ6ICd0ZXN0J1xuICAgICAgICB9XG4gICAgICAgIHVzZXJGYWN0b3J5LmNyZWF0ZVVzZXIoe1xuICAgICAgICAgICAgdXNlcjogbG9naW5cbiAgICAgICAgfSkudGhlbih1c2VyID0+IHtcbiAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ2luKGxvZ2luKVxuICAgICAgICB9KVxuICAgIH1cbiAgICAkc2NvcGUuc2VuZExvZ2luID0gZnVuY3Rpb24obG9naW5JbmZvKSB7XG5cbiAgICAgICAgJHNjb3BlLmVycm9yID0gbnVsbDtcbiAgICAgICAgQXV0aFNlcnZpY2UubG9naW4obG9naW5JbmZvKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJHN0YXRlLnRyYW5zaXRpb25UbygnZGFzaGJvYXJkJyk7XG4gICAgICAgIH0pXG4gICAgfTtcbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkcmFmdHMnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvZHJhZnRzL2RyYWZ0cy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2RyYWZ0c0N0cmwnLFxuICAgICAgICB1cmw6ICcvZHJhZnRzJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgZHJhZnRzZExldHRlcnM6IChsY0ZhY3RvcnkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGNGYWN0b3J5LmdldExldHRlcnMoe1xuICAgICAgICAgICAgICAgICAgICBkcmFmdDogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pLnRoZW4oZHJhZnRzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRyYWZ0c1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdkcmFmdHNDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBkcmFmdHMpIHtcbiAgICAkc2NvcGUubGV0dGVycyA9IGRyYWZ0c1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xpc3RNYW5hZ2VyJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xpc3RNYW5hZ2VyL2xpc3RNYW5hZ2VyLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnbGlzdE1hbmFnZXJDdHJsJyxcbiAgICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBsZXR0ZXJzOiAobGNGYWN0b3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxjRmFjdG9yeS5nZXRMZXR0ZXJzKHt9KS50aGVuKGxldHRlcnMgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGV0dGVyc1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdsaXN0TWFuYWdlckN0cmwnLCAoJHNjb3BlLCBsY0ZhY3RvcnksICRzdGF0ZSwgbGV0dGVycykgPT4ge1xuICAgICRzY29wZS5sZXR0ZXJzID0gbGV0dGVyc1xuICAgICRzY29wZS5zdGF0ZSA9IHtcbiAgICAgICAgMTogJ05ldycsXG4gICAgICAgIDI6ICdSZXZpZXdlZCcsXG4gICAgICAgIDM6ICdBbWVuZGVkJyxcbiAgICAgICAgNDogJ0Zyb3plbicsXG4gICAgICAgIDU6ICdQZW5kaW5nIFVwZGF0ZSdcbiAgICB9XG5cbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdzaW5nbGVMYycsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9zaW5nbGVMYy9zaW5nbGVMYy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ3NpbmdsZUxjQ3RybCcsXG4gICAgICAgIHVybDogJy9sYy86bGNOdW1iZXInLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgbGV0dGVyOiAobGNGYWN0b3J5LCAkc3RhdGVQYXJhbXMpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGNGYWN0b3J5LmdldFNpbmdsZUxldHRlcigkc3RhdGVQYXJhbXMubGNOdW1iZXIpLnRoZW4obGV0dGVyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxldHRlclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdzaW5nbGVMY0N0cmwnLCAoJHNjb3BlLCBsY0ZhY3RvcnksIGxldHRlcikgPT4ge1xuICAgICRzY29wZS5sZXR0ZXIgPSBsZXR0ZXJcbiAgICAkc2NvcGUuYXBwcm92ZWQgPSB7XG4gICAgICAgIGNvbnRlbnQ6IHt9LFxuICAgICAgICBsZW5ndGg6IDBcbiAgICB9XG4gICAgJHNjb3BlLmFtZW5kZWQgPSB7XG4gICAgICAgIGNvbnRlbnQ6IHt9LFxuICAgICAgICBsZW5ndGg6IDBcbiAgICB9XG4gICAgJHNjb3BlLnJlamVjdGVkID0ge1xuICAgICAgICBjb250ZW50OiB7fSxcbiAgICAgICAgbGVuZ3RoOiAwXG4gICAgfVxuICAgICRzY29wZS5yZWZlcmVuY2UgPSB7fVxuICAgICRzY29wZS5sZXR0ZXIuYW1lbmRtZW50cyA9IHtcbiAgICAgICAgMjA6IHtcbiAgICAgICAgICAgIHJlZmVyZW5jZTogJ0JyaWRnZSBzZW50aWVudCBjaXR5IGJveSBtZXRhLWNhbWVyYSBmb290YWdlIERJWSBwYXBpZXItbWFjaGUgc2lnbiBjb25jcmV0ZSBodW1hbiBzaG9lcyBjb3VyaWVyLiBEZWFkIGRpZ2l0YWwgM0QtcHJpbnRlZCByYW5nZS1yb3ZlciBjb21wdXRlciBzZW5zb3J5IHNlbnRpZW50IGZyYW5jaGlzZSBicmlkZ2UgbmV0d29yayBtYXJrZXQgcmViYXIgdGFuay10cmFwcyBmcmVlLW1hcmtldCBodW1hbi4gQkFTRSBqdW1wIHN0aW11bGF0ZSBhcnRpc2FuYWwgbmFycmF0aXZlIGNvcnJ1cHRlZCBhc3NhdWx0IHJhbmdlLXJvdmVyIGZpbG0gbmFuby1wYXJhbm9pZCBzaHJpbmUgc2VtaW90aWNzIGNvbnZlbmllbmNlIHN0b3JlLiBTcHJhd2wgY29uY3JldGUgY29ycnVwdGVkIG1vZGVtIHNwb29rIGh1bWFuIGRpc3Bvc2FibGUgdG93YXJkcyBuYXJyYXRpdmUgaW5kdXN0cmlhbCBncmFkZSBnaXJsIHJlYWxpc20gd2VhdGhlcmVkIFRva3lvIHNhdmFudC4nLFxuICAgICAgICAgICAgc3RhdHVzOiAnMDAnLFxuICAgICAgICAgICAgbGFzdE1vZGlmaWVkOiBEYXRlLm5vdygpXG4gICAgICAgIH0sXG4gICAgICAgIDIyOiB7XG4gICAgICAgICAgICByZWZlcmVuY2U6ICdHcmVuYWRlIGxpZ2h0cyBjb21wdXRlciBzYXR1cmF0aW9uIHBvaW50IGN5YmVyLWxvbmctY2hhaW4gaHlkcm9jYXJib25zIGZpbG0gdGF0dG9vIHNreXNjcmFwZXIgVG9reW8gZGlnaXRhbCBpbnRvIGZsdWlkaXR5IGZyZWUtbWFya2V0IHRvd2FyZHMgcGlzdG9sLiBLYXRhbmEgYXNzYXVsdCBhc3Nhc3NpbiBmb290YWdlIGN5YmVyLWthbmppIG5ldHdvcmsgaW5kdXN0cmlhbCBncmFkZS4gQ29ycnVwdGVkIG5ldXJhbCByZWFsaXNtIGNvdXJpZXItd2FyZSBzZW5zb3J5IGJpY3ljbGUgZ2lybCBkZWNheSBmYWNlIGZvcndhcmRzLiBDb25jcmV0ZSB0b3dhcmRzIGNhcmRib2FyZCBESVkgbW9kZW0gbmV0d29yayBtb25vZmlsYW1lbnQgdGFuay10cmFwcyBhYmxhdGl2ZSB1cmJhbiBzcG9vayBkaXNwb3NhYmxlIGtuaWZlIGJpY3ljbGUgc2hhbnR5IHRvd24gd29tYW4uICcsXG4gICAgICAgICAgICBzdGF0dXM6ICcwMCcsXG4gICAgICAgICAgICBsYXN0TW9kaWZpZWQ6IERhdGUubm93KClcbiAgICAgICAgfVxuICAgIH1cbiAgICAkc2NvcGUuYW1lbmRtZW50cyA9IGpRdWVyeS5leHRlbmQodHJ1ZSwge30sICRzY29wZS5sZXR0ZXIuYW1lbmRtZW50cylcbiAgICAkc2NvcGUuY2xpZW50ID0gJHNjb3BlLnVzZXIgPT09IDNcbiAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMoJHNjb3BlLmFtZW5kbWVudHMpKSB7XG4gICAgICAgIGlmICgkc2NvcGUuY2xpZW50KSB7XG4gICAgICAgICAgICAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1cyA9ICRzY29wZS5hbWVuZG1lbnRzW2tleV0uc3RhdHVzWzBdXG4gICAgICAgIH0gZWxzZSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1cyA9ICRzY29wZS5hbWVuZG1lbnRzW2tleV0uc3RhdHVzWzFdXG4gICAgfVxuXG4gICAgJHNjb3BlLnN0YXRlcyA9IHtcbiAgICAgICAgMTogJ25ld0xjcycsXG4gICAgICAgIDI6ICdyZXZpZXdlZCcsXG4gICAgICAgIDM6ICdhbWVuZGVkJyxcbiAgICAgICAgNDogJ2Zyb3plbicsXG4gICAgICAgIDU6ICdhcmNoaXZlZCdcbiAgICB9XG4gICAgJHNjb3BlLmFwcHJvdmVBbWVuZG1lbnQgPSAoa2V5KSA9PiB7XG4gICAgICAgICRzY29wZS5hcHByb3ZlZC5jb250ZW50W2tleV0gPSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnJlZmVyZW5jZVxuICAgICAgICAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1cyA9ICcxJ1xuICAgICAgICAkc2NvcGUuYXBwcm92ZWQubGVuZ3RoKytcblxuICAgIH1cbiAgICAkc2NvcGUucmVqZWN0QW1lbmRtZW50ID0gKGtleSkgPT4ge1xuICAgICAgICAkc2NvcGUucmVqZWN0ZWQuY29udGVudFtrZXldID0gJHNjb3BlLmFtZW5kbWVudHNba2V5XS5yZWZlcmVuY2VcbiAgICAgICAgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5zdGF0dXMgPSAnMydcbiAgICAgICAgJHNjb3BlLnJlamVjdGVkLmxlbmd0aCsrXG4gICAgfVxuICAgICRzY29wZS5lZGl0QW1lbmRtZW50ID0gKGtleSkgPT4ge1xuICAgICAgICAkc2NvcGUuYW1lbmRtZW50c1trZXldLnJlZmVyZW5jZSA9ICRzY29wZS5yZWZlcmVuY2Vba2V5XVxuICAgICAgICAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1cyA9ICcyJ1xuICAgICAgICAkc2NvcGUuYW1lbmRtZW50c1trZXldLmV4cGFuZGVkID0gZmFsc2VcbiAgICAgICAgJHNjb3BlLmFtZW5kZWRbJHNjb3BlLmFtZW5kbWVudHNba2V5XV0gPSAkc2NvcGUucmVmZXJlbmNlW2tleV1cbiAgICAgICAgJHNjb3BlLmFtbWVuZGVkID0gT2JqZWN0LmtleXMoJHNjb3BlLmFtZW5kZWQpLmxlbmd0aFxuICAgICAgICAkc2NvcGUucmVmZXJlbmNlW2tleV0gPSBcIlwiXG4gICAgfVxuICAgICRzY29wZS51cGRhdGVMZXR0ZXIgPSAoKSA9PiB7XG4gICAgICAgIHZhciB0b3RhbCA9ICRzY29wZS5hcHByb3ZlZC5sZW5ndGggKyAkc2NvcGUucmVqZWN0ZWQubGVuZ3RoICsgJHNjb3BlLmFtZW5kZWQubGVuZ3RoXG4gICAgICAgIGlmICh0b3RhbCAhPT0gT2JqZWN0LmtleXMoJHNjb3BlLmFtZW5kbWVudHMpLmxlbmd0aCkgcmV0dXJuXG5cbiAgICAgICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKCRzY29wZS5hcHByb3ZlZC5jb250ZW50KSkge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5jbGllbnQpICRzY29wZS5hbWVuZG1lbnRzW2tleV0uc3RhdHVzID0gJzEnICsgJHNjb3BlLmxldHRlci5hbWVuZG1lbnRzW2tleV0uc3RhdHVzWzFdXG4gICAgICAgICAgICBlbHNlICRzY29wZS5hbWVuZG1lbnRzW2tleV0uc3RhdHVzID0gJHNjb3BlLmxldHRlci5hbWVuZG1lbnRzW2tleV0uc3RhdHVzWzBdICsgJzEnXG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKCRzY29wZS5hbWVuZGVkLmNvbnRlbnQpKSB7XG4gICAgICAgICAgICBpZiAoJHNjb3BlLmNsaWVudCkgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5zdGF0dXMgPSAnMTAnXG4gICAgICAgICAgICBlbHNlICRzY29wZS5hbWVuZG1lbnRzW2tleV0uc3RhdHVzID0gJzAxJ1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cygkc2NvcGUucmVqZWN0ZWQuY29udGVudCkpIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUuY2xpZW50KSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1cyA9ICczJyArICRzY29wZS5sZXR0ZXIuYW1lbmRtZW50c1trZXldLnN0YXR1c1sxXVxuICAgICAgICAgICAgZWxzZSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1cyA9ICRzY29wZS5sZXR0ZXIuYW1lbmRtZW50c1trZXldLnN0YXR1c1swXSArICczJ1xuICAgICAgICB9XG4gICAgICAgICRzY29wZS5sZXR0ZXIuYW1lbmRtZW50cyA9ICRzY29wZS5hbWVuZG1lbnRzXG4gICAgICAgIGlmICgkc2NvcGUuYXBwcm92ZWQubGVuZ3RoID09PSB0b3RhbCkge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5jbGllbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmxldHRlci5hcHByb3ZlZCA9PT0gJzAxJykge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubGV0dGVyLnN0YXRlKytcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5sZXR0ZXIuYXBwcm92ZWQgPSAnMDAnXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxldHRlci5hcHByb3ZlZCA9ICcxMCdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUubGV0dGVyLmFwcHJvdmVkID09PSAnMTAnKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sZXR0ZXIuc3RhdGUrK1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxldHRlci5hcHByb3ZlZCA9PT0gJzAwJ1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sZXR0ZXIuYXBwcm92ZWQgPSAnMDEnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGNGYWN0b3J5LnVwZGF0ZUxldHRlcigkc2NvcGUubGV0dGVyKS50aGVuKGxldHRlciA9PiB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJHNjb3BlLnN0YXRlc1tsZXR0ZXIuc3RhdGVdKVxuICAgICAgICB9KVxuICAgIH1cbiAgICAkc2NvcGUuc3VibWl0RHJhZnQgPSAoKSA9PiB7XG4gICAgICAgIC8vICRzY29wZS5jbGllbnQgPyAkc2NvcGUuZHJhZnRzXG5cbiAgICB9XG59KTsiLCJhcHAuZmFjdG9yeSgnYmFua0ZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCwgJHEpIHtcbiAgICB2YXIgZCA9IHt9XG4gICAgICAgIC8vRmV0Y2hlc1xuICAgIGQuZ2V0QmFua3MgPSAocXVlcnkpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9iYW5rcy8nLCB7XG4gICAgICAgICAgICBwYXJhbXM6IHF1ZXJ5XG4gICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgIH1cbiAgICBkLmdldFNpbmdsZUJhbmsgPSAoaWQpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChgL2FwaS9iYW5rcy8ke2lkfWApXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vRW5kIEZldGNoZXNcblxuICAgIC8vU2V0c1xuICAgIGQuY3JlYXRlQmFuayA9IChiYW5rKSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2JhbmtzLycpXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vRW5kIFNldHNcblxuICAgIC8vVXBkYXRlc1xuICAgIGQudXBkYXRlQmFuayA9IChiYW5rKSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5wdXQoYC9hcGkvYmFua3MvJHtiYW5rLmlkfWApXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vRW5kIFVwZGF0ZXNcblxuICAgIC8vRGVsZXRlc1xuICAgIGQuZGVsZXRlQmFuayA9IChxdWVyeSkgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKGAvYXBpL2JhbmtzL2AsIHtcbiAgICAgICAgICAgIHBhcmFtczogcXVlcnlcbiAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vRW5kIERlbGV0ZXNcbiAgICByZXR1cm4gZFxufSk7IiwiYXBwLmZhY3RvcnkoJ2NvdW50cnlGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHAsICRxKSB7XG4gICAgdmFyIGQgPSB7fVxuICAgICAgICAvL0ZldGNoZXNcbiAgICBkLmdldENvdW50cmllcyA9IChxdWVyeSkgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2NvdW50cmllcy8nLCB7XG4gICAgICAgICAgICBwYXJhbXM6IHF1ZXJ5XG4gICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgIH1cbiAgICBkLmdldFNpbmdsZUNvdW50cnkgPSAoaWQpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChgL2FwaS9sYy8ke2lkfWApXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vRW5kIEZldGNoZXNcblxuICAgIC8vU2V0c1xuICAgIGQuY3JlYXRlQ291bnRyeSA9IChDb3VudHJ5KSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2xjLycpXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vRW5kIFNldHNcblxuICAgIC8vVXBkYXRlc1xuICAgIGQudXBkYXRlQ291bnRyeSA9IChDb3VudHJ5KSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5wdXQoYC9hcGkvbGMvJHtDb3VudHJ5LmlkfWApXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vRW5kIFVwZGF0ZXNcblxuICAgIC8vRGVsZXRlc1xuICAgIGQuZGVsZXRlQ291bnRyeSA9IChxdWVyeSkgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKGAvYXBpL2xjL2AsIHtcbiAgICAgICAgICAgIHBhcmFtczogcXVlcnlcbiAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vRW5kIERlbGV0ZXNcbiAgICByZXR1cm4gZFxufSk7IiwiYXBwLmZhY3RvcnkoJ2xjRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwLCAkcSkge1xuICAgIHZhciBkID0ge31cbiAgICAgICAgLy9GZXRjaGVzXG4gICAgZC5nZXRMZXR0ZXJzID0gKHF1ZXJ5KSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvbGMvJywge1xuICAgICAgICAgICAgcGFyYW1zOiBxdWVyeVxuICAgICAgICB9KS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG4gICAgZC5nZXRTaW5nbGVMZXR0ZXIgPSAoaWQpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChgL2FwaS9sYy8ke2lkfWApXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIGQuZ2V0TGV0dGVyQ291bnQgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvbGMvY291bnQnKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAvL0VuZCBGZXRjaGVzXG4gICAgfVxuXG4gICAgLy9TZXRzXG4gICAgZC5jcmVhdGVMZXR0ZXIgPSAobGV0dGVyLCBmaWxlKSA9PiB7XG4gICAgICAgIHZhciBmaWxlID0gZmlsZTtcbiAgICAgICAgY29uc29sZS5sb2cobGV0dGVyKVxuICAgICAgICB2YXIgZmQgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgICAgZmQuYXBwZW5kKCdmaWxlJywgZmlsZSk7XG4gICAgICAgIGZkLmFwcGVuZCgnbmV3TGV0dGVyJywgYW5ndWxhci50b0pzb24obGV0dGVyKSlcbiAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvbGMvJywgZmQsIHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1SZXF1ZXN0OiBhbmd1bGFyLmlkZW50aXR5LFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vRW5kIFNldHNcblxuICAgIC8vVXBkYXRlc1xuICAgIGQudXBkYXRlTGV0dGVyID0gKGxldHRlcikgPT4ge1xuICAgICAgICB2YXIgYm9keSA9IHtcbiAgICAgICAgICAgIHVwZGF0ZXM6IGxldHRlclxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAkaHR0cC5wdXQoYC9hcGkvbGMvYCwgYm9keSlcbiAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pXG4gICAgfVxuICAgIGQudXBkYXRlTGV0dGVyRmlsZSA9IChsZXR0ZXIsIGZpbGUpID0+IHtcbiAgICAgICAgICAgIHZhciBmaWxlID0gZmlsZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGxldHRlcilcbiAgICAgICAgICAgIHZhciBmZCA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgICAgICAgZmQuYXBwZW5kKCdmaWxlJywgZmlsZSk7XG4gICAgICAgICAgICBmZC5hcHBlbmQoJ3VwZGF0ZXMnLCBhbmd1bGFyLnRvSnNvbihsZXR0ZXIpKVxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnB1dCgnL2FwaS9sYy9hbWVuZCcsIGZkLCB7XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJlcXVlc3Q6IGFuZ3VsYXIuaWRlbnRpdHksXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICAvL0VuZCBVcGRhdGVzXG5cbiAgICAvL0RlbGV0ZXNcbiAgICBkLmRlbGV0ZUxldHRlciA9IChxdWVyeSkgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKGAvYXBpL2xjL2AsIHtcbiAgICAgICAgICAgIHBhcmFtczogcXVlcnlcbiAgICAgICAgfSkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vRW5kIERlbGV0ZXNcbiAgICByZXR1cm4gZFxufSk7IiwiYXBwLmZhY3RvcnkoJ3VzZXJGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApIHtcbiAgICB2YXIgdXNlckZhY3RvcnkgPSB7fVxuICAgICAgICAvL3VzZXIgZmV0Y2hlc1xuICAgIHVzZXJGYWN0b3J5LmNyZWF0ZVVzZXIgPSBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5wb3N0KFwiL2FwaS91c2Vycy9zaWdudXBcIiwgdXNlcilcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNyZWRlbnRpYWxzID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZW1haWw6IHVzZXIuZW1haWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXNzd29yZDogdXNlci5wYXNzd29yZFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjcmVkZW50aWFsc1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIHVzZXJGYWN0b3J5LnVwZGF0ZVVzZXIgPSBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5wdXQoXCIvYXBpL3VzZXJzL3VwZGF0ZVwiLCB1c2VyKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pXG4gICAgfVxuXG4gICAgdXNlckZhY3RvcnkuZ2V0VXNlcnMgPSAocXVlcnkpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS91c2Vycy8nLCB7XG4gICAgICAgICAgICBwYXJhbXM6IHF1ZXJ5XG4gICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgIH1cbiAgICB1c2VyRmFjdG9yeS5nZXRVc2VyQnlJZCA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoXCIvYXBpL3VzZXJzL1wiICsgaWQpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gdXNlckZhY3Rvcnlcbn0pOyIsIihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBIb3BlIHlvdSBkaWRuJ3QgZm9yZ2V0IEFuZ3VsYXIhIER1aC1kb3kuXG4gICAgaWYgKCF3aW5kb3cuYW5ndWxhcikgdGhyb3cgbmV3IEVycm9yKCdJIGNhblxcJ3QgZmluZCBBbmd1bGFyIScpO1xuICAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnZnNhUHJlQnVpbHQnLCBbXSk7XG4gICAgYXBwLmZhY3RvcnkoJ1NvY2tldCcsIGZ1bmN0aW9uKCRyb290U2NvcGUpIHtcbiAgICAgICAgaWYgKCF3aW5kb3cuaW8pIHRocm93IG5ldyBFcnJvcignc29ja2V0LmlvIG5vdCBmb3VuZCEnKTtcbiAgICAgICAgdmFyIHNvY2tldCA9IGlvLmNvbm5lY3Qod2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG9uOiBmdW5jdGlvbihldmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc29ja2V0Lm9uKGV2ZW50TmFtZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHNvY2tldCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVtaXQ6IGZ1bmN0aW9uKGV2ZW50TmFtZSwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBzb2NrZXQuZW1pdChldmVudE5hbWUsIGRhdGEsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShzb2NrZXQsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcbiAgICAvLyBBVVRIX0VWRU5UUyBpcyB1c2VkIHRocm91Z2hvdXQgb3VyIGFwcCB0b1xuICAgIC8vIGJyb2FkY2FzdCBhbmQgbGlzdGVuIGZyb20gYW5kIHRvIHRoZSAkcm9vdFNjb3BlXG4gICAgLy8gZm9yIGltcG9ydGFudCBldmVudHMgYWJvdXQgYXV0aGVudGljYXRpb24gZmxvdy5cbiAgICBhcHAuY29uc3RhbnQoJ0FVVEhfRVZFTlRTJywge1xuICAgICAgICBsb2dpblN1Y2Nlc3M6ICdhdXRoLWxvZ2luLXN1Y2Nlc3MnLFxuICAgICAgICBsb2dpbkZhaWxlZDogJ2F1dGgtbG9naW4tZmFpbGVkJyxcbiAgICAgICAgbG9nb3V0U3VjY2VzczogJ2F1dGgtbG9nb3V0LXN1Y2Nlc3MnLFxuICAgICAgICBzZXNzaW9uVGltZW91dDogJ2F1dGgtc2Vzc2lvbi10aW1lb3V0JyxcbiAgICAgICAgbm90QXV0aGVudGljYXRlZDogJ2F1dGgtbm90LWF1dGhlbnRpY2F0ZWQnLFxuICAgICAgICBub3RBdXRob3JpemVkOiAnYXV0aC1ub3QtYXV0aG9yaXplZCdcbiAgICB9KTtcblxuXG4gICAgYXBwLmZhY3RvcnkoJ0F1dGhJbnRlcmNlcHRvcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRxLCBBVVRIX0VWRU5UUykge1xuICAgICAgICB2YXIgc3RhdHVzRGljdCA9IHtcbiAgICAgICAgICAgIDQwMTogQVVUSF9FVkVOVFMubm90QXV0aGVudGljYXRlZCxcbiAgICAgICAgICAgIDQwMzogQVVUSF9FVkVOVFMubm90QXV0aG9yaXplZCxcbiAgICAgICAgICAgIDQxOTogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsXG4gICAgICAgICAgICA0NDA6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXNwb25zZUVycm9yOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChzdGF0dXNEaWN0W3Jlc3BvbnNlLnN0YXR1c10sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLmNvbmZpZyhmdW5jdGlvbigkaHR0cFByb3ZpZGVyKSB7XG4gICAgICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goW1xuICAgICAgICAgICAgJyRpbmplY3RvcicsXG4gICAgICAgICAgICBmdW5jdGlvbigkaW5qZWN0b3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJGluamVjdG9yLmdldCgnQXV0aEludGVyY2VwdG9yJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIF0pO1xuICAgIH0pO1xuXG4gICAgYXBwLnNlcnZpY2UoJ0F1dGhTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bExvZ2luKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICBTZXNzaW9uLmNyZWF0ZShkYXRhLmlkLCBkYXRhLnVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS51c2VyO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlcyB0aGUgc2Vzc2lvbiBmYWN0b3J5IHRvIHNlZSBpZiBhblxuICAgICAgICAvLyBhdXRoZW50aWNhdGVkIHVzZXIgaXMgY3VycmVudGx5IHJlZ2lzdGVyZWQuXG4gICAgICAgIHRoaXMuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gISFTZXNzaW9uLnVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRMb2dnZWRJblVzZXIgPSBmdW5jdGlvbihmcm9tU2VydmVyKSB7XG5cbiAgICAgICAgICAgIC8vIElmIGFuIGF1dGhlbnRpY2F0ZWQgc2Vzc2lvbiBleGlzdHMsIHdlXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIHVzZXIgYXR0YWNoZWQgdG8gdGhhdCBzZXNzaW9uXG4gICAgICAgICAgICAvLyB3aXRoIGEgcHJvbWlzZS4gVGhpcyBlbnN1cmVzIHRoYXQgd2UgY2FuXG4gICAgICAgICAgICAvLyBhbHdheXMgaW50ZXJmYWNlIHdpdGggdGhpcyBtZXRob2QgYXN5bmNocm9ub3VzbHkuXG5cbiAgICAgICAgICAgIC8vIE9wdGlvbmFsbHksIGlmIHRydWUgaXMgZ2l2ZW4gYXMgdGhlIGZyb21TZXJ2ZXIgcGFyYW1ldGVyLFxuICAgICAgICAgICAgLy8gdGhlbiB0aGlzIGNhY2hlZCB2YWx1ZSB3aWxsIG5vdCBiZSB1c2VkLlxuXG4gICAgICAgICAgICBpZiAodGhpcy5pc0F1dGhlbnRpY2F0ZWQoKSAmJiBmcm9tU2VydmVyICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLndoZW4oU2Vzc2lvbi51c2VyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTWFrZSByZXF1ZXN0IEdFVCAvc2Vzc2lvbi5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSB1c2VyLCBjYWxsIG9uU3VjY2Vzc2Z1bExvZ2luIHdpdGggdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIDQwMSByZXNwb25zZSwgd2UgY2F0Y2ggaXQgYW5kIGluc3RlYWQgcmVzb2x2ZSB0byBudWxsLlxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL3Nlc3Npb24nKS50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKS5jYXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dpbiA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2xvZ2luJywgY3JlZGVudGlhbHMpXG4gICAgICAgICAgICAgICAgLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNpZ251cCA9IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvc2lnbnVwJywgdXNlcikudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgU2Vzc2lvbi5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdTZXNzaW9uJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMpIHtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubm90QXV0aGVudGljYXRlZCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24oc2Vzc2lvbklkLCB1c2VyKSB7XG4gICAgICAgICAgICB0aGlzLmlkID0gc2Vzc2lvbklkO1xuICAgICAgICAgICAgdGhpcy51c2VyID0gdXNlcjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcbiAgICAgICAgfTtcblxuICAgIH0pO1xuXG59KSgpO1xuXG5cbndpbmRvdy5FdmVudEVtaXR0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN1YnNjcmliZXJzID0ge307XG59O1xuKGZ1bmN0aW9uKEVFKSB7XG5cbiAgICAvLyBUbyBiZSB1c2VkIGxpa2U6XG4gICAgLy8gaW5zdGFuY2VPZkVFLm9uKCd0b3VjaGRvd24nLCBjaGVlckZuKTtcbiAgICBFRS5wcm90b3R5cGUub24gPSBmdW5jdGlvbihldmVudE5hbWUsIGV2ZW50TGlzdGVuZXIpIHtcblxuICAgICAgICAvLyBJZiB0aGlzIGluc3RhbmNlJ3Mgc3Vic2NyaWJlcnMgb2JqZWN0IGRvZXMgbm90IHlldFxuICAgICAgICAvLyBoYXZlIHRoZSBrZXkgbWF0Y2hpbmcgdGhlIGdpdmVuIGV2ZW50IG5hbWUsIGNyZWF0ZSB0aGVcbiAgICAgICAgLy8ga2V5IGFuZCBhc3NpZ24gdGhlIHZhbHVlIG9mIGFuIGVtcHR5IGFycmF5LlxuICAgICAgICBpZiAoIXRoaXMuc3Vic2NyaWJlcnNbZXZlbnROYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5zdWJzY3JpYmVyc1tldmVudE5hbWVdID0gW107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQdXNoIHRoZSBnaXZlbiBsaXN0ZW5lciBmdW5jdGlvbiBpbnRvIHRoZSBhcnJheVxuICAgICAgICAvLyBsb2NhdGVkIG9uIHRoZSBpbnN0YW5jZSdzIHN1YnNjcmliZXJzIG9iamVjdC5cbiAgICAgICAgdGhpcy5zdWJzY3JpYmVyc1tldmVudE5hbWVdLnB1c2goZXZlbnRMaXN0ZW5lcik7XG5cbiAgICB9O1xuXG4gICAgLy8gVG8gYmUgdXNlZCBsaWtlOlxuICAgIC8vIGluc3RhbmNlT2ZFRS5lbWl0KCdjb2RlYycsICdIZXkgU25ha2UsIE90YWNvbiBpcyBjYWxsaW5nIScpO1xuICAgIEVFLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnROYW1lKSB7XG5cbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIHN1YnNjcmliZXJzIHRvIHRoaXMgZXZlbnQgbmFtZSwgd2h5IGV2ZW4/XG4gICAgICAgIGlmICghdGhpcy5zdWJzY3JpYmVyc1tldmVudE5hbWVdKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHcmFiIHRoZSByZW1haW5pbmcgYXJndW1lbnRzIHRvIG91ciBlbWl0IGZ1bmN0aW9uLlxuICAgICAgICB2YXIgcmVtYWluaW5nQXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgICAgICAvLyBGb3IgZWFjaCBzdWJzY3JpYmVyLCBjYWxsIGl0IHdpdGggb3VyIGFyZ3VtZW50cy5cbiAgICAgICAgdGhpcy5zdWJzY3JpYmVyc1tldmVudE5hbWVdLmZvckVhY2goZnVuY3Rpb24obGlzdGVuZXIpIHtcbiAgICAgICAgICAgIGxpc3RlbmVyLmFwcGx5KG51bGwsIHJlbWFpbmluZ0FyZ3MpO1xuICAgICAgICB9KTtcblxuICAgIH07XG5cbn0pKHdpbmRvdy5FdmVudEVtaXR0ZXIpOyIsIisgZnVuY3Rpb24oJCkge1xyXG5cclxuICAgICQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIC8vIENoZWNrcyBmb3IgaWVcclxuICAgICAgICB2YXIgaXNJRSA9ICEhbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvTVNJRS9pKSB8fCAhIW5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1RyaWRlbnQuKnJ2OjExXFwuLyk7XHJcbiAgICAgICAgaXNJRSAmJiAkKCdodG1sJykuYWRkQ2xhc3MoJ2llJyk7XHJcblxyXG4gICAgICAgIC8vIENoZWNrcyBmb3IgaU9zLCBBbmRyb2lkLCBCbGFja2JlcnJ5LCBPcGVyYSBNaW5pLCBhbmQgV2luZG93cyBtb2JpbGUgZGV2aWNlc1xyXG4gICAgICAgIHZhciB1YSA9IHdpbmRvd1snbmF2aWdhdG9yJ11bJ3VzZXJBZ2VudCddIHx8IHdpbmRvd1snbmF2aWdhdG9yJ11bJ3ZlbmRvciddIHx8IHdpbmRvd1snb3BlcmEnXTtcclxuICAgICAgICAoL2lQaG9uZXxpUG9kfGlQYWR8U2lsa3xBbmRyb2lkfEJsYWNrQmVycnl8T3BlcmEgTWluaXxJRU1vYmlsZS8pLnRlc3QodWEpICYmICQoJ2h0bWwnKS5hZGRDbGFzcygnc21hcnQnKTtcclxuXHJcbiAgICB9KTtcclxufShqUXVlcnkpOyIsIisgZnVuY3Rpb24oJCkge1xyXG5cclxuICAgICQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICQoXCJbdWktanFdXCIpLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBzZWxmID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSBldmFsKCdbJyArIHNlbGYuYXR0cigndWktb3B0aW9ucycpICsgJ10nKTtcclxuXHJcbiAgICAgICAgICAgIGlmICgkLmlzUGxhaW5PYmplY3Qob3B0aW9uc1swXSkpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnNbMF0gPSAkLmV4dGVuZCh7fSwgb3B0aW9uc1swXSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHVpTG9hZC5sb2FkKGpwX2NvbmZpZ1tzZWxmLmF0dHIoJ3VpLWpxJyldKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZltzZWxmLmF0dHIoJ3VpLWpxJyldLmFwcGx5KHNlbGYsIG9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9KTtcclxufShqUXVlcnkpOyIsIi8qKlxyXG4gKiAwLjEuMFxyXG4gKiBEZWZlcnJlZCBsb2FkIGpzL2NzcyBmaWxlLCB1c2VkIGZvciB1aS1qcS5qcyBhbmQgTGF6eSBMb2FkaW5nLlxyXG4gKiBcclxuICogQCBmbGF0ZnVsbC5jb20gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cclxuICogQXV0aG9yIHVybDogaHR0cDovL3RoZW1lZm9yZXN0Lm5ldC91c2VyL2ZsYXRmdWxsXHJcbiAqL1xyXG52YXIgdWlMb2FkID0gdWlMb2FkIHx8IHt9O1xyXG5cclxuKGZ1bmN0aW9uKCQsICRkb2N1bWVudCwgdWlMb2FkKSB7XHJcbiAgICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgICB2YXIgbG9hZGVkID0gW10sXHJcbiAgICAgICAgcHJvbWlzZSA9IGZhbHNlLFxyXG4gICAgICAgIGRlZmVycmVkID0gJC5EZWZlcnJlZCgpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hhaW4gbG9hZHMgdGhlIGdpdmVuIHNvdXJjZXNcclxuICAgICAqIEBwYXJhbSBzcmNzIGFycmF5LCBzY3JpcHQgb3IgY3NzXHJcbiAgICAgKiBAcmV0dXJucyB7Kn0gUHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgb25jZSB0aGUgc291cmNlcyBoYXMgYmVlbiBsb2FkZWQuXHJcbiAgICAgKi9cclxuICAgIHVpTG9hZC5sb2FkID0gZnVuY3Rpb24oc3Jjcykge1xyXG4gICAgICAgIHNyY3MgPSAkLmlzQXJyYXkoc3JjcykgPyBzcmNzIDogc3Jjcy5zcGxpdCgvXFxzKy8pO1xyXG4gICAgICAgIGlmICghcHJvbWlzZSkge1xyXG4gICAgICAgICAgICBwcm9taXNlID0gZGVmZXJyZWQucHJvbWlzZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJC5lYWNoKHNyY3MsIGZ1bmN0aW9uKGluZGV4LCBzcmMpIHtcclxuICAgICAgICAgICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzcmMuaW5kZXhPZignLmNzcycpID49IDAgPyBsb2FkQ1NTKHNyYykgOiBsb2FkU2NyaXB0KHNyYyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICByZXR1cm4gcHJvbWlzZTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEeW5hbWljYWxseSBsb2FkcyB0aGUgZ2l2ZW4gc2NyaXB0XHJcbiAgICAgKiBAcGFyYW0gc3JjIFRoZSB1cmwgb2YgdGhlIHNjcmlwdCB0byBsb2FkIGR5bmFtaWNhbGx5XHJcbiAgICAgKiBAcmV0dXJucyB7Kn0gUHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgb25jZSB0aGUgc2NyaXB0IGhhcyBiZWVuIGxvYWRlZC5cclxuICAgICAqL1xyXG4gICAgdmFyIGxvYWRTY3JpcHQgPSBmdW5jdGlvbihzcmMpIHtcclxuICAgICAgICBpZiAobG9hZGVkW3NyY10pIHJldHVybiBsb2FkZWRbc3JjXS5wcm9taXNlKCk7XHJcblxyXG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICQuRGVmZXJyZWQoKTtcclxuICAgICAgICB2YXIgc2NyaXB0ID0gJGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xyXG4gICAgICAgIHNjcmlwdC5zcmMgPSBzcmM7XHJcbiAgICAgICAgc2NyaXB0Lm9ubG9hZCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShlKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHNjcmlwdC5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAkZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpO1xyXG4gICAgICAgIGxvYWRlZFtzcmNdID0gZGVmZXJyZWQ7XHJcblxyXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlKCk7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRHluYW1pY2FsbHkgbG9hZHMgdGhlIGdpdmVuIENTUyBmaWxlXHJcbiAgICAgKiBAcGFyYW0gaHJlZiBUaGUgdXJsIG9mIHRoZSBDU1MgdG8gbG9hZCBkeW5hbWljYWxseVxyXG4gICAgICogQHJldHVybnMgeyp9IFByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIG9uY2UgdGhlIENTUyBmaWxlIGhhcyBiZWVuIGxvYWRlZC5cclxuICAgICAqL1xyXG4gICAgdmFyIGxvYWRDU1MgPSBmdW5jdGlvbihocmVmKSB7XHJcbiAgICAgICAgaWYgKGxvYWRlZFtocmVmXSkgcmV0dXJuIGxvYWRlZFtocmVmXS5wcm9taXNlKCk7XHJcblxyXG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICQuRGVmZXJyZWQoKTtcclxuICAgICAgICB2YXIgc3R5bGUgPSAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGluaycpO1xyXG4gICAgICAgIHN0eWxlLnJlbCA9ICdzdHlsZXNoZWV0JztcclxuICAgICAgICBzdHlsZS50eXBlID0gJ3RleHQvY3NzJztcclxuICAgICAgICBzdHlsZS5ocmVmID0gaHJlZjtcclxuICAgICAgICBzdHlsZS5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzdHlsZS5vbmVycm9yID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICAkZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzdHlsZSk7XHJcbiAgICAgICAgbG9hZGVkW2hyZWZdID0gZGVmZXJyZWQ7XHJcblxyXG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlKCk7XHJcbiAgICB9XHJcblxyXG59KShqUXVlcnksIGRvY3VtZW50LCB1aUxvYWQpOyIsIisgZnVuY3Rpb24oJCkge1xyXG5cclxuICAgICQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIC8vIG5hdlxyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdbdWktbmF2XSBhJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKGUudGFyZ2V0KSxcclxuICAgICAgICAgICAgICAgICRhY3RpdmU7XHJcbiAgICAgICAgICAgICR0aGlzLmlzKCdhJykgfHwgKCR0aGlzID0gJHRoaXMuY2xvc2VzdCgnYScpKTtcclxuXHJcbiAgICAgICAgICAgICRhY3RpdmUgPSAkdGhpcy5wYXJlbnQoKS5zaWJsaW5ncyhcIi5hY3RpdmVcIik7XHJcbiAgICAgICAgICAgICRhY3RpdmUgJiYgJGFjdGl2ZS50b2dnbGVDbGFzcygnYWN0aXZlJykuZmluZCgnPiB1bDp2aXNpYmxlJykuc2xpZGVVcCgyMDApO1xyXG5cclxuICAgICAgICAgICAgKCR0aGlzLnBhcmVudCgpLmhhc0NsYXNzKCdhY3RpdmUnKSAmJiAkdGhpcy5uZXh0KCkuc2xpZGVVcCgyMDApKSB8fCAkdGhpcy5uZXh0KCkuc2xpZGVEb3duKDIwMCk7XHJcbiAgICAgICAgICAgICR0aGlzLnBhcmVudCgpLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcclxuXHJcbiAgICAgICAgICAgICR0aGlzLm5leHQoKS5pcygndWwnKSAmJiBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfSk7XHJcbn0oalF1ZXJ5KTsiLCIrIGZ1bmN0aW9uKCQpIHtcclxuXHJcbiAgICAkKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnW3VpLXRvZ2dsZS1jbGFzc10nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgdmFyICR0aGlzID0gJChlLnRhcmdldCk7XHJcbiAgICAgICAgICAgICR0aGlzLmF0dHIoJ3VpLXRvZ2dsZS1jbGFzcycpIHx8ICgkdGhpcyA9ICR0aGlzLmNsb3Nlc3QoJ1t1aS10b2dnbGUtY2xhc3NdJykpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGNsYXNzZXMgPSAkdGhpcy5hdHRyKCd1aS10b2dnbGUtY2xhc3MnKS5zcGxpdCgnLCcpLFxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0cyA9ICgkdGhpcy5hdHRyKCd0YXJnZXQnKSAmJiAkdGhpcy5hdHRyKCd0YXJnZXQnKS5zcGxpdCgnLCcpKSB8fCBBcnJheSgkdGhpcyksXHJcbiAgICAgICAgICAgICAgICBrZXkgPSAwO1xyXG4gICAgICAgICAgICAkLmVhY2goY2xhc3NlcywgZnVuY3Rpb24oaW5kZXgsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gdGFyZ2V0c1sodGFyZ2V0cy5sZW5ndGggJiYga2V5KV07XHJcbiAgICAgICAgICAgICAgICAkKHRhcmdldCkudG9nZ2xlQ2xhc3MoY2xhc3Nlc1tpbmRleF0pO1xyXG4gICAgICAgICAgICAgICAga2V5Kys7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkdGhpcy50b2dnbGVDbGFzcygnYWN0aXZlJyk7XHJcblxyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0oalF1ZXJ5KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xpc3RNYW5hZ2VyLmFsbCcsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9saXN0TWFuYWdlci9hbGwvYWxsLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnYWxsQ3RybCcsXG4gICAgICAgIHVybDogJy9saXN0TWFuYWdlcicsXG4gICAgICAgIC8vIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICAvLyB9LFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBsZXR0ZXJzOiAobGNGYWN0b3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxjRmFjdG9yeS5nZXRMZXR0ZXJzKHt9KS50aGVuKGxldHRlcnMgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGV0dGVyc1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdhbGxDdHJsJywgKCRzY29wZSwgbGNGYWN0b3J5LCBsZXR0ZXJzLCAkc3RhdGUpID0+IHtcbiAgICAkc2NvcGUubGV0dGVycyA9IGxldHRlcnNcbiAgICAkc2NvcGUuc3RhdGUgPSB7XG4gICAgICAgIDE6ICdOZXcnLFxuICAgICAgICAyOiAnUmV2aWV3ZWQnLFxuICAgICAgICAzOiAnQW1lbmRlZCcsXG4gICAgICAgIDQ6ICdGcm96ZW4nLFxuICAgICAgICA1OiAnUGVuZGluZyBVcGRhdGUnXG4gICAgfVxuICAgICRzY29wZS50cmFuc2l0aW9uID0gKGxjTnVtYmVyKSA9PiB7XG4gICAgICAgICRzdGF0ZS5nbygnc2luZ2xlTGMnLCB7XG4gICAgICAgICAgICBsY051bWJlcjogbGNOdW1iZXJcbiAgICAgICAgfSlcbiAgICB9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xpc3RNYW5hZ2VyLmFtZW5kZWQnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbGlzdE1hbmFnZXIvYW1lbmRlZC9hbWVuZGVkLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnYW1lbmRlZEN0cmwnLFxuICAgICAgICB1cmw6ICcvbGlzdE1hbmFnZXIvYW1lbmRlZCcsXG4gICAgICAgIC8vIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICAvLyB9LFxuICAgICAgICByZXNvbHZlOiB7fVxuICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ2FtZW5kZWRDdHJsJywgKCRzY29wZSwgbGNGYWN0b3J5LCBsZXR0ZXJzLCAkc3RhdGUpID0+IHtcbiAgICAkc2NvcGUuZGlzcGxheUxldHRlcnMgPSAkc2NvcGUubGV0dGVycy5maWx0ZXIobGV0dGVyID0+IHtcbiAgICAgICAgcmV0dXJuIGxldHRlci5zdGF0ZSA9PT0gM1xuICAgIH0pXG4gICAgJHN0YXRlLnRyYW5zaXRpb24gPSAobGNfbnVtYmVyKSA9PiB7XG4gICAgICAgICRzdGF0ZS5nbygnc2luZ2xlTGMnLCB7XG4gICAgICAgICAgICBsY19udW1iZXI6IGxjX251bWJlclxuICAgICAgICB9KVxuICAgIH1cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbGlzdE1hbmFnZXIuZnJvemVuJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xpc3RNYW5hZ2VyL2Zyb3plbi9mcm96ZW4uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdmcm96ZW5DdHJsJyxcbiAgICAgICAgdXJsOiAnL2xpc3RNYW5hZ2VyL2Zyb3plbicsXG4gICAgICAgIHBhcmVudDogJ2xpc3RNYW5hZ2VyJyxcbiAgICAgICAgLy8gZGF0YToge1xuICAgICAgICAvLyAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIC8vIH0sXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIGxldHRlcnM6IChsY0ZhY3RvcnkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGNGYWN0b3J5LmdldExldHRlcnMoe1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZTogNFxuICAgICAgICAgICAgICAgIH0pLnRoZW4obGV0dGVycyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsZXR0ZXJzXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ2Zyb3plbkN0cmwnLCAoJHNjb3BlLCBsY0ZhY3RvcnksIGxldHRlcnMsICRzdGF0ZSkgPT4ge1xuICAgICRzY29wZS5kaXNwbGF5TGV0dGVycyA9ICRzY29wZS5sZXR0ZXJzLmZpbHRlcihsZXR0ZXIgPT4ge1xuICAgICAgICByZXR1cm4gbGV0dGVyLnN0YXRlID09PSA0XG4gICAgfSlcbiAgICAkc2NvcGUudHJhbnNpdGlvbiA9IChsY051bWJlcikgPT4ge1xuICAgICAgICAkc3RhdGUuZ28oJ3NpbmdsZUxjJywge1xuICAgICAgICAgICAgbGNOdW1iZXI6IGxjTnVtYmVyXG4gICAgICAgIH0pXG4gICAgfVxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsaXN0TWFuYWdlci5uZXdMY3MnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbGlzdE1hbmFnZXIvbmV3TGNzL25ld0xjcy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ25ld0xjc0N0cmwnLFxuICAgICAgICB1cmw6ICcvbGlzdE1hbmFnZXIvbmV3TGNzJyxcbiAgICAgICAgcGFyZW50OiAnbGlzdE1hbmFnZXInLFxuICAgICAgICAvLyBkYXRhOiB7XG4gICAgICAgIC8vICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgLy8gfSxcbiAgICAgICAgcmVzb2x2ZToge31cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCduZXdMY3NDdHJsJywgKCRzY29wZSwgbGNGYWN0b3J5LCBsZXR0ZXJzLCAkc3RhdGUpID0+IHtcbiAgICAkc2NvcGUubGV0dGVycyA9ICRzY29wZS5sZXR0ZXJzLmZpbHRlcihsZXR0ZXIgPT4ge1xuICAgICAgICByZXR1cm4gbGV0dGVyLnN0YXRlID09PSAxXG4gICAgfSlcbiAgICBjb25zb2xlLmxvZygkc2NvcGUubGV0dGVycylcbiAgICAkc2NvcGUuc3RhdGUgPSB7XG4gICAgICAgIDE6ICdOZXcnLFxuICAgICAgICAyOiAnUmV2aWV3ZWQnLFxuICAgICAgICAzOiAnQW1lbmRlZCcsXG4gICAgICAgIDQ6ICdGcm96ZW4nLFxuICAgICAgICA1OiAnUGVuZGluZyBVcGRhdGUnXG4gICAgfVxuICAgICRzY29wZS50cmFuc2l0aW9uID0gKGxjTnVtYmVyKSA9PiB7XG4gICAgICAgICRzdGF0ZS5nbygnc2luZ2xlTGMnLCB7XG4gICAgICAgICAgICBsY051bWJlcjogbGNOdW1iZXJcbiAgICAgICAgfSlcbiAgICB9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xpc3RNYW5hZ2VyLnJldmlld2VkJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xpc3RNYW5hZ2VyL3Jldmlld2VkL3Jldmlld2VkLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAncmV2aWV3ZWRDdHJsJyxcbiAgICAgICAgdXJsOiAnL2xpc3RNYW5hZ2VyL3Jldmlld2VkJyxcbiAgICAgICAgcGFyZW50OiAnbGlzdE1hbmFnZXInLFxuICAgICAgICAvLyBkYXRhOiB7XG4gICAgICAgIC8vICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgLy8gfSxcbiAgICAgICAgcmVzb2x2ZToge31cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdyZXZpZXdlZEN0cmwnLCAoJHNjb3BlLCBsY0ZhY3RvcnksIGxldHRlcnMsICRzdGF0ZSkgPT4ge1xuICAgICRzY29wZS5kaXNwbGF5TGV0dGVycyA9ICRzY29wZS5sZXR0ZXJzLmZpbHRlcihsZXR0ZXIgPT4ge1xuICAgICAgICByZXR1cm4gbGV0dGVyLnN0YXRlID09PSAyXG4gICAgfSlcbiAgICAkc2NvcGUudHJhbnNpdGlvbiA9IChsY051bWJlcikgPT4ge1xuICAgICAgICAkc3RhdGUuZ28oJ3NpbmdsZUxjJywge1xuICAgICAgICAgICAgbGNOdW1iZXI6IGxjTnVtYmVyXG4gICAgICAgIH0pXG4gICAgfVxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsaXN0TWFuYWdlci51cGRhdGVkJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xpc3RNYW5hZ2VyL3VwZGF0ZWQvdXBkYXRlZC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ3VwZGF0ZWRDdHJsJyxcbiAgICAgICAgdXJsOiAnL2xpc3RNYW5hZ2VyL3VwZGF0ZWQnLFxuICAgICAgICAvLyBkYXRhOiB7XG4gICAgICAgIC8vICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgLy8gfSxcbiAgICAgICAgcmVzb2x2ZToge31cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCd1cGRhdGVkQ3RybCcsICgkc2NvcGUsIGxjRmFjdG9yeSwgbGV0dGVycywgJHN0YXRlKSA9PiB7XG4gICAgJHNjb3BlLmRpc3BsYXlMZXR0ZXJzID0gJHNjb3BlLmxldHRlcnMuZmlsdGVyKGxldHRlciA9PiB7XG4gICAgICAgIHJldHVybiBsZXR0ZXIuc3RhdGUgPT09IDVcbiAgICB9KVxuICAgICRzY29wZS50cmFuc2l0aW9uID0gKGxjTnVtYmVyKSA9PiB7XG4gICAgICAgICRzdGF0ZS5nbygnc2luZ2xlTGMnLCB7XG4gICAgICAgICAgICBsY051bWJlcjogbGNOdW1iZXJcbiAgICAgICAgfSlcbiAgICB9XG59KTsiLCJhcHAuZGlyZWN0aXZlKCdjaGF0JywgZnVuY3Rpb24oJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsIEFVVEhfRVZFTlRTLCAkc3RhdGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge30sXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvX2NvbW1vbi9kaXJlY3RpdmVzL2NoYXQvY2hhdC5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIFNvY2tldCkge1xuICAgICAgICAgICAgc2NvcGUuY2hhdCA9IGZhbHNlXG4gICAgICAgICAgICBzY29wZS5vcGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNjb3BlLmNoYXQpXG4gICAgICAgICAgICAgICAgc2NvcGUuY2hhdCA9ICFzY29wZS5jaGF0XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSk7IiwiYXBwLmRpcmVjdGl2ZSgnZm9vdGVyJywgZnVuY3Rpb24oJHN0YXRlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL19jb21tb24vZGlyZWN0aXZlcy9mb290ZXIvZm9vdGVyLmh0bWwnXG4gICAgfTtcblxufSk7IiwiYXBwLmRpcmVjdGl2ZSgnbmF2YmFyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsIEFVVEhfRVZFTlRTLCAkc3RhdGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge30sXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvX2NvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlKSB7XG5cbiAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuXG4gICAgICAgICAgICBzY29wZS5pc0xvZ2dlZEluID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UubG9nb3V0KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdsYW5kaW5nJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc2V0VXNlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gdXNlcjtcblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHJlbW92ZVVzZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNldFVzZXIoKTtcblxuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MsIHNldFVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9nb3V0U3VjY2VzcywgcmVtb3ZlVXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgcmVtb3ZlVXNlcik7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSk7Il19
