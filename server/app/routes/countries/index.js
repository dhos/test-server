'use strict';
var router = require('express').Router(); // eslint-disable-line new-cap
module.exports = router;
var db = require('../../../db');
var Country = db.model('country')
var ensureAuthenticated = function(req, res, next) {
    var err;
    if (req.isAuthenticated()) {
        next();
    } else {
        err = new Error('You must be logged in.');
        err.status = 401;
        next(err);
    }
};

//fetches

router.get('/', ensureAuthenticated, (req, res, next) => {
    Country.findAll({
        where: req.query
    }).then(countries => {
        res.json(countries)
    }).catch(err => {
        next(err)
    })
})

// router.get('/:id', ensureAuthenticated, (req, res, next) => {

// })

// //end fetches

// //sets
// router.post('/', ensureAuthenticated, (req, res, next) => {

// })

//end sets

//updates

router.put('/', ensureAuthenticated, (req, res, next) => {
    const updates = req.body
    Country.update(updates, {
        where: {
            id: req.body.id
        }
    }).then(result => {
        console.log(result)
    }).catch(err => next(err))
})

//end updates

//deletes

// router.delete('/', ensureAuthenticated, (req, res, next) => {

// })

//end deletes