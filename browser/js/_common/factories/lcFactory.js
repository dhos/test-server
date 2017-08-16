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

    //End Fetches

    //Sets
    d.createLetter = (letter) => {
        return $http.post('/api/lc/')
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
        return $http.put(`/api/lc/${letter.id}`)
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