app.factory('userFactory', function($http, $q) {
    var userFactory = {}
        //user fetches
    userFactory.createUser = function(user) {
        return $http.post("/api/users/signup", user)
            .then(function(response) {
                return response.data
            });
    }
    userFactory.updateUser = function(user) {
        return $http.put("/api/users/update", user)
            .then(function(response) {
                return response.data;
            })
    }

    userFactory.getUsers = (query) => {
        return $http.get('/api/users/', {
            params: query
        }).then((response) => {
            return response.data
        }).catch(err => {
            return $q.reject({
                message: err
            })
        })
    }
    userFactory.getSingleUser = function(id) {
        return $http.get("/api/users/" + id)
            .then(function(response) {
                return response.data
            })
    }

    //Deletes
    userFactory.deleteUser = (query) => {
        return $http.delete(`/api/users/`, {
            params: query
        }).then(response => {
            return response.data
        }).catch(err => {
            return $q.reject({
                message: err
            })
        })
    }
    return userFactory
});