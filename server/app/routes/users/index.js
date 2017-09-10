'use strict';
var router = require('express').Router();
var db = require('../../../db')
var User = db.model('user');
var _ = require('lodash')


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
        users.forEach(e => {
            return _.omit(e.toJSON(), ['password', 'salt'])
        })
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
    const updates = req.body
    User.update(updates, {
        where: {
            id: req.body.id
        }
    }).then(result => {
        console.log(result)
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