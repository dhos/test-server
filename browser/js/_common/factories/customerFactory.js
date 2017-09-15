app.factory('customerFactory', function($http, $q) {
    var d = {}
        //user fetches
    d.createCustomer = function(user) {
        return $http.post("/api/customers/create", user)
            .then(function(response) {
                return response.data
            });
    }
    d.updateCustomer = function(user) {
        return $http.put("/api/customers/update", user)
            .then(function(response) {
                return response.data;
            })
    }

    d.getUsers = (query) => {
        return $http.get('/api/customers/', {
            params: query
        }).then((response) => {
            return response.data
        }).catch(err => {
            return $q.reject({
                message: err
            })
        })
    }
    d.getSingleCustomer = function(id) {
        return $http.get("/api/customers/" + id)
            .then(function(response) {
                return response.data
            })
    }

    //Deletes
    d.deleteCustomer = (query) => {
        return $http.delete(`/api/customers/`, {
            params: query
        }).then(response => {
            return response.data
        }).catch(err => {
            return $q.reject({
                message: err
            })
        })
    }
    return d
});