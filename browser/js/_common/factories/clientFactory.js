app.factory('clientFactory', function($http, $q) {
    var d = {}
        //Fetches
    d.getClients = (query) => {
        console.log('making it to factory')
        return $http.get('/api/clients/', {
            params: query
        }).then((response) => {
            return response.data
        }).catch(err => {
            return $q.reject({
                message: err
            })
        })
    }
    d.getSingleClient = (id) => {
        return $http.get(`/api/clients/${id}`)
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
    d.createClient = (clause) => {
        return $http.post('/api/clients/create', clause)
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
    d.updateClient = (clause) => {
        return $http.put(`/api/clients/update`, clause)
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
    d.deleteClient = (query) => {
        return $http.delete(`/api/clients/`, {
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