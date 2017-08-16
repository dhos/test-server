app.factory('countryFactory', function($http, $q) {
    var d = {}
        //Fetches
    d.getCountries = (query) => {
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
    d.getSingleCountry = (id) => {
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
    d.createCountry = (Country) => {
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
    d.updateCountry = (Country) => {
        return $http.put(`/api/lc/${Country.id}`)
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
    d.deleteCountry = (query) => {
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