'use strict';
var router = require('express').Router(); // eslint-disable-line new-cap
module.exports = router;
var db = require('../../../db');
var Bank = db.model('bank')
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
    Bank.findAll({
        where: req.query
    }).then(countries => {
        res.json(countries)
    }).catch(err => {
        next(err)
    })
})

router.get('/:id', ensureAuthenticated, (req, res, next) => {
    Bank.findOne({
        where: {
            id: req.params.id
        }
    }).then(bank => {
        res.json(bank)
    })
})

//end fetches

//sets
router.post('/', ensureAuthenticated, (req, res, next) => {
    Bank.create(req.body).then(bank => {
        res.json(bank)
    }).catch(err => {
        return next(err)
    })
})

//end sets

//updates

router.put('/', ensureAuthenticated, (req, res, next) => {
    const bank = req.body
    Bank.findOne({
        where: {
            id: bank.id
        }
    }).then(bankToBeUpdated => {
        if (bankToBeUpdated) {
            return bankToBeUpdated.updateAttributes(bank)
        }
    }).then(updatedBank => {
        res.json(updatedBank)
    }).catch((err) => {
        return next(err)
    })
})

//end updates

//deletes

router.delete('/', ensureAuthenticated, (req, res, next) => {
    Bank.destroy({
        where: req.query
    }).then(Bank.findAll({}).then(banks => {
        res.json(banks)
    }))
})

//end deletes