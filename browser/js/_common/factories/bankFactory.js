app.factory('bankFactory', function($http, $q) {
    var d = {}
        //Fetches
    d.getBanks = (query) => {
        return $http.get('/api/banks/', {
            params: query
        }).then((response) => {
            return response.data
        }).catch(err => {
            return $q.reject({
                message: err
            })
        })
    }
    d.getSingleBank = (id) => {
        return $http.get(`/api/banks/${id}`)
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
    d.createBank = (bank) => {
        return $http.post('/api/banks/')
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
    d.updateBank = (bank) => {
        return $http.put(`/api/banks/${bank.id}`)
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
    d.deleteBank = (query) => {
        return $http.delete(`/api/banks/`, {
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