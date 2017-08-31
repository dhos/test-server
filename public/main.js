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
app.directive('footer', function ($state) {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/_common/directives/footer/footer.html'
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFtZW5kTGMvYW1lbmRMYy5qcyIsImFyY2hpdmUvYXJjaGl2ZS5qcyIsImNsYXVzZU1hbmFnZXIvY2xhdXNlTWFuYWdlci5qcyIsImNyZWF0ZUxjL2NyZWF0ZUxjLmpzIiwiZGFzaGJvYXJkL2Rhc2hib2FyZC5qcyIsImFtZW5kTGlzdC9hbWVuZExpc3QuanMiLCJkcmFmdHMvZHJhZnRzLmpzIiwibGFuZGluZy9sYW5kaW5nLmpzIiwibGlzdE1hbmFnZXIvbGlzdE1hbmFnZXIuanMiLCJzaW5nbGVMYy9zaW5nbGVMYy5qcyIsIl9jb21tb24vZmFjdG9yaWVzL2JhbmtGYWN0b3J5LmpzIiwiX2NvbW1vbi9mYWN0b3JpZXMvY291bnRyeUZhY3RvcnkuanMiLCJfY29tbW9uL2ZhY3Rvcmllcy9sY0ZhY3RvcnkuanMiLCJfY29tbW9uL2ZhY3Rvcmllcy91c2VyRmFjdG9yeS5qcyIsIl9jb21tb24vcHJlYnVpbHQvZnNhLXByZS1idWlsdC5qcyIsIl9jb21tb24vcHJlYnVpbHQvdWktY2xpZW50LmpzIiwiX2NvbW1vbi9wcmVidWlsdC91aS1qcC5qcyIsIl9jb21tb24vcHJlYnVpbHQvdWktbG9hZC5qcyIsIl9jb21tb24vcHJlYnVpbHQvdWktbmF2LmpzIiwiX2NvbW1vbi9wcmVidWlsdC91aS10b2dnbGUuanMiLCJsaXN0TWFuYWdlci9hbGwvYWxsLmpzIiwibGlzdE1hbmFnZXIvYW1lbmRlZC9hbWVuZGVkLmpzIiwibGlzdE1hbmFnZXIvbmV3TGNzL25ld0xjcy5qcyIsImxpc3RNYW5hZ2VyL2Zyb3plbi9mcm96ZW4uanMiLCJsaXN0TWFuYWdlci9yZXZpZXdlZC9yZXZpZXdlZC5qcyIsImxpc3RNYW5hZ2VyL3VwZGF0ZWQvdXBkYXRlZC5qcyIsIl9jb21tb24vZGlyZWN0aXZlcy9mb290ZXIvZm9vdGVyLmpzIiwiX2NvbW1vbi9kaXJlY3RpdmVzL2NoYXQvY2hhdC5qcyIsIl9jb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmpzIl0sIm5hbWVzIjpbIndpbmRvdyIsImFwcCIsImFuZ3VsYXIiLCJtb2R1bGUiLCJjb25maWciLCIkdXJsUm91dGVyUHJvdmlkZXIiLCIkbG9jYXRpb25Qcm92aWRlciIsIiRjb21waWxlUHJvdmlkZXIiLCJodG1sNU1vZGUiLCJhSHJlZlNhbml0aXphdGlvbldoaXRlbGlzdCIsIm90aGVyd2lzZSIsIndoZW4iLCJsb2NhdGlvbiIsInJlbG9hZCIsInJ1biIsIiRyb290U2NvcGUiLCJBdXRoU2VydmljZSIsIiRzdGF0ZSIsImRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGgiLCJzdGF0ZSIsImRhdGEiLCJhdXRoZW50aWNhdGUiLCIkb24iLCJldmVudCIsInRvU3RhdGUiLCJ0b1BhcmFtcyIsImlzQXV0aGVudGljYXRlZCIsInByZXZlbnREZWZhdWx0IiwiZ2V0TG9nZ2VkSW5Vc2VyIiwidGhlbiIsInVzZXIiLCJ0cmFuc2l0aW9uVG8iLCJuYW1lIiwiJHN0YXRlUHJvdmlkZXIiLCJ0ZW1wbGF0ZVVybCIsImNvbnRyb2xsZXIiLCJ1cmwiLCJyZXNvbHZlIiwibGV0dGVyIiwibGNGYWN0b3J5IiwiJHN0YXRlUGFyYW1zIiwiZ2V0U2luZ2xlTGV0dGVyIiwibGNfbnVtYmVyIiwiJHNjb3BlIiwiY291bnRyeUZhY3RvcnkiLCJ1c2VyRmFjdG9yeSIsImJhbmtGYWN0b3J5IiwidXBkYXRlTGMiLCJjb25zb2xlIiwibG9nIiwidXBkYXRlZEZpbGUiLCJ1cGRhdGVMZXR0ZXJGaWxlIiwiZ28iLCJnZXRCYW5rcyIsImJhbmtzIiwiZ2V0Q291bnRyaWVzIiwiY291bnRyaWVzIiwiZ2V0VXNlcnMiLCJyb2xlIiwicGljVXNlcnMiLCJjc3BVc2VycyIsImFyY2hpdmVkTGV0dGVycyIsImdldExldHRlcnMiLCJhcmNoaXZlZCIsImxldHRlcnMiLCJjcmVhdGVMYyIsImNyZWF0ZUxldHRlciIsImZpbGUiLCJ1cGxvYWRzIiwiYW1tZW5kbWVudHMiLCJkYXRlIiwiRGF0ZSIsIm5vdyIsImNvdW50cnkiLCJjbGllbnQiLCJiYW5rIiwicHNyIiwiY3JjIiwiZHJhZnQiLCJmaW5Eb2MiLCJmaW5EYXRlIiwidGVzdCIsImxldHRlclRvQmVDcmVhdGVkIiwiYWRkTGNBdHRhY2htZW50IiwiZmlsZVRvQmVBZGRlZCIsImxjSWQiLCJzZXRMY1RvQW1tZW5kZWQiLCJsZXR0ZXJUb0JlVXBkYXRlZCIsInN0YXR1cyIsInVwZGF0ZUxldHRlciIsInNldExjVG9SZXZpZXdlZCIsInNldExjVG9Gcm96ZW4iLCJzZXRMY1RvQXJjaGl2ZWQiLCJhbWVuZGVkIiwiZm9yRWFjaCIsImlkIiwidXNlcm5hbWUiLCJ0cmFuc2l0aW9uIiwiZHJhZnRzZExldHRlcnMiLCJkcmFmdHMiLCJsb2dpbiIsImVycm9yIiwiY3JlYXRlVXNlciIsInBhc3N3b3JkIiwic2VuZExvZ2luIiwibG9naW5JbmZvIiwiYWJzdHJhY3QiLCJsY051bWJlciIsImFwcHJvdmVkIiwiY29udGVudCIsImxlbmd0aCIsInJlamVjdGVkIiwicmVmZXJlbmNlIiwiYW1lbmRtZW50cyIsImxhc3RNb2RpZmllZCIsImpRdWVyeSIsImV4dGVuZCIsIk9iamVjdCIsImtleXMiLCJrZXkiLCJzdGF0ZXMiLCJhcHByb3ZlQW1lbmRtZW50IiwicmVqZWN0QW1lbmRtZW50IiwiZWRpdEFtZW5kbWVudCIsImV4cGFuZGVkIiwiYW1tZW5kZWQiLCJ0b3RhbCIsInN1Ym1pdERyYWZ0IiwiZmFjdG9yeSIsIiRodHRwIiwiJHEiLCJkIiwicXVlcnkiLCJnZXQiLCJwYXJhbXMiLCJyZXNwb25zZSIsImNhdGNoIiwicmVqZWN0IiwibWVzc2FnZSIsImVyciIsImdldFNpbmdsZUJhbmsiLCJjcmVhdGVCYW5rIiwicG9zdCIsInVwZGF0ZUJhbmsiLCJwdXQiLCJkZWxldGVCYW5rIiwiZGVsZXRlIiwiZ2V0U2luZ2xlQ291bnRyeSIsImNyZWF0ZUNvdW50cnkiLCJDb3VudHJ5IiwidXBkYXRlQ291bnRyeSIsImRlbGV0ZUNvdW50cnkiLCJnZXRMZXR0ZXJDb3VudCIsImZkIiwiRm9ybURhdGEiLCJhcHBlbmQiLCJ0b0pzb24iLCJ0cmFuc2Zvcm1SZXF1ZXN0IiwiaWRlbnRpdHkiLCJoZWFkZXJzIiwidW5kZWZpbmVkIiwiYm9keSIsInVwZGF0ZXMiLCJkZWxldGVMZXR0ZXIiLCJjcmVkZW50aWFscyIsImVtYWlsIiwidXBkYXRlVXNlciIsImdldFVzZXJCeUlkIiwiRXJyb3IiLCJpbyIsInNvY2tldCIsImNvbm5lY3QiLCJvcmlnaW4iLCJvbiIsImV2ZW50TmFtZSIsImNhbGxiYWNrIiwiYXJncyIsImFyZ3VtZW50cyIsIiRhcHBseSIsImFwcGx5IiwiZW1pdCIsImNvbnN0YW50IiwibG9naW5TdWNjZXNzIiwibG9naW5GYWlsZWQiLCJsb2dvdXRTdWNjZXNzIiwic2Vzc2lvblRpbWVvdXQiLCJub3RBdXRoZW50aWNhdGVkIiwibm90QXV0aG9yaXplZCIsIkFVVEhfRVZFTlRTIiwic3RhdHVzRGljdCIsInJlc3BvbnNlRXJyb3IiLCIkYnJvYWRjYXN0IiwiJGh0dHBQcm92aWRlciIsImludGVyY2VwdG9ycyIsInB1c2giLCIkaW5qZWN0b3IiLCJzZXJ2aWNlIiwiU2Vzc2lvbiIsIm9uU3VjY2Vzc2Z1bExvZ2luIiwiY3JlYXRlIiwiZnJvbVNlcnZlciIsInNpZ251cCIsImxvZ291dCIsImRlc3Ryb3kiLCJzZWxmIiwic2Vzc2lvbklkIiwiRXZlbnRFbWl0dGVyIiwic3Vic2NyaWJlcnMiLCJFRSIsInByb3RvdHlwZSIsImV2ZW50TGlzdGVuZXIiLCJyZW1haW5pbmdBcmdzIiwic2xpY2UiLCJjYWxsIiwibGlzdGVuZXIiLCIkIiwiaXNJRSIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsIm1hdGNoIiwiYWRkQ2xhc3MiLCJ1YSIsImVhY2giLCJvcHRpb25zIiwiZXZhbCIsImF0dHIiLCJpc1BsYWluT2JqZWN0IiwidWlMb2FkIiwibG9hZCIsImpwX2NvbmZpZyIsIiRkb2N1bWVudCIsImxvYWRlZCIsInByb21pc2UiLCJkZWZlcnJlZCIsIkRlZmVycmVkIiwic3JjcyIsImlzQXJyYXkiLCJzcGxpdCIsImluZGV4Iiwic3JjIiwiaW5kZXhPZiIsImxvYWRDU1MiLCJsb2FkU2NyaXB0Iiwic2NyaXB0IiwiY3JlYXRlRWxlbWVudCIsIm9ubG9hZCIsImUiLCJvbmVycm9yIiwiYXBwZW5kQ2hpbGQiLCJocmVmIiwic3R5bGUiLCJyZWwiLCJ0eXBlIiwiaGVhZCIsImRvY3VtZW50IiwiJHRoaXMiLCJ0YXJnZXQiLCIkYWN0aXZlIiwiaXMiLCJjbG9zZXN0IiwicGFyZW50Iiwic2libGluZ3MiLCJ0b2dnbGVDbGFzcyIsImZpbmQiLCJzbGlkZVVwIiwiaGFzQ2xhc3MiLCJuZXh0Iiwic2xpZGVEb3duIiwiY2xhc3NlcyIsInRhcmdldHMiLCJBcnJheSIsInZhbHVlIiwiZGlzcGxheUxldHRlcnMiLCJmaWx0ZXIiLCJkaXJlY3RpdmUiLCJyZXN0cmljdCIsInNjb3BlIiwibGluayIsIlNvY2tldCIsImNoYXQiLCJvcGVuIiwiaXNMb2dnZWRJbiIsInNldFVzZXIiLCJyZW1vdmVVc2VyIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFDQUEsT0FBQUMsR0FBQSxHQUFBQyxRQUFBQyxNQUFBLENBQUEsaUJBQUEsRUFBQSxDQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsY0FBQSxFQUFBLFlBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxDQUFBLENBQUE7O0FBRUFGLElBQUFHLE1BQUEsQ0FBQSxVQUFBQyxrQkFBQSxFQUFBQyxpQkFBQSxFQUFBQyxnQkFBQSxFQUFBO0FBQ0E7QUFDQUQsc0JBQUFFLFNBQUEsQ0FBQSxJQUFBO0FBQ0FELHFCQUFBRSwwQkFBQSxDQUFBLDJDQUFBO0FBQ0E7QUFDQUosdUJBQUFLLFNBQUEsQ0FBQSxHQUFBO0FBQ0E7QUFDQUwsdUJBQUFNLElBQUEsQ0FBQSxpQkFBQSxFQUFBLFlBQUE7QUFDQVgsZUFBQVksUUFBQSxDQUFBQyxNQUFBO0FBQ0EsS0FGQTtBQUdBLENBVkE7O0FBWUE7QUFDQVosSUFBQWEsR0FBQSxDQUFBLFVBQUFDLFVBQUEsRUFBQUMsV0FBQSxFQUFBQyxNQUFBLEVBQUE7O0FBRUE7QUFD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QSxDQUFBc0ssWUFBQUgsY0FBQSxFQUFBa0csVUFBQTtBQUVBOztBQXBDQSxLQUFBO0FBd0NBLENBekNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG53aW5kb3cuYXBwID0gYW5ndWxhci5tb2R1bGUoJ2VsaXRlLWxjLXBvcnRhbCcsIFsnZnNhUHJlQnVpbHQnLCAndWkucm91dGVyJywgJ3VpLmJvb3RzdHJhcCcsICduZ01hdGVyaWFsJywgJ25nRmlsZVVwbG9hZCcsICduZ0FuaW1hdGUnXSk7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24oJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlciwgJGNvbXBpbGVQcm92aWRlcikge1xuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAgJGNvbXBpbGVQcm92aWRlci5hSHJlZlNhbml0aXphdGlvbldoaXRlbGlzdCgvXlxccyooaHR0cHM/fGxvY2FsfGRhdGF8Y2hyb21lLWV4dGVuc2lvbik6Lyk7XG4gICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuICAgIC8vIFRyaWdnZXIgcGFnZSByZWZyZXNoIHdoZW4gYWNjZXNzaW5nIGFuIE9BdXRoIHJvdXRlXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLndoZW4oJy9hdXRoLzpwcm92aWRlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgfSk7XG59KTtcblxuLy8gVGhpcyBhcHAucnVuIGlzIGZvciBjb250cm9sbGluZyBhY2Nlc3MgdG8gc3BlY2lmaWMgc3RhdGVzLlxuYXBwLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlKSB7XG5cbiAgICAvLyBUaGUgZ2l2ZW4gc3RhdGUgcmVxdWlyZXMgYW4gYXV0aGVudGljYXRlZCB1c2VyLlxuICAgIHZhciBkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoID0gZnVuY3Rpb24oc3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlLmRhdGEgJiYgc3RhdGUuZGF0YS5hdXRoZW50aWNhdGU7XG4gICAgfTtcblxuICAgIC8vICRzdGF0ZUNoYW5nZVN0YXJ0IGlzIGFuIGV2ZW50IGZpcmVkXG4gICAgLy8gd2hlbmV2ZXIgdGhlIHByb2Nlc3Mgb2YgY2hhbmdpbmcgYSBzdGF0ZSBiZWdpbnMuXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zKSB7XG5cbiAgICAgICAgaWYgKCFkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoKHRvU3RhdGUpKSB7XG4gICAgICAgICAgICAvLyBUaGUgZGVzdGluYXRpb24gc3RhdGUgZG9lcyBub3QgcmVxdWlyZSBhdXRoZW50aWNhdGlvblxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuICAgICAgICAgICAgLy8gVGhlIHVzZXIgaXMgYXV0aGVudGljYXRlZC5cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYW5jZWwgbmF2aWdhdGluZyB0byBuZXcgc3RhdGUuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgICAvLyBJZiBhIHVzZXIgaXMgcmV0cmlldmVkLCB0aGVuIHJlbmF2aWdhdGUgdG8gdGhlIGRlc3RpbmF0aW9uXG4gICAgICAgICAgICAvLyAodGhlIHNlY29uZCB0aW1lLCBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSB3aWxsIHdvcmspXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIGlmIG5vIHVzZXIgaXMgbG9nZ2VkIGluLCBnbyB0byBcImxvZ2luXCIgc3RhdGUuXG4gICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgICRzdGF0ZS50cmFuc2l0aW9uVG8odG9TdGF0ZS5uYW1lLCB0b1BhcmFtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzdGF0ZS50cmFuc2l0aW9uVG8oJ2hvbWUnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhbWVuZExjJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FtZW5kTGMvYW1lbmRMYy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2FtZW5kTGNDdHJsJyxcbiAgICAgICAgdXJsOiAnL2FtZW5kLzpsY19udW1iZXInLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBsZXR0ZXI6IChsY0ZhY3RvcnksICRzdGF0ZVBhcmFtcykgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBsY0ZhY3RvcnkuZ2V0U2luZ2xlTGV0dGVyKCRzdGF0ZVBhcmFtcy5sY19udW1iZXIpLnRoZW4obGV0dGVyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxldHRlclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdhbWVuZExjQ3RybCcsICgkc2NvcGUsIGxjRmFjdG9yeSwgY291bnRyeUZhY3RvcnksIHVzZXJGYWN0b3J5LCBiYW5rRmFjdG9yeSwgbGV0dGVyLCAkc3RhdGUpID0+IHtcbiAgICAkc2NvcGUubGV0dGVyID0gbGV0dGVyXG5cbiAgICAkc2NvcGUudXBkYXRlTGMgPSAoKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS51cGRhdGVkRmlsZSlcbiAgICAgICAgbGNGYWN0b3J5LnVwZGF0ZUxldHRlckZpbGUoJHNjb3BlLmxldHRlciwgJHNjb3BlLnVwZGF0ZWRGaWxlKS50aGVuKGxldHRlciA9PiB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ3NpbmdsZUxjJywge1xuICAgICAgICAgICAgICAgIGxjX251bWJlcjogbGV0dGVyLmxjX251bWJlclxuICAgICAgICAgICAgfSlcblxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vZ2V0IGJhbmtzXG4gICAgYmFua0ZhY3RvcnkuZ2V0QmFua3Moe30pLnRoZW4oYmFua3MgPT4ge1xuICAgICAgICAgICAgJHNjb3BlLmJhbmtzID0gYmFua3NcbiAgICAgICAgfSlcbiAgICAgICAgLy9nZXQgY291bnRyaWVzXG4gICAgY291bnRyeUZhY3RvcnkuZ2V0Q291bnRyaWVzKHt9KS50aGVuKGNvdW50cmllcyA9PiB7XG4gICAgICAgICAgICAkc2NvcGUuY291bnRyaWVzID0gY291bnRyaWVzXG4gICAgICAgIH0pXG4gICAgICAgIC8vZ2V0IHBpY3VzZXJzXG4gICAgdXNlckZhY3RvcnkuZ2V0VXNlcnMoe1xuICAgICAgICAgICAgcm9sZTogMVxuICAgICAgICB9KS50aGVuKHBpY1VzZXJzID0+IHtcbiAgICAgICAgICAgICRzY29wZS5waWNVc2VycyA9IHBpY1VzZXJzXG4gICAgICAgIH0pXG4gICAgICAgIC8vZ2V0IGNzcHVzZXJzXG4gICAgdXNlckZhY3RvcnkuZ2V0VXNlcnMoe1xuICAgICAgICByb2xlOiAyXG4gICAgfSkudGhlbihjc3BVc2VycyA9PiB7XG4gICAgICAgICRzY29wZS5jc3BVc2VycyA9IGNzcFVzZXJzXG4gICAgfSlcblxufSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2FyY2hpdmUnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvYXJjaGl2ZS9hcmNoaXZlLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnYXJjaGl2ZUN0cmwnLFxuICAgICAgICB1cmw6ICcvYXJjaGl2ZScsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIGFyY2hpdmVkTGV0dGVyczogKGxjRmFjdG9yeSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBsY0ZhY3RvcnkuZ2V0TGV0dGVycyh7XG4gICAgICAgICAgICAgICAgICAgIGFyY2hpdmVkOiB0cnVlXG4gICAgICAgICAgICAgICAgfSkudGhlbihhcmNoaXZlZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhcmNoaXZlZFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdhcmNoaXZlQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgYXJjaGl2ZWQpIHtcbiAgICAkc2NvcGUubGV0dGVycyA9IGFyY2hpdmVkXG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnY2xhdXNlTWFuYWdlcicsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jbGF1c2VNYW5hZ2VyL2NsYXVzZU1hbmFnZXIuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdjbGF1c2VNYW5hZ2VyQ3RybCcsXG4gICAgICAgIHVybDogJy9jbGF1c2VNYW5hZ2VyJ1xuICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ2NsYXVzZU1hbmFnZXJDdHJsJywgZnVuY3Rpb24oJHNjb3BlKSB7XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnY3JlYXRlTGMnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY3JlYXRlTGMvY3JlYXRlTGMuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdjcmVhdGVMY0N0cmwnLFxuICAgICAgICB1cmw6ICcvY3JlYXRlTGMnXG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignY3JlYXRlTGNDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBsY0ZhY3RvcnksIGNvdW50cnlGYWN0b3J5LCB1c2VyRmFjdG9yeSwgYmFua0ZhY3RvcnkpIHtcbiAgICAvL2ZpbmQgdGhlIHVzZXJzIHRoYXQgYXJlIGNsaWVudHMsXG4gICAgLy9maW5kIHRoZSB1c2VycyB0aGF0IGFyZSBjc3AvcGljXG4gICAgJHNjb3BlLmNyZWF0ZUxjID0gKCkgPT4ge1xuICAgICAgICBsY0ZhY3RvcnkuY3JlYXRlTGV0dGVyKCRzY29wZS5sZXR0ZXIsICRzY29wZS5maWxlKS50aGVuKGxldHRlciA9PiB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ3NpbmdsZUxjJywge1xuICAgICAgICAgICAgICAgIGxjX251bWJlcjogbGV0dGVyLmxjX251bWJlclxuICAgICAgICAgICAgfSlcblxuICAgICAgICB9KVxuICAgIH1cblxuICAgIC8vZ2V0IGJhbmtzXG4gICAgYmFua0ZhY3RvcnkuZ2V0QmFua3Moe30pLnRoZW4oYmFua3MgPT4ge1xuICAgICAgICAgICAgJHNjb3BlLmJhbmtzID0gYmFua3NcbiAgICAgICAgfSlcbiAgICAgICAgLy9nZXQgY291bnRyaWVzXG4gICAgY291bnRyeUZhY3RvcnkuZ2V0Q291bnRyaWVzKHt9KS50aGVuKGNvdW50cmllcyA9PiB7XG4gICAgICAgICAgICAkc2NvcGUuY291bnRyaWVzID0gY291bnRyaWVzXG4gICAgICAgIH0pXG4gICAgICAgIC8vZ2V0IHBpY3VzZXJzXG4gICAgdXNlckZhY3RvcnkuZ2V0VXNlcnMoe1xuICAgICAgICAgICAgcm9sZTogMVxuICAgICAgICB9KS50aGVuKHBpY1VzZXJzID0+IHtcbiAgICAgICAgICAgICRzY29wZS5waWNVc2VycyA9IHBpY1VzZXJzXG4gICAgICAgIH0pXG4gICAgICAgIC8vZ2V0IGNzcHVzZXJzXG4gICAgdXNlckZhY3RvcnkuZ2V0VXNlcnMoe1xuICAgICAgICByb2xlOiAyXG4gICAgfSkudGhlbihjc3BVc2VycyA9PiB7XG4gICAgICAgICRzY29wZS5jc3BVc2VycyA9IGNzcFVzZXJzXG4gICAgfSlcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkYXNoYm9hcmQnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvZGFzaGJvYXJkL2Rhc2hib2FyZC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2Rhc2hib2FyZEN0cmwnLFxuICAgICAgICB1cmw6ICcvZGFzaGJvYXJkJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIC8vIGxldHRlcnM6IChsY0ZhY3RvcnkpID0+IHtcbiAgICAgICAgICAgIC8vICAgICByZXR1cm4gbGNGYWN0b3J5LmdldExldHRlcnMoe30pLnRoZW4obGV0dGVycyA9PiB7XG4gICAgICAgICAgICAvLyAgICAgICAgIHJldHVybiBsZXR0ZXJzXG4gICAgICAgICAgICAvLyAgICAgfSlcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgfVxuICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ2Rhc2hib2FyZEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSwgbGNGYWN0b3J5KSB7XG5cbiAgICAvL2luaXRzXG4gICAgLy8gJHNjb3BlLmxldHRlcnMgPSBsZXR0ZXJzXG4gICAgLy8kc2NvcGUuYW5hbHl0aWNzID0gYW5hbHl0aWNzXG5cbiAgICAvL2VuZCBpbml0c1xuICAgICRzY29wZS5sZXR0ZXIgPSB7XG4gICAgICAgIGxjX251bWJlcjogMzQ1MzQ1MzUsXG4gICAgICAgIHVwbG9hZHM6IFsnU0dIU0JDN0cxODMwMTYzNC1UMDEucGRmJ10sXG4gICAgICAgIGFtbWVuZG1lbnRzOiB7XG4gICAgICAgICAgICAyMDogJ0JyaWRnZSBzZW50aWVudCBjaXR5IGJveSBtZXRhLWNhbWVyYSBmb290YWdlIERJWSBwYXBpZXItbWFjaGUgc2lnbiBjb25jcmV0ZSBodW1hbiBzaG9lcyBjb3VyaWVyLiBEZWFkIGRpZ2l0YWwgM0QtcHJpbnRlZCByYW5nZS1yb3ZlciBjb21wdXRlciBzZW5zb3J5IHNlbnRpZW50IGZyYW5jaGlzZSBicmlkZ2UgbmV0d29yayBtYXJrZXQgcmViYXIgdGFuay10cmFwcyBmcmVlLW1hcmtldCBodW1hbi4gQkFTRSBqdW1wIHN0aW11bGF0ZSBhcnRpc2FuYWwgbmFycmF0aXZlIGNvcnJ1cHRlZCBhc3NhdWx0IHJhbmdlLXJvdmVyIGZpbG0gbmFuby1wYXJhbm9pZCBzaHJpbmUgc2VtaW90aWNzIGNvbnZlbmllbmNlIHN0b3JlLiBTcHJhd2wgY29uY3JldGUgY29ycnVwdGVkIG1vZGVtIHNwb29rIGh1bWFuIGRpc3Bvc2FibGUgdG93YXJkcyBuYXJyYXRpdmUgaW5kdXN0cmlhbCBncmFkZSBnaXJsIHJlYWxpc20gd2VhdGhlcmVkIFRva3lvIHNhdmFudC4nLFxuICAgICAgICAgICAgMjI6ICdHcmVuYWRlIGxpZ2h0cyBjb21wdXRlciBzYXR1cmF0aW9uIHBvaW50IGN5YmVyLWxvbmctY2hhaW4gaHlkcm9jYXJib25zIGZpbG0gdGF0dG9vIHNreXNjcmFwZXIgVG9reW8gZGlnaXRhbCBpbnRvIGZsdWlkaXR5IGZyZWUtbWFya2V0IHRvd2FyZHMgcGlzdG9sLiBLYXRhbmEgYXNzYXVsdCBhc3Nhc3NpbiBmb290YWdlIGN5YmVyLWthbmppIG5ldHdvcmsgaW5kdXN0cmlhbCBncmFkZS4gQ29ycnVwdGVkIG5ldXJhbCByZWFsaXNtIGNvdXJpZXItd2FyZSBzZW5zb3J5IGJpY3ljbGUgZ2lybCBkZWNheSBmYWNlIGZvcndhcmRzLiBDb25jcmV0ZSB0b3dhcmRzIGNhcmRib2FyZCBESVkgbW9kZW0gbmV0d29yayBtb25vZmlsYW1lbnQgdGFuay10cmFwcyBhYmxhdGl2ZSB1cmJhbiBzcG9vayBkaXNwb3NhYmxlIGtuaWZlIGJpY3ljbGUgc2hhbnR5IHRvd24gd29tYW4uICdcbiAgICAgICAgfSxcbiAgICAgICAgZGF0ZTogRGF0ZS5ub3coKSxcbiAgICAgICAgY291bnRyeTogMSxcbiAgICAgICAgY2xpZW50OiAxLFxuICAgICAgICBiYW5rOiAnQmFuayBvZiBDaGluYScsXG4gICAgICAgIHBzcjogJ1NoYXJvbicsXG4gICAgICAgIGNyYzogJ0JvYicsXG4gICAgICAgIHN0YXRlOiA1LFxuICAgICAgICBkcmFmdDogZmFsc2UsXG4gICAgICAgIGZpbkRvYzogMCxcbiAgICAgICAgZmluRGF0ZTogbnVsbFxuXG4gICAgfVxuICAgICRzY29wZS50ZXN0ID0gKCkgPT4ge1xuXG4gICAgfVxuXG4gICAgLy9mdW5jdGlvbnMgdG8gZWRpdCBhbmQgYW1tZW5kIGxjc1xuICAgICRzY29wZS5jcmVhdGVMYyA9IChsZXR0ZXJUb0JlQ3JlYXRlZCkgPT4ge1xuICAgICAgICBsY0ZhY3RvcnkuY3JlYXRlTGV0dGVyKGxldHRlclRvQmVDcmVhdGVkKS50aGVuKGNyZWF0ZWRMZXR0ZXIgPT4ge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdsaXN0TWFuYWdlcicpXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgJHNjb3BlLmFkZExjQXR0YWNobWVudCA9IChmaWxlVG9CZUFkZGVkLCBsY0lkKSA9PiB7XG4gICAgICAgIGxjRmFjdG9yeS51cGRhdGVMZXR0ZXJGaWxlKGZpbGVUb0JlQWRkZWQsIGxjSWQpLnRoZW4obGV0dGVyID0+IHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygpXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgJHNjb3BlLnNldExjVG9BbW1lbmRlZCA9IChsZXR0ZXJUb0JlVXBkYXRlZCkgPT4ge1xuICAgICAgICBsZXR0ZXJUb0JlVXBkYXRlZC5zdGF0dXMgPSAzXG4gICAgICAgIGxjRmFjdG9yeS51cGRhdGVMZXR0ZXIobGV0dGVyVG9CZVVwZGF0ZWQpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdhbWVuZGVkJylcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAkc2NvcGUuc2V0TGNUb1Jldmlld2VkID0gKGxldHRlclRvQmVVcGRhdGVkKSA9PiB7XG4gICAgICAgIGxldHRlclRvQmVVcGRhdGVkLnN0YXR1cyA9IDJcbiAgICAgICAgbGNGYWN0b3J5LnVwZGF0ZUxldHRlcihsZXR0ZXJUb0JlVXBkYXRlZCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ3JldmlldycpXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgJHNjb3BlLnNldExjVG9Gcm96ZW4gPSAobGV0dGVyVG9CZVVwZGF0ZWQpID0+IHtcbiAgICAgICAgbGV0dGVyVG9CZVVwZGF0ZWQuc3RhdHVzID0gNFxuICAgICAgICBsY0ZhY3RvcnkudXBkYXRlTGV0dGVyKGxldHRlclRvQmVVcGRhdGVkKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnZnJvemVuJylcbiAgICAgICAgfSlcblxuICAgIH1cblxuICAgICRzY29wZS5zZXRMY1RvQXJjaGl2ZWQgPSAobGV0dGVyVG9CZVVwZGF0ZWQpID0+IHtcbiAgICAgICAgbGV0dGVyVG9CZVVwZGF0ZWQuZmluRG9jID0gJHNjb3BlLmZpbkRvY1xuICAgICAgICBsZXR0ZXJUb0JlVXBkYXRlZC5zdGF0dXMgPSA1XG4gICAgICAgIGxjRmFjdG9yeS51cGRhdGVMZXR0ZXIobGV0dGVyVG9CZVVwZGF0ZWQpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdhcmNoaXZlZCcpXG4gICAgICAgIH0pXG5cbiAgICB9XG5cbiAgICAvKmFtbWVuZG1lbnRzID0gW3tcbiAgICAgICAgc3dpZnRDb2RlOmludCxcbiAgICAgICAgcmVmZXJlbmNlOiB0ZXh0LFxuICAgICAgICBzdGF0dXM6IDAsMSwyLFxuICAgICAgICBkYXRlTW9kaWZpZWQ6ZGF0ZSAgXG4gICAgfV1cbiAgICAqL1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2FtZW5kTGlzdCcsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hbWVuZExpc3QvYW1lbmRMaXN0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnYW1lbmRMaXN0Q3RybCcsXG4gICAgICAgIHVybDogJy9hbWVuZExpc3QnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBhbWVuZGVkOiAobGNGYWN0b3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxjRmFjdG9yeS5nZXRMZXR0ZXJzKHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IDNcbiAgICAgICAgICAgICAgICB9KS50aGVuKGFtZW5kZWQgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYW1lbmRlZFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdhbWVuZExpc3RDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBhbWVuZGVkLCAkc3RhdGUsIGNvdW50cnlGYWN0b3J5LCB1c2VyRmFjdG9yeSwgYmFua0ZhY3RvcnkpIHtcbiAgICAvL2dldCBiYW5rc1xuICAgICRzY29wZS5iYW5rcyA9IHt9XG4gICAgYmFua0ZhY3RvcnkuZ2V0QmFua3Moe30pLnRoZW4oYmFua3MgPT4ge1xuICAgICAgICAgICAgYmFua3MuZm9yRWFjaChiYW5rID0+IHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuYmFua3NbYmFuay5pZF0gPSBiYW5rLm5hbWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICAgIC8vZ2V0IGNvdW50cmllc1xuICAgICRzY29wZS5jb3VudHJpZXMgPSB7fVxuICAgIGNvdW50cnlGYWN0b3J5LmdldENvdW50cmllcyh7fSkudGhlbihjb3VudHJpZXMgPT4ge1xuICAgICAgICBjb3VudHJpZXMuZm9yRWFjaChjb3VudHJ5ID0+IHtcbiAgICAgICAgICAgICRzY29wZS5jb3VudHJpZXNbY291bnRyeS5pZF0gPSBjb3VudHJ5Lm5hbWVcbiAgICAgICAgfSlcbiAgICB9KVxuXG4gICAgLy9nZXQgcGljdXNlcnNcbiAgICAkc2NvcGUucGljVXNlcnMgPSB7fVxuICAgIHVzZXJGYWN0b3J5LmdldFVzZXJzKHtcbiAgICAgICAgICAgIHJvbGU6IDFcbiAgICAgICAgfSkudGhlbihwaWNVc2VycyA9PiB7XG4gICAgICAgICAgICBwaWNVc2Vycy5mb3JFYWNoKHVzZXIgPT4ge1xuICAgICAgICAgICAgICAgICRzY29wZS5waWNVc2Vyc1t1c2VyLmlkXSA9IHVzZXIudXNlcm5hbWVcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICAgIC8vZ2V0IGNzcHVzZXJzXG4gICAgJHNjb3BlLmNzcFVzZXJzID0ge31cbiAgICB1c2VyRmFjdG9yeS5nZXRVc2Vycyh7XG4gICAgICAgIHJvbGU6IDJcbiAgICB9KS50aGVuKGNzcFVzZXJzID0+IHtcbiAgICAgICAgY3NwVXNlcnMuZm9yRWFjaCh1c2VyID0+IHtcbiAgICAgICAgICAgICRzY29wZS5jc3BVc2Vyc1t1c2VyLmlkXSA9IHVzZXIudXNlcm5hbWVcbiAgICAgICAgfSlcbiAgICB9KVxuICAgICRzY29wZS5sZXR0ZXJzID0gYW1lbmRlZFxuICAgICRzY29wZS50cmFuc2l0aW9uID0gKGxjX251bWJlcikgPT4ge1xuICAgICAgICAkc3RhdGUuZ28oJ2FtZW5kTGMnLCB7XG4gICAgICAgICAgICBsY19udW1iZXI6IGxjX251bWJlclxuICAgICAgICB9KVxuICAgIH1cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZHJhZnRzJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2RyYWZ0cy9kcmFmdHMuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdkcmFmdHNDdHJsJyxcbiAgICAgICAgdXJsOiAnL2RyYWZ0cycsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIGRyYWZ0c2RMZXR0ZXJzOiAobGNGYWN0b3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxjRmFjdG9yeS5nZXRMZXR0ZXJzKHtcbiAgICAgICAgICAgICAgICAgICAgZHJhZnQ6IHRydWVcbiAgICAgICAgICAgICAgICB9KS50aGVuKGRyYWZ0cyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkcmFmdHNcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignZHJhZnRzQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgZHJhZnRzKSB7XG4gICAgJHNjb3BlLmxldHRlcnMgPSBkcmFmdHNcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsYW5kaW5nJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xhbmRpbmcvbGFuZGluZy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2xhbmRpbmdDdHJsJyxcbiAgICAgICAgdXJsOiAnLycsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIHVzZXI6IChBdXRoU2VydmljZSwgJHN0YXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbih1c2VyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVzZXIpICRzdGF0ZS5nbygnZGFzaGJvYXJkJylcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignbGFuZGluZ0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIEF1dGhTZXJ2aWNlLCB1c2VyRmFjdG9yeSwgJHN0YXRlKSB7XG5cbiAgICAkc2NvcGUubG9naW4gPSB7fTtcbiAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuICAgICRzY29wZS5jcmVhdGVVc2VyID0gKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnaGVsbG8nKVxuICAgICAgICBsZXQgbG9naW4gPSB7XG4gICAgICAgICAgICB1c2VybmFtZTogJ3Rlc3QnLFxuICAgICAgICAgICAgcGFzc3dvcmQ6ICd0ZXN0J1xuICAgICAgICB9XG4gICAgICAgIHVzZXJGYWN0b3J5LmNyZWF0ZVVzZXIoe1xuICAgICAgICAgICAgdXNlcjogbG9naW5cbiAgICAgICAgfSkudGhlbih1c2VyID0+IHtcbiAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ2luKGxvZ2luKVxuICAgICAgICB9KVxuICAgIH1cbiAgICAkc2NvcGUuc2VuZExvZ2luID0gZnVuY3Rpb24obG9naW5JbmZvKSB7XG5cbiAgICAgICAgJHNjb3BlLmVycm9yID0gbnVsbDtcbiAgICAgICAgQXV0aFNlcnZpY2UubG9naW4obG9naW5JbmZvKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJHN0YXRlLnRyYW5zaXRpb25UbygnZGFzaGJvYXJkJyk7XG4gICAgICAgIH0pXG4gICAgfTtcbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsaXN0TWFuYWdlcicsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9saXN0TWFuYWdlci9saXN0TWFuYWdlci5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ2xpc3RNYW5hZ2VyQ3RybCcsXG4gICAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgbGV0dGVyczogKGxjRmFjdG9yeSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBsY0ZhY3RvcnkuZ2V0TGV0dGVycyh7fSkudGhlbihsZXR0ZXJzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxldHRlcnNcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignbGlzdE1hbmFnZXJDdHJsJywgKCRzY29wZSwgbGNGYWN0b3J5LCAkc3RhdGUsIGxldHRlcnMpID0+IHtcbiAgICAkc2NvcGUubGV0dGVycyA9IGxldHRlcnNcbiAgICAkc2NvcGUuc3RhdGUgPSB7XG4gICAgICAgIDE6ICdOZXcnLFxuICAgICAgICAyOiAnUmV2aWV3ZWQnLFxuICAgICAgICAzOiAnQW1lbmRlZCcsXG4gICAgICAgIDQ6ICdGcm96ZW4nLFxuICAgICAgICA1OiAnUGVuZGluZyBVcGRhdGUnXG4gICAgfVxuXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnc2luZ2xlTGMnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvc2luZ2xlTGMvc2luZ2xlTGMuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdzaW5nbGVMY0N0cmwnLFxuICAgICAgICB1cmw6ICcvbGMvOmxjTnVtYmVyJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIGxldHRlcjogKGxjRmFjdG9yeSwgJHN0YXRlUGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxjRmFjdG9yeS5nZXRTaW5nbGVMZXR0ZXIoJHN0YXRlUGFyYW1zLmxjTnVtYmVyKS50aGVuKGxldHRlciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsZXR0ZXJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignc2luZ2xlTGNDdHJsJywgKCRzY29wZSwgbGNGYWN0b3J5LCBsZXR0ZXIpID0+IHtcbiAgICAkc2NvcGUubGV0dGVyID0gbGV0dGVyXG4gICAgJHNjb3BlLmFwcHJvdmVkID0ge1xuICAgICAgICBjb250ZW50OiB7fSxcbiAgICAgICAgbGVuZ3RoOiAwXG4gICAgfVxuICAgICRzY29wZS5hbWVuZGVkID0ge1xuICAgICAgICBjb250ZW50OiB7fSxcbiAgICAgICAgbGVuZ3RoOiAwXG4gICAgfVxuICAgICRzY29wZS5yZWplY3RlZCA9IHtcbiAgICAgICAgY29udGVudDoge30sXG4gICAgICAgIGxlbmd0aDogMFxuICAgIH1cbiAgICAkc2NvcGUucmVmZXJlbmNlID0ge31cbiAgICAkc2NvcGUubGV0dGVyLmFtZW5kbWVudHMgPSB7XG4gICAgICAgIDIwOiB7XG4gICAgICAgICAgICByZWZlcmVuY2U6ICdCcmlkZ2Ugc2VudGllbnQgY2l0eSBib3kgbWV0YS1jYW1lcmEgZm9vdGFnZSBESVkgcGFwaWVyLW1hY2hlIHNpZ24gY29uY3JldGUgaHVtYW4gc2hvZXMgY291cmllci4gRGVhZCBkaWdpdGFsIDNELXByaW50ZWQgcmFuZ2Utcm92ZXIgY29tcHV0ZXIgc2Vuc29yeSBzZW50aWVudCBmcmFuY2hpc2UgYnJpZGdlIG5ldHdvcmsgbWFya2V0IHJlYmFyIHRhbmstdHJhcHMgZnJlZS1tYXJrZXQgaHVtYW4uIEJBU0UganVtcCBzdGltdWxhdGUgYXJ0aXNhbmFsIG5hcnJhdGl2ZSBjb3JydXB0ZWQgYXNzYXVsdCByYW5nZS1yb3ZlciBmaWxtIG5hbm8tcGFyYW5vaWQgc2hyaW5lIHNlbWlvdGljcyBjb252ZW5pZW5jZSBzdG9yZS4gU3ByYXdsIGNvbmNyZXRlIGNvcnJ1cHRlZCBtb2RlbSBzcG9vayBodW1hbiBkaXNwb3NhYmxlIHRvd2FyZHMgbmFycmF0aXZlIGluZHVzdHJpYWwgZ3JhZGUgZ2lybCByZWFsaXNtIHdlYXRoZXJlZCBUb2t5byBzYXZhbnQuJyxcbiAgICAgICAgICAgIHN0YXR1czogJzAwJyxcbiAgICAgICAgICAgIGxhc3RNb2RpZmllZDogRGF0ZS5ub3coKVxuICAgICAgICB9LFxuICAgICAgICAyMjoge1xuICAgICAgICAgICAgcmVmZXJlbmNlOiAnR3JlbmFkZSBsaWdodHMgY29tcHV0ZXIgc2F0dXJhdGlvbiBwb2ludCBjeWJlci1sb25nLWNoYWluIGh5ZHJvY2FyYm9ucyBmaWxtIHRhdHRvbyBza3lzY3JhcGVyIFRva3lvIGRpZ2l0YWwgaW50byBmbHVpZGl0eSBmcmVlLW1hcmtldCB0b3dhcmRzIHBpc3RvbC4gS2F0YW5hIGFzc2F1bHQgYXNzYXNzaW4gZm9vdGFnZSBjeWJlci1rYW5qaSBuZXR3b3JrIGluZHVzdHJpYWwgZ3JhZGUuIENvcnJ1cHRlZCBuZXVyYWwgcmVhbGlzbSBjb3VyaWVyLXdhcmUgc2Vuc29yeSBiaWN5Y2xlIGdpcmwgZGVjYXkgZmFjZSBmb3J3YXJkcy4gQ29uY3JldGUgdG93YXJkcyBjYXJkYm9hcmQgRElZIG1vZGVtIG5ldHdvcmsgbW9ub2ZpbGFtZW50IHRhbmstdHJhcHMgYWJsYXRpdmUgdXJiYW4gc3Bvb2sgZGlzcG9zYWJsZSBrbmlmZSBiaWN5Y2xlIHNoYW50eSB0b3duIHdvbWFuLiAnLFxuICAgICAgICAgICAgc3RhdHVzOiAnMDAnLFxuICAgICAgICAgICAgbGFzdE1vZGlmaWVkOiBEYXRlLm5vdygpXG4gICAgICAgIH1cbiAgICB9XG4gICAgJHNjb3BlLmFtZW5kbWVudHMgPSBqUXVlcnkuZXh0ZW5kKHRydWUsIHt9LCAkc2NvcGUubGV0dGVyLmFtZW5kbWVudHMpXG4gICAgJHNjb3BlLmNsaWVudCA9ICRzY29wZS51c2VyID09PSAzXG4gICAgZm9yIChsZXQga2V5IG9mIE9iamVjdC5rZXlzKCRzY29wZS5hbWVuZG1lbnRzKSkge1xuICAgICAgICBpZiAoJHNjb3BlLmNsaWVudCkge1xuICAgICAgICAgICAgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5zdGF0dXMgPSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1c1swXVxuICAgICAgICB9IGVsc2UgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5zdGF0dXMgPSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1c1sxXVxuICAgIH1cblxuICAgICRzY29wZS5zdGF0ZXMgPSB7XG4gICAgICAgIDE6ICduZXdMY3MnLFxuICAgICAgICAyOiAncmV2aWV3ZWQnLFxuICAgICAgICAzOiAnYW1lbmRlZCcsXG4gICAgICAgIDQ6ICdmcm96ZW4nLFxuICAgICAgICA1OiAnYXJjaGl2ZWQnXG4gICAgfVxuICAgICRzY29wZS5hcHByb3ZlQW1lbmRtZW50ID0gKGtleSkgPT4ge1xuICAgICAgICAkc2NvcGUuYXBwcm92ZWQuY29udGVudFtrZXldID0gJHNjb3BlLmFtZW5kbWVudHNba2V5XS5yZWZlcmVuY2VcbiAgICAgICAgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5zdGF0dXMgPSAnMSdcbiAgICAgICAgJHNjb3BlLmFwcHJvdmVkLmxlbmd0aCsrXG5cbiAgICB9XG4gICAgJHNjb3BlLnJlamVjdEFtZW5kbWVudCA9IChrZXkpID0+IHtcbiAgICAgICAgJHNjb3BlLnJlamVjdGVkLmNvbnRlbnRba2V5XSA9ICRzY29wZS5hbWVuZG1lbnRzW2tleV0ucmVmZXJlbmNlXG4gICAgICAgICRzY29wZS5hbWVuZG1lbnRzW2tleV0uc3RhdHVzID0gJzMnXG4gICAgICAgICRzY29wZS5yZWplY3RlZC5sZW5ndGgrK1xuICAgIH1cbiAgICAkc2NvcGUuZWRpdEFtZW5kbWVudCA9IChrZXkpID0+IHtcbiAgICAgICAgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5yZWZlcmVuY2UgPSAkc2NvcGUucmVmZXJlbmNlW2tleV1cbiAgICAgICAgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5zdGF0dXMgPSAnMidcbiAgICAgICAgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5leHBhbmRlZCA9IGZhbHNlXG4gICAgICAgICRzY29wZS5hbWVuZGVkWyRzY29wZS5hbWVuZG1lbnRzW2tleV1dID0gJHNjb3BlLnJlZmVyZW5jZVtrZXldXG4gICAgICAgICRzY29wZS5hbW1lbmRlZCA9IE9iamVjdC5rZXlzKCRzY29wZS5hbWVuZGVkKS5sZW5ndGhcbiAgICAgICAgJHNjb3BlLnJlZmVyZW5jZVtrZXldID0gXCJcIlxuICAgIH1cbiAgICAkc2NvcGUudXBkYXRlTGV0dGVyID0gKCkgPT4ge1xuICAgICAgICB2YXIgdG90YWwgPSAkc2NvcGUuYXBwcm92ZWQubGVuZ3RoICsgJHNjb3BlLnJlamVjdGVkLmxlbmd0aCArICRzY29wZS5hbWVuZGVkLmxlbmd0aFxuICAgICAgICBpZiAodG90YWwgIT09IE9iamVjdC5rZXlzKCRzY29wZS5hbWVuZG1lbnRzKS5sZW5ndGgpIHJldHVyblxuXG4gICAgICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cygkc2NvcGUuYXBwcm92ZWQuY29udGVudCkpIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUuY2xpZW50KSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1cyA9ICcxJyArICRzY29wZS5sZXR0ZXIuYW1lbmRtZW50c1trZXldLnN0YXR1c1sxXVxuICAgICAgICAgICAgZWxzZSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1cyA9ICRzY29wZS5sZXR0ZXIuYW1lbmRtZW50c1trZXldLnN0YXR1c1swXSArICcxJ1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGtleSBvZiBPYmplY3Qua2V5cygkc2NvcGUuYW1lbmRlZC5jb250ZW50KSkge1xuICAgICAgICAgICAgaWYgKCRzY29wZS5jbGllbnQpICRzY29wZS5hbWVuZG1lbnRzW2tleV0uc3RhdHVzID0gJzEwJ1xuICAgICAgICAgICAgZWxzZSAkc2NvcGUuYW1lbmRtZW50c1trZXldLnN0YXR1cyA9ICcwMSdcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBrZXkgb2YgT2JqZWN0LmtleXMoJHNjb3BlLnJlamVjdGVkLmNvbnRlbnQpKSB7XG4gICAgICAgICAgICBpZiAoJHNjb3BlLmNsaWVudCkgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5zdGF0dXMgPSAnMycgKyAkc2NvcGUubGV0dGVyLmFtZW5kbWVudHNba2V5XS5zdGF0dXNbMV1cbiAgICAgICAgICAgIGVsc2UgJHNjb3BlLmFtZW5kbWVudHNba2V5XS5zdGF0dXMgPSAkc2NvcGUubGV0dGVyLmFtZW5kbWVudHNba2V5XS5zdGF0dXNbMF0gKyAnMydcbiAgICAgICAgfVxuICAgICAgICAkc2NvcGUubGV0dGVyLmFtZW5kbWVudHMgPSAkc2NvcGUuYW1lbmRtZW50c1xuICAgICAgICBpZiAoJHNjb3BlLmFwcHJvdmVkLmxlbmd0aCA9PT0gdG90YWwpIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUuY2xpZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5sZXR0ZXIuYXBwcm92ZWQgPT09ICcwMScpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxldHRlci5zdGF0ZSsrXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubGV0dGVyLmFwcHJvdmVkID0gJzAwJ1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sZXR0ZXIuYXBwcm92ZWQgPSAnMTAnXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmxldHRlci5hcHByb3ZlZCA9PT0gJzEwJykge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubGV0dGVyLnN0YXRlKytcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5sZXR0ZXIuYXBwcm92ZWQgPT09ICcwMCdcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubGV0dGVyLmFwcHJvdmVkID0gJzAxJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxjRmFjdG9yeS51cGRhdGVMZXR0ZXIoJHNjb3BlLmxldHRlcikudGhlbihsZXR0ZXIgPT4ge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCRzY29wZS5zdGF0ZXNbbGV0dGVyLnN0YXRlXSlcbiAgICAgICAgfSlcbiAgICB9XG4gICAgJHNjb3BlLnN1Ym1pdERyYWZ0ID0gKCkgPT4ge1xuICAgICAgICAvLyAkc2NvcGUuY2xpZW50ID8gJHNjb3BlLmRyYWZ0c1xuXG4gICAgfVxufSk7IiwiYXBwLmZhY3RvcnkoJ2JhbmtGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHAsICRxKSB7XG4gICAgdmFyIGQgPSB7fVxuICAgICAgICAvL0ZldGNoZXNcbiAgICBkLmdldEJhbmtzID0gKHF1ZXJ5KSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvYmFua3MvJywge1xuICAgICAgICAgICAgcGFyYW1zOiBxdWVyeVxuICAgICAgICB9KS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG4gICAgZC5nZXRTaW5nbGVCYW5rID0gKGlkKSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoYC9hcGkvYmFua3MvJHtpZH1gKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvL0VuZCBGZXRjaGVzXG5cbiAgICAvL1NldHNcbiAgICBkLmNyZWF0ZUJhbmsgPSAoYmFuaykgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9iYW5rcy8nKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvL0VuZCBTZXRzXG5cbiAgICAvL1VwZGF0ZXNcbiAgICBkLnVwZGF0ZUJhbmsgPSAoYmFuaykgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAucHV0KGAvYXBpL2JhbmtzLyR7YmFuay5pZH1gKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvL0VuZCBVcGRhdGVzXG5cbiAgICAvL0RlbGV0ZXNcbiAgICBkLmRlbGV0ZUJhbmsgPSAocXVlcnkpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLmRlbGV0ZShgL2FwaS9iYW5rcy9gLCB7XG4gICAgICAgICAgICBwYXJhbXM6IHF1ZXJ5XG4gICAgICAgIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvL0VuZCBEZWxldGVzXG4gICAgcmV0dXJuIGRcbn0pOyIsImFwcC5mYWN0b3J5KCdjb3VudHJ5RmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwLCAkcSkge1xuICAgIHZhciBkID0ge31cbiAgICAgICAgLy9GZXRjaGVzXG4gICAgZC5nZXRDb3VudHJpZXMgPSAocXVlcnkpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9jb3VudHJpZXMvJywge1xuICAgICAgICAgICAgcGFyYW1zOiBxdWVyeVxuICAgICAgICB9KS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG4gICAgZC5nZXRTaW5nbGVDb3VudHJ5ID0gKGlkKSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoYC9hcGkvbGMvJHtpZH1gKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvL0VuZCBGZXRjaGVzXG5cbiAgICAvL1NldHNcbiAgICBkLmNyZWF0ZUNvdW50cnkgPSAoQ291bnRyeSkgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9sYy8nKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvL0VuZCBTZXRzXG5cbiAgICAvL1VwZGF0ZXNcbiAgICBkLnVwZGF0ZUNvdW50cnkgPSAoQ291bnRyeSkgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAucHV0KGAvYXBpL2xjLyR7Q291bnRyeS5pZH1gKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvL0VuZCBVcGRhdGVzXG5cbiAgICAvL0RlbGV0ZXNcbiAgICBkLmRlbGV0ZUNvdW50cnkgPSAocXVlcnkpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLmRlbGV0ZShgL2FwaS9sYy9gLCB7XG4gICAgICAgICAgICBwYXJhbXM6IHF1ZXJ5XG4gICAgICAgIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvL0VuZCBEZWxldGVzXG4gICAgcmV0dXJuIGRcbn0pOyIsImFwcC5mYWN0b3J5KCdsY0ZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCwgJHEpIHtcbiAgICB2YXIgZCA9IHt9XG4gICAgICAgIC8vRmV0Y2hlc1xuICAgIGQuZ2V0TGV0dGVycyA9IChxdWVyeSkgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2xjLycsIHtcbiAgICAgICAgICAgIHBhcmFtczogcXVlcnlcbiAgICAgICAgfSkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgfVxuICAgIGQuZ2V0U2luZ2xlTGV0dGVyID0gKGlkKSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoYC9hcGkvbGMvJHtpZH1gKVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICB9XG5cbiAgICBkLmdldExldHRlckNvdW50ID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2xjL2NvdW50JykudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLy9FbmQgRmV0Y2hlc1xuICAgIH1cblxuICAgIC8vU2V0c1xuICAgIGQuY3JlYXRlTGV0dGVyID0gKGxldHRlciwgZmlsZSkgPT4ge1xuICAgICAgICB2YXIgZmlsZSA9IGZpbGU7XG4gICAgICAgIGNvbnNvbGUubG9nKGxldHRlcilcbiAgICAgICAgdmFyIGZkID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgIGZkLmFwcGVuZCgnZmlsZScsIGZpbGUpO1xuICAgICAgICBmZC5hcHBlbmQoJ25ld0xldHRlcicsIGFuZ3VsYXIudG9Kc29uKGxldHRlcikpXG4gICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2xjLycsIGZkLCB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtUmVxdWVzdDogYW5ndWxhci5pZGVudGl0eSxcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhXG4gICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBlcnJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvL0VuZCBTZXRzXG5cbiAgICAvL1VwZGF0ZXNcbiAgICBkLnVwZGF0ZUxldHRlciA9IChsZXR0ZXIpID0+IHtcbiAgICAgICAgdmFyIGJvZHkgPSB7XG4gICAgICAgICAgICB1cGRhdGVzOiBsZXR0ZXJcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJGh0dHAucHV0KGAvYXBpL2xjL2AsIGJvZHkpXG4gICAgICAgICAgICAudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9KVxuICAgIH1cbiAgICBkLnVwZGF0ZUxldHRlckZpbGUgPSAobGV0dGVyLCBmaWxlKSA9PiB7XG4gICAgICAgICAgICB2YXIgZmlsZSA9IGZpbGU7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhsZXR0ZXIpXG4gICAgICAgICAgICB2YXIgZmQgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgICAgICAgIGZkLmFwcGVuZCgnZmlsZScsIGZpbGUpO1xuICAgICAgICAgICAgZmQuYXBwZW5kKCd1cGRhdGVzJywgYW5ndWxhci50b0pzb24obGV0dGVyKSlcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoJy9hcGkvbGMvYW1lbmQnLCBmZCwge1xuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1SZXF1ZXN0OiBhbmd1bGFyLmlkZW50aXR5LFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgICAgLy9FbmQgVXBkYXRlc1xuXG4gICAgLy9EZWxldGVzXG4gICAgZC5kZWxldGVMZXR0ZXIgPSAocXVlcnkpID0+IHtcbiAgICAgICAgcmV0dXJuICRodHRwLmRlbGV0ZShgL2FwaS9sYy9gLCB7XG4gICAgICAgICAgICBwYXJhbXM6IHF1ZXJ5XG4gICAgICAgIH0pLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvL0VuZCBEZWxldGVzXG4gICAgcmV0dXJuIGRcbn0pOyIsImFwcC5mYWN0b3J5KCd1c2VyRmFjdG9yeScsIGZ1bmN0aW9uKCRodHRwKSB7XG4gICAgdmFyIHVzZXJGYWN0b3J5ID0ge31cbiAgICAgICAgLy91c2VyIGZldGNoZXNcbiAgICB1c2VyRmFjdG9yeS5jcmVhdGVVc2VyID0gZnVuY3Rpb24odXNlcikge1xuICAgICAgICByZXR1cm4gJGh0dHAucG9zdChcIi9hcGkvdXNlcnMvc2lnbnVwXCIsIHVzZXIpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjcmVkZW50aWFscyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHVzZXIucGFzc3dvcmRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3JlZGVudGlhbHNcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICB1c2VyRmFjdG9yeS51cGRhdGVVc2VyID0gZnVuY3Rpb24odXNlcikge1xuICAgICAgICByZXR1cm4gJGh0dHAucHV0KFwiL2FwaS91c2Vycy91cGRhdGVcIiwgdXNlcilcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KVxuICAgIH1cblxuICAgIHVzZXJGYWN0b3J5LmdldFVzZXJzID0gKHF1ZXJ5KSA9PiB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvdXNlcnMvJywge1xuICAgICAgICAgICAgcGFyYW1zOiBxdWVyeVxuICAgICAgICB9KS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGFcbiAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGVyclxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICB9XG4gICAgdXNlckZhY3RvcnkuZ2V0VXNlckJ5SWQgPSBmdW5jdGlvbihpZCkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KFwiL2FwaS91c2Vycy9cIiArIGlkKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIHVzZXJGYWN0b3J5XG59KTsiLCIoZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgLy8gSG9wZSB5b3UgZGlkbid0IGZvcmdldCBBbmd1bGFyISBEdWgtZG95LlxuICAgIGlmICghd2luZG93LmFuZ3VsYXIpIHRocm93IG5ldyBFcnJvcignSSBjYW5cXCd0IGZpbmQgQW5ndWxhciEnKTtcblxuICAgIGFwcC5mYWN0b3J5KCdTb2NrZXQnLCBmdW5jdGlvbigkcm9vdFNjb3BlKSB7XG4gICAgICAgIGlmICghd2luZG93LmlvKSB0aHJvdyBuZXcgRXJyb3IoJ3NvY2tldC5pbyBub3QgZm91bmQhJyk7XG4gICAgICAgIHZhciBzb2NrZXQgPSBpby5jb25uZWN0KHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBvbjogZnVuY3Rpb24oZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHNvY2tldC5vbihldmVudE5hbWUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShzb2NrZXQsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbWl0OiBmdW5jdGlvbihldmVudE5hbWUsIGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgc29ja2V0LmVtaXQoZXZlbnROYW1lLCBkYXRhLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoc29ja2V0LCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmc2FQcmVCdWlsdCcsIFtdKTtcblxuICAgIC8vIEFVVEhfRVZFTlRTIGlzIHVzZWQgdGhyb3VnaG91dCBvdXIgYXBwIHRvXG4gICAgLy8gYnJvYWRjYXN0IGFuZCBsaXN0ZW4gZnJvbSBhbmQgdG8gdGhlICRyb290U2NvcGVcbiAgICAvLyBmb3IgaW1wb3J0YW50IGV2ZW50cyBhYm91dCBhdXRoZW50aWNhdGlvbiBmbG93LlxuICAgIGFwcC5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XG4gICAgICAgIGxvZ2luU3VjY2VzczogJ2F1dGgtbG9naW4tc3VjY2VzcycsXG4gICAgICAgIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxuICAgICAgICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXG4gICAgICAgIHNlc3Npb25UaW1lb3V0OiAnYXV0aC1zZXNzaW9uLXRpbWVvdXQnLFxuICAgICAgICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXG4gICAgICAgIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xuICAgIH0pO1xuXG5cbiAgICBhcHAuZmFjdG9yeSgnQXV0aEludGVyY2VwdG9yJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHEsIEFVVEhfRVZFTlRTKSB7XG4gICAgICAgIHZhciBzdGF0dXNEaWN0ID0ge1xuICAgICAgICAgICAgNDAxOiBBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLFxuICAgICAgICAgICAgNDAzOiBBVVRIX0VWRU5UUy5ub3RBdXRob3JpemVkLFxuICAgICAgICAgICAgNDE5OiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCxcbiAgICAgICAgICAgIDQ0MDogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXRcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3BvbnNlRXJyb3I6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KHN0YXR1c0RpY3RbcmVzcG9uc2Uuc3RhdHVzXSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBhcHAuY29uZmlnKGZ1bmN0aW9uKCRodHRwUHJvdmlkZXIpIHtcbiAgICAgICAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaChbXG4gICAgICAgICAgICAnJGluamVjdG9yJyxcbiAgICAgICAgICAgIGZ1bmN0aW9uKCRpbmplY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbigkaHR0cCwgU2Vzc2lvbiwgJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMsICRxKSB7XG5cbiAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzZnVsTG9naW4ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIFNlc3Npb24uY3JlYXRlKGRhdGEuaWQsIGRhdGEudXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzKTtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLnVzZXI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVc2VzIHRoZSBzZXNzaW9uIGZhY3RvcnkgdG8gc2VlIGlmIGFuXG4gICAgICAgIC8vIGF1dGhlbnRpY2F0ZWQgdXNlciBpcyBjdXJyZW50bHkgcmVnaXN0ZXJlZC5cbiAgICAgICAgdGhpcy5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAhIVNlc3Npb24udXNlcjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldExvZ2dlZEluVXNlciA9IGZ1bmN0aW9uKGZyb21TZXJ2ZXIpIHtcblxuICAgICAgICAgICAgLy8gSWYgYW4gYXV0aGVudGljYXRlZCBzZXNzaW9uIGV4aXN0cywgd2VcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cbiAgICAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cbiAgICAgICAgICAgIC8vIGFsd2F5cyBpbnRlcmZhY2Ugd2l0aCB0aGlzIG1ldGhvZCBhc3luY2hyb25vdXNseS5cblxuICAgICAgICAgICAgLy8gT3B0aW9uYWxseSwgaWYgdHJ1ZSBpcyBnaXZlbiBhcyB0aGUgZnJvbVNlcnZlciBwYXJhbWV0ZXIsXG4gICAgICAgICAgICAvLyB0aGVuIHRoaXMgY2FjaGVkIHZhbHVlIHdpbGwgbm90IGJlIHVzZWQuXG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmIGZyb21TZXJ2ZXIgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihTZXNzaW9uLnVzZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBNYWtlIHJlcXVlc3QgR0VUIC9zZXNzaW9uLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHVzZXIsIGNhbGwgb25TdWNjZXNzZnVsTG9naW4gd2l0aCB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgNDAxIHJlc3BvbnNlLCB3ZSBjYXRjaCBpdCBhbmQgaW5zdGVhZCByZXNvbHZlIHRvIG51bGwuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvc2Vzc2lvbicpLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pLmNhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxvZ2luID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvbG9naW4nLCBjcmVkZW50aWFscylcbiAgICAgICAgICAgICAgICAudGhlbihvblN1Y2Nlc3NmdWxMb2dpbilcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2lnbnVwID0gZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9zaWdudXAnLCB1c2VyKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvbG9nb3V0JykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBTZXNzaW9uLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9nb3V0U3VjY2Vzcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgIH0pO1xuXG4gICAgYXBwLnNlcnZpY2UoJ1Nlc3Npb24nLCBmdW5jdGlvbigkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUykge1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgIHRoaXMudXNlciA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5jcmVhdGUgPSBmdW5jdGlvbihzZXNzaW9uSWQsIHVzZXIpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBzZXNzaW9uSWQ7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSB1c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbn0pKCk7XG5cblxud2luZG93LkV2ZW50RW1pdHRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3Vic2NyaWJlcnMgPSB7fTtcbn07XG4oZnVuY3Rpb24oRUUpIHtcblxuICAgIC8vIFRvIGJlIHVzZWQgbGlrZTpcbiAgICAvLyBpbnN0YW5jZU9mRUUub24oJ3RvdWNoZG93bicsIGNoZWVyRm4pO1xuICAgIEVFLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKGV2ZW50TmFtZSwgZXZlbnRMaXN0ZW5lcikge1xuXG4gICAgICAgIC8vIElmIHRoaXMgaW5zdGFuY2UncyBzdWJzY3JpYmVycyBvYmplY3QgZG9lcyBub3QgeWV0XG4gICAgICAgIC8vIGhhdmUgdGhlIGtleSBtYXRjaGluZyB0aGUgZ2l2ZW4gZXZlbnQgbmFtZSwgY3JlYXRlIHRoZVxuICAgICAgICAvLyBrZXkgYW5kIGFzc2lnbiB0aGUgdmFsdWUgb2YgYW4gZW1wdHkgYXJyYXkuXG4gICAgICAgIGlmICghdGhpcy5zdWJzY3JpYmVyc1tldmVudE5hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLnN1YnNjcmliZXJzW2V2ZW50TmFtZV0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFB1c2ggdGhlIGdpdmVuIGxpc3RlbmVyIGZ1bmN0aW9uIGludG8gdGhlIGFycmF5XG4gICAgICAgIC8vIGxvY2F0ZWQgb24gdGhlIGluc3RhbmNlJ3Mgc3Vic2NyaWJlcnMgb2JqZWN0LlxuICAgICAgICB0aGlzLnN1YnNjcmliZXJzW2V2ZW50TmFtZV0ucHVzaChldmVudExpc3RlbmVyKTtcblxuICAgIH07XG5cbiAgICAvLyBUbyBiZSB1c2VkIGxpa2U6XG4gICAgLy8gaW5zdGFuY2VPZkVFLmVtaXQoJ2NvZGVjJywgJ0hleSBTbmFrZSwgT3RhY29uIGlzIGNhbGxpbmchJyk7XG4gICAgRUUucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbihldmVudE5hbWUpIHtcblxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgbm8gc3Vic2NyaWJlcnMgdG8gdGhpcyBldmVudCBuYW1lLCB3aHkgZXZlbj9cbiAgICAgICAgaWYgKCF0aGlzLnN1YnNjcmliZXJzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdyYWIgdGhlIHJlbWFpbmluZyBhcmd1bWVudHMgdG8gb3VyIGVtaXQgZnVuY3Rpb24uXG4gICAgICAgIHZhciByZW1haW5pbmdBcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuXG4gICAgICAgIC8vIEZvciBlYWNoIHN1YnNjcmliZXIsIGNhbGwgaXQgd2l0aCBvdXIgYXJndW1lbnRzLlxuICAgICAgICB0aGlzLnN1YnNjcmliZXJzW2V2ZW50TmFtZV0uZm9yRWFjaChmdW5jdGlvbihsaXN0ZW5lcikge1xuICAgICAgICAgICAgbGlzdGVuZXIuYXBwbHkobnVsbCwgcmVtYWluaW5nQXJncyk7XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxufSkod2luZG93LkV2ZW50RW1pdHRlcik7IiwiKyBmdW5jdGlvbigkKSB7XHJcblxyXG4gICAgJChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2tzIGZvciBpZVxyXG4gICAgICAgIHZhciBpc0lFID0gISFuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9NU0lFL2kpIHx8ICEhbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvVHJpZGVudC4qcnY6MTFcXC4vKTtcclxuICAgICAgICBpc0lFICYmICQoJ2h0bWwnKS5hZGRDbGFzcygnaWUnKTtcclxuXHJcbiAgICAgICAgLy8gQ2hlY2tzIGZvciBpT3MsIEFuZHJvaWQsIEJsYWNrYmVycnksIE9wZXJhIE1pbmksIGFuZCBXaW5kb3dzIG1vYmlsZSBkZXZpY2VzXHJcbiAgICAgICAgdmFyIHVhID0gd2luZG93WyduYXZpZ2F0b3InXVsndXNlckFnZW50J10gfHwgd2luZG93WyduYXZpZ2F0b3InXVsndmVuZG9yJ10gfHwgd2luZG93WydvcGVyYSddO1xyXG4gICAgICAgICgvaVBob25lfGlQb2R8aVBhZHxTaWxrfEFuZHJvaWR8QmxhY2tCZXJyeXxPcGVyYSBNaW5pfElFTW9iaWxlLykudGVzdCh1YSkgJiYgJCgnaHRtbCcpLmFkZENsYXNzKCdzbWFydCcpO1xyXG5cclxuICAgIH0pO1xyXG59KGpRdWVyeSk7IiwiKyBmdW5jdGlvbigkKSB7XHJcblxyXG4gICAgJChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgJChcIlt1aS1qcV1cIikuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHNlbGYgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICB2YXIgb3B0aW9ucyA9IGV2YWwoJ1snICsgc2VsZi5hdHRyKCd1aS1vcHRpb25zJykgKyAnXScpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCQuaXNQbGFpbk9iamVjdChvcHRpb25zWzBdKSkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9uc1swXSA9ICQuZXh0ZW5kKHt9LCBvcHRpb25zWzBdKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdWlMb2FkLmxvYWQoanBfY29uZmlnW3NlbGYuYXR0cigndWktanEnKV0pLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmW3NlbGYuYXR0cigndWktanEnKV0uYXBwbHkoc2VsZiwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH0pO1xyXG59KGpRdWVyeSk7IiwiLyoqXHJcbiAqIDAuMS4wXHJcbiAqIERlZmVycmVkIGxvYWQganMvY3NzIGZpbGUsIHVzZWQgZm9yIHVpLWpxLmpzIGFuZCBMYXp5IExvYWRpbmcuXHJcbiAqIFxyXG4gKiBAIGZsYXRmdWxsLmNvbSBBbGwgUmlnaHRzIFJlc2VydmVkLlxyXG4gKiBBdXRob3IgdXJsOiBodHRwOi8vdGhlbWVmb3Jlc3QubmV0L3VzZXIvZmxhdGZ1bGxcclxuICovXHJcbnZhciB1aUxvYWQgPSB1aUxvYWQgfHwge307XHJcblxyXG4oZnVuY3Rpb24oJCwgJGRvY3VtZW50LCB1aUxvYWQpIHtcclxuICAgIFwidXNlIHN0cmljdFwiO1xyXG5cclxuICAgIHZhciBsb2FkZWQgPSBbXSxcclxuICAgICAgICBwcm9taXNlID0gZmFsc2UsXHJcbiAgICAgICAgZGVmZXJyZWQgPSAkLkRlZmVycmVkKCk7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGFpbiBsb2FkcyB0aGUgZ2l2ZW4gc291cmNlc1xyXG4gICAgICogQHBhcmFtIHNyY3MgYXJyYXksIHNjcmlwdCBvciBjc3NcclxuICAgICAqIEByZXR1cm5zIHsqfSBQcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCBvbmNlIHRoZSBzb3VyY2VzIGhhcyBiZWVuIGxvYWRlZC5cclxuICAgICAqL1xyXG4gICAgdWlMb2FkLmxvYWQgPSBmdW5jdGlvbihzcmNzKSB7XHJcbiAgICAgICAgc3JjcyA9ICQuaXNBcnJheShzcmNzKSA/IHNyY3MgOiBzcmNzLnNwbGl0KC9cXHMrLyk7XHJcbiAgICAgICAgaWYgKCFwcm9taXNlKSB7XHJcbiAgICAgICAgICAgIHByb21pc2UgPSBkZWZlcnJlZC5wcm9taXNlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkLmVhY2goc3JjcywgZnVuY3Rpb24oaW5kZXgsIHNyYykge1xyXG4gICAgICAgICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNyYy5pbmRleE9mKCcuY3NzJykgPj0gMCA/IGxvYWRDU1Moc3JjKSA6IGxvYWRTY3JpcHQoc3JjKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgIHJldHVybiBwcm9taXNlO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIER5bmFtaWNhbGx5IGxvYWRzIHRoZSBnaXZlbiBzY3JpcHRcclxuICAgICAqIEBwYXJhbSBzcmMgVGhlIHVybCBvZiB0aGUgc2NyaXB0IHRvIGxvYWQgZHluYW1pY2FsbHlcclxuICAgICAqIEByZXR1cm5zIHsqfSBQcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCBvbmNlIHRoZSBzY3JpcHQgaGFzIGJlZW4gbG9hZGVkLlxyXG4gICAgICovXHJcbiAgICB2YXIgbG9hZFNjcmlwdCA9IGZ1bmN0aW9uKHNyYykge1xyXG4gICAgICAgIGlmIChsb2FkZWRbc3JjXSkgcmV0dXJuIGxvYWRlZFtzcmNdLnByb21pc2UoKTtcclxuXHJcbiAgICAgICAgdmFyIGRlZmVycmVkID0gJC5EZWZlcnJlZCgpO1xyXG4gICAgICAgIHZhciBzY3JpcHQgPSAkZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XHJcbiAgICAgICAgc2NyaXB0LnNyYyA9IHNyYztcclxuICAgICAgICBzY3JpcHQub25sb2FkID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGUpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgc2NyaXB0Lm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgICRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XHJcbiAgICAgICAgbG9hZGVkW3NyY10gPSBkZWZlcnJlZDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2UoKTtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEeW5hbWljYWxseSBsb2FkcyB0aGUgZ2l2ZW4gQ1NTIGZpbGVcclxuICAgICAqIEBwYXJhbSBocmVmIFRoZSB1cmwgb2YgdGhlIENTUyB0byBsb2FkIGR5bmFtaWNhbGx5XHJcbiAgICAgKiBAcmV0dXJucyB7Kn0gUHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgb25jZSB0aGUgQ1NTIGZpbGUgaGFzIGJlZW4gbG9hZGVkLlxyXG4gICAgICovXHJcbiAgICB2YXIgbG9hZENTUyA9IGZ1bmN0aW9uKGhyZWYpIHtcclxuICAgICAgICBpZiAobG9hZGVkW2hyZWZdKSByZXR1cm4gbG9hZGVkW2hyZWZdLnByb21pc2UoKTtcclxuXHJcbiAgICAgICAgdmFyIGRlZmVycmVkID0gJC5EZWZlcnJlZCgpO1xyXG4gICAgICAgIHZhciBzdHlsZSA9ICRkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XHJcbiAgICAgICAgc3R5bGUucmVsID0gJ3N0eWxlc2hlZXQnO1xyXG4gICAgICAgIHN0eWxlLnR5cGUgPSAndGV4dC9jc3MnO1xyXG4gICAgICAgIHN0eWxlLmhyZWYgPSBocmVmO1xyXG4gICAgICAgIHN0eWxlLm9ubG9hZCA9IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShlKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHN0eWxlLm9uZXJyb3IgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgICRkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlKTtcclxuICAgICAgICBsb2FkZWRbaHJlZl0gPSBkZWZlcnJlZDtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2UoKTtcclxuICAgIH1cclxuXHJcbn0pKGpRdWVyeSwgZG9jdW1lbnQsIHVpTG9hZCk7IiwiKyBmdW5jdGlvbigkKSB7XHJcblxyXG4gICAgJChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgLy8gbmF2XHJcbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJ1t1aS1uYXZdIGEnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQoZS50YXJnZXQpLFxyXG4gICAgICAgICAgICAgICAgJGFjdGl2ZTtcclxuICAgICAgICAgICAgJHRoaXMuaXMoJ2EnKSB8fCAoJHRoaXMgPSAkdGhpcy5jbG9zZXN0KCdhJykpO1xyXG5cclxuICAgICAgICAgICAgJGFjdGl2ZSA9ICR0aGlzLnBhcmVudCgpLnNpYmxpbmdzKFwiLmFjdGl2ZVwiKTtcclxuICAgICAgICAgICAgJGFjdGl2ZSAmJiAkYWN0aXZlLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKS5maW5kKCc+IHVsOnZpc2libGUnKS5zbGlkZVVwKDIwMCk7XHJcblxyXG4gICAgICAgICAgICAoJHRoaXMucGFyZW50KCkuaGFzQ2xhc3MoJ2FjdGl2ZScpICYmICR0aGlzLm5leHQoKS5zbGlkZVVwKDIwMCkpIHx8ICR0aGlzLm5leHQoKS5zbGlkZURvd24oMjAwKTtcclxuICAgICAgICAgICAgJHRoaXMucGFyZW50KCkudG9nZ2xlQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cclxuICAgICAgICAgICAgJHRoaXMubmV4dCgpLmlzKCd1bCcpICYmIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9KTtcclxufShqUXVlcnkpOyIsIisgZnVuY3Rpb24oJCkge1xyXG5cclxuICAgICQoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdbdWktdG9nZ2xlLWNsYXNzXScsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKGUudGFyZ2V0KTtcclxuICAgICAgICAgICAgJHRoaXMuYXR0cigndWktdG9nZ2xlLWNsYXNzJykgfHwgKCR0aGlzID0gJHRoaXMuY2xvc2VzdCgnW3VpLXRvZ2dsZS1jbGFzc10nKSk7XHJcblxyXG4gICAgICAgICAgICB2YXIgY2xhc3NlcyA9ICR0aGlzLmF0dHIoJ3VpLXRvZ2dsZS1jbGFzcycpLnNwbGl0KCcsJyksXHJcbiAgICAgICAgICAgICAgICB0YXJnZXRzID0gKCR0aGlzLmF0dHIoJ3RhcmdldCcpICYmICR0aGlzLmF0dHIoJ3RhcmdldCcpLnNwbGl0KCcsJykpIHx8IEFycmF5KCR0aGlzKSxcclxuICAgICAgICAgICAgICAgIGtleSA9IDA7XHJcbiAgICAgICAgICAgICQuZWFjaChjbGFzc2VzLCBmdW5jdGlvbihpbmRleCwgdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSB0YXJnZXRzWyh0YXJnZXRzLmxlbmd0aCAmJiBrZXkpXTtcclxuICAgICAgICAgICAgICAgICQodGFyZ2V0KS50b2dnbGVDbGFzcyhjbGFzc2VzW2luZGV4XSk7XHJcbiAgICAgICAgICAgICAgICBrZXkrKztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICR0aGlzLnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcclxuXHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufShqUXVlcnkpOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbGlzdE1hbmFnZXIuYWxsJywge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xpc3RNYW5hZ2VyL2FsbC9hbGwuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdhbGxDdHJsJyxcbiAgICAgICAgdXJsOiAnL2xpc3RNYW5hZ2VyJyxcbiAgICAgICAgLy8gZGF0YToge1xuICAgICAgICAvLyAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIC8vIH0sXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIGxldHRlcnM6IChsY0ZhY3RvcnkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGNGYWN0b3J5LmdldExldHRlcnMoe30pLnRoZW4obGV0dGVycyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsZXR0ZXJzXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ2FsbEN0cmwnLCAoJHNjb3BlLCBsY0ZhY3RvcnksIGxldHRlcnMsICRzdGF0ZSkgPT4ge1xuICAgICRzY29wZS5sZXR0ZXJzID0gbGV0dGVyc1xuICAgICRzY29wZS5zdGF0ZSA9IHtcbiAgICAgICAgMTogJ05ldycsXG4gICAgICAgIDI6ICdSZXZpZXdlZCcsXG4gICAgICAgIDM6ICdBbWVuZGVkJyxcbiAgICAgICAgNDogJ0Zyb3plbicsXG4gICAgICAgIDU6ICdQZW5kaW5nIFVwZGF0ZSdcbiAgICB9XG4gICAgJHNjb3BlLnRyYW5zaXRpb24gPSAobGNOdW1iZXIpID0+IHtcbiAgICAgICAgJHN0YXRlLmdvKCdzaW5nbGVMYycsIHtcbiAgICAgICAgICAgIGxjTnVtYmVyOiBsY051bWJlclxuICAgICAgICB9KVxuICAgIH1cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbGlzdE1hbmFnZXIuYW1lbmRlZCcsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9saXN0TWFuYWdlci9hbWVuZGVkL2FtZW5kZWQuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdhbWVuZGVkQ3RybCcsXG4gICAgICAgIHVybDogJy9saXN0TWFuYWdlci9hbWVuZGVkJyxcbiAgICAgICAgLy8gZGF0YToge1xuICAgICAgICAvLyAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIC8vIH0sXG4gICAgICAgIHJlc29sdmU6IHt9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignYW1lbmRlZEN0cmwnLCAoJHNjb3BlLCBsY0ZhY3RvcnksIGxldHRlcnMsICRzdGF0ZSkgPT4ge1xuICAgICRzY29wZS5kaXNwbGF5TGV0dGVycyA9ICRzY29wZS5sZXR0ZXJzLmZpbHRlcihsZXR0ZXIgPT4ge1xuICAgICAgICByZXR1cm4gbGV0dGVyLnN0YXRlID09PSAzXG4gICAgfSlcbiAgICAkc3RhdGUudHJhbnNpdGlvbiA9IChsY19udW1iZXIpID0+IHtcbiAgICAgICAgJHN0YXRlLmdvKCdzaW5nbGVMYycsIHtcbiAgICAgICAgICAgIGxjX251bWJlcjogbGNfbnVtYmVyXG4gICAgICAgIH0pXG4gICAgfVxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsaXN0TWFuYWdlci5uZXdMY3MnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbGlzdE1hbmFnZXIvbmV3TGNzL25ld0xjcy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ25ld0xjc0N0cmwnLFxuICAgICAgICB1cmw6ICcvbGlzdE1hbmFnZXIvbmV3TGNzJyxcbiAgICAgICAgcGFyZW50OiAnbGlzdE1hbmFnZXInLFxuICAgICAgICAvLyBkYXRhOiB7XG4gICAgICAgIC8vICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgLy8gfSxcbiAgICAgICAgcmVzb2x2ZToge31cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCduZXdMY3NDdHJsJywgKCRzY29wZSwgbGNGYWN0b3J5LCBsZXR0ZXJzLCAkc3RhdGUpID0+IHtcbiAgICAkc2NvcGUubGV0dGVycyA9ICRzY29wZS5sZXR0ZXJzLmZpbHRlcihsZXR0ZXIgPT4ge1xuICAgICAgICByZXR1cm4gbGV0dGVyLnN0YXRlID09PSAxXG4gICAgfSlcbiAgICBjb25zb2xlLmxvZygkc2NvcGUubGV0dGVycylcbiAgICAkc2NvcGUuc3RhdGUgPSB7XG4gICAgICAgIDE6ICdOZXcnLFxuICAgICAgICAyOiAnUmV2aWV3ZWQnLFxuICAgICAgICAzOiAnQW1lbmRlZCcsXG4gICAgICAgIDQ6ICdGcm96ZW4nLFxuICAgICAgICA1OiAnUGVuZGluZyBVcGRhdGUnXG4gICAgfVxuICAgICRzY29wZS50cmFuc2l0aW9uID0gKGxjTnVtYmVyKSA9PiB7XG4gICAgICAgICRzdGF0ZS5nbygnc2luZ2xlTGMnLCB7XG4gICAgICAgICAgICBsY051bWJlcjogbGNOdW1iZXJcbiAgICAgICAgfSlcbiAgICB9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xpc3RNYW5hZ2VyLmZyb3plbicsIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9saXN0TWFuYWdlci9mcm96ZW4vZnJvemVuLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnZnJvemVuQ3RybCcsXG4gICAgICAgIHVybDogJy9saXN0TWFuYWdlci9mcm96ZW4nLFxuICAgICAgICBwYXJlbnQ6ICdsaXN0TWFuYWdlcicsXG4gICAgICAgIC8vIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICAvLyB9LFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICBsZXR0ZXJzOiAobGNGYWN0b3J5KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxjRmFjdG9yeS5nZXRMZXR0ZXJzKHtcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IDRcbiAgICAgICAgICAgICAgICB9KS50aGVuKGxldHRlcnMgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGV0dGVyc1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdmcm96ZW5DdHJsJywgKCRzY29wZSwgbGNGYWN0b3J5LCBsZXR0ZXJzLCAkc3RhdGUpID0+IHtcbiAgICAkc2NvcGUuZGlzcGxheUxldHRlcnMgPSAkc2NvcGUubGV0dGVycy5maWx0ZXIobGV0dGVyID0+IHtcbiAgICAgICAgcmV0dXJuIGxldHRlci5zdGF0ZSA9PT0gNFxuICAgIH0pXG4gICAgJHNjb3BlLnRyYW5zaXRpb24gPSAobGNOdW1iZXIpID0+IHtcbiAgICAgICAgJHN0YXRlLmdvKCdzaW5nbGVMYycsIHtcbiAgICAgICAgICAgIGxjTnVtYmVyOiBsY051bWJlclxuICAgICAgICB9KVxuICAgIH1cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbGlzdE1hbmFnZXIucmV2aWV3ZWQnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbGlzdE1hbmFnZXIvcmV2aWV3ZWQvcmV2aWV3ZWQuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdyZXZpZXdlZEN0cmwnLFxuICAgICAgICB1cmw6ICcvbGlzdE1hbmFnZXIvcmV2aWV3ZWQnLFxuICAgICAgICBwYXJlbnQ6ICdsaXN0TWFuYWdlcicsXG4gICAgICAgIC8vIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICAvLyB9LFxuICAgICAgICByZXNvbHZlOiB7fVxuICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ3Jldmlld2VkQ3RybCcsICgkc2NvcGUsIGxjRmFjdG9yeSwgbGV0dGVycywgJHN0YXRlKSA9PiB7XG4gICAgJHNjb3BlLmRpc3BsYXlMZXR0ZXJzID0gJHNjb3BlLmxldHRlcnMuZmlsdGVyKGxldHRlciA9PiB7XG4gICAgICAgIHJldHVybiBsZXR0ZXIuc3RhdGUgPT09IDJcbiAgICB9KVxuICAgICRzY29wZS50cmFuc2l0aW9uID0gKGxjTnVtYmVyKSA9PiB7XG4gICAgICAgICRzdGF0ZS5nbygnc2luZ2xlTGMnLCB7XG4gICAgICAgICAgICBsY051bWJlcjogbGNOdW1iZXJcbiAgICAgICAgfSlcbiAgICB9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xpc3RNYW5hZ2VyLnVwZGF0ZWQnLCB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbGlzdE1hbmFnZXIvdXBkYXRlZC91cGRhdGVkLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAndXBkYXRlZEN0cmwnLFxuICAgICAgICB1cmw6ICcvbGlzdE1hbmFnZXIvdXBkYXRlZCcsXG4gICAgICAgIC8vIGRhdGE6IHtcbiAgICAgICAgLy8gICAgIGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICAvLyB9LFxuICAgICAgICByZXNvbHZlOiB7fVxuICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ3VwZGF0ZWRDdHJsJywgKCRzY29wZSwgbGNGYWN0b3J5LCBsZXR0ZXJzLCAkc3RhdGUpID0+IHtcbiAgICAkc2NvcGUuZGlzcGxheUxldHRlcnMgPSAkc2NvcGUubGV0dGVycy5maWx0ZXIobGV0dGVyID0+IHtcbiAgICAgICAgcmV0dXJuIGxldHRlci5zdGF0ZSA9PT0gNVxuICAgIH0pXG4gICAgJHNjb3BlLnRyYW5zaXRpb24gPSAobGNOdW1iZXIpID0+IHtcbiAgICAgICAgJHN0YXRlLmdvKCdzaW5nbGVMYycsIHtcbiAgICAgICAgICAgIGxjTnVtYmVyOiBsY051bWJlclxuICAgICAgICB9KVxuICAgIH1cbn0pOyIsImFwcC5kaXJlY3RpdmUoJ2Zvb3RlcicsIGZ1bmN0aW9uKCRzdGF0ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9fY29tbW9uL2RpcmVjdGl2ZXMvZm9vdGVyL2Zvb3Rlci5odG1sJ1xuICAgIH07XG5cbn0pOyIsImFwcC5kaXJlY3RpdmUoJ2NoYXQnLCBmdW5jdGlvbigkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgQVVUSF9FVkVOVFMsICRzdGF0ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9fY29tbW9uL2RpcmVjdGl2ZXMvY2hhdC9jaGF0Lmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgU29ja2V0KSB7XG4gICAgICAgICAgICBzY29wZS5jaGF0ID0gZmFsc2VcbiAgICAgICAgICAgIHNjb3BlLm9wZW4gPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coc2NvcGUuY2hhdClcbiAgICAgICAgICAgICAgICBzY29wZS5jaGF0ID0gIXNjb3BlLmNoYXRcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KTsiLCJhcHAuZGlyZWN0aXZlKCduYXZiYXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgQVVUSF9FVkVOVFMsICRzdGF0ZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9fY29tbW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUpIHtcblxuICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG5cbiAgICAgICAgICAgIHNjb3BlLmlzTG9nZ2VkSW4gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5sb2dvdXQoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2xhbmRpbmcnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBzZXRVc2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSB1c2VyO1xuXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgcmVtb3ZlVXNlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2V0VXNlcigpO1xuXG5cbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcywgc2V0VXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzLCByZW1vdmVVc2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCByZW1vdmVVc2VyKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KTsiXX0=
