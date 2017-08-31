app.factory('lcFactory', function($http, $q) {
    var d = {}
        //Fetches
    d.getLetters = (query) => {
        return $http.get('/api/lc/', {
            params: query
        }).then((response) => {
            return response.data
        }).catch(err => {
            return $q.reject({
                message: err
            })
        })
    }
    d.getSingleLetter = (id) => {
        return $http.get(`/api/lc/${id}`)
            .then(response => {
                return response.data
            }).catch(err => {
                return $q.reject({
                    message: err
                })
            })
    }

    d.getLetterCount = () => {
        return $http.get('/api/lc/count').then(response => {
                return response.data
            }).catch(err => {
                return $q.reject({
                    message: err
                })
            })
            //End Fetches
    }

    //Sets
    d.createLetter = (letter, file) => {
        var file = file;
        console.log(letter)
        var fd = new FormData();
        fd.append('file', file);
        fd.append('newLetter', angular.toJson(letter))
        return $http.post('/api/lc/', fd, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            })
            .then(response => {
                return response.data
            }).catch(err => {
                return $q.reject({
                    message: err
                })
            })
    }

    //End Sets

    //Updates
    d.updateLetter = (letter) => {
        var body = {
            updates: letter
        }
        return $http.put(`/api/lc/`, body)
            .then(response => {
                return response.data
            }).catch(err => {
                return $q.reject({
                    message: err
                })
            })
    }
    d.updateLetterFile = (letter, file) => {
            var file = file;
            console.log(letter)
            var fd = new FormData();
            fd.append('file', file);
            fd.append('updates', angular.toJson(letter))
            return $http.put('/api/lc/amend', fd, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                })
                .then(response => {
                    return response.data
                }).catch(err => {
                    return $q.reject({
                        message: err
                    })
                })
        }
        //End Updates

    //Deletes
    d.deleteLetter = (query) => {
        return $http.delete(`/api/lc/`, {
            params: query
        }).then(response => {
            return response.data
        }).catch(err => {
            return $q.reject({
                message: err
            })
        })
    }

    //End Deletes
    return d
});