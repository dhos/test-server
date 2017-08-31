'use strict';
var router = require('express').Router();
var db = require('../../../db')
var chalk = require('chalk')
var bcrypt = require('bcryptjs');

var User = db.model('user');


var ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).end();
    }
}
router.get('/', (req, res) => {
    User.findAll({
        where: req.query
    }).then(users => {
        res.json(users)
    }).catch(err => {
        next(err)
    })
})


//UPDATES FOR THINGS
router.put('/update', function(req, res) {

})

router.post('/signup', function(req, res, next) {
    var user = req.body.user
    User.create(user).then(createdUser => {
        res.json(createdUser)
    }).catch(err => {
        next(err)
    })
})

module.exports = router;