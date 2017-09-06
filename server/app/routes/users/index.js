'use strict';
var router = require('express').Router();
var db = require('../../../db')
var User = db.model('user');


var ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).end();
    }
}
router.get('/', (req, res, next) => {
    User.findAll({
        where: req.query
    }).then(users => {
        res.json(users)
    }).catch(err => {
        next(err)
    })
})

router.get('/:id', (req, res, next) => {
    User.findOne({
        where: {
            id: req.params.id
        }
    }).then(user => {
        res.json(user)
    })
})

//UPDATES FOR THINGS
router.put('/update', function(req, res, next) {
    const user = req.body
    User.findOne({
        where: {
            id: user.id
        }
    }).then(userToBeUpdated => {
        if (userToBeUpdated) {
            return userToBeUpdated.updateAttributes(user)
        }
    }).then(updatedUser => {
        res.json(updatedUser)
    }).catch((err) => {
        return next(err)
    })
})

router.post('/signup', function(req, res, next) {
    var user = req.body
    User.create(user).then(createdUser => {
        res.json(createdUser)
    }).catch(err => {
        next(err)
    })
})


router.delete('/', ensureAuthenticated, (req, res, next) => {
    User.destroy({
        where: req.query
    }).then(() => {
        res.sendStatus(200)
    }).catch(err => {
        return next(err)
    })
})

module.exports = router;