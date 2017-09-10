app.factory('clauseFactory', function($http, $q) {
    var d = {}
        //Fetches
    d.getClauses = (query) => {
        return $http.get('/api/clauses/', {
            params: query
        }).then((response) => {
            return response.data
        }).catch(err => {
            return $q.reject({
                message: err
            })
        })
    }
    d.getSingleClause = (id) => {
        return $http.get(`/api/clauses/${id}`)
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
    d.createClause = (clause) => {
        return $http.post('/api/clauses/', clause)
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
    d.updateClause = (clause) => {
        return $http.put(`/api/clauses/`, clause)
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
    d.deleteClause = (query) => {
        return $http.delete(`/api/clauses/`, {
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