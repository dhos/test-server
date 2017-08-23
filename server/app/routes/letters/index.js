'use strict';
var router = require('express').Router(); // eslint-disable-line new-cap
module.exports = router;
var db = require('../../../db');
var Letter = db.model('letter')
var multer = require('multer')
var storage = multer.memoryStorage();
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
    Letter.findAll({
        where: req.query
    }).then(letters => {
        res.json(letters)
    }).catch(err => {
        next(err)
    })
})

router.get('/:id', ensureAuthenticated, (req, res, next) => {
    Letter.findOne({
        where: {
            lc_number: req.params.id
        }
    }).then(letter => {
        res.json(letter)
    }).catch(err => {
        next(err)
    })
})

//end fetches

//sets
router.post('/', ensureAuthenticated, (req, res, next) => {
    console.log(req.body.newLetter)
    Letter.create(req.body.newLetter).then(letter => {
        res.json(letter)
    }).catch(err => {
        return next(err)
    })
})

//end sets

//updates

router.put('/', ensureAuthenticated, (req, res, next) => {
    const letter = req.body.updates
    Letter.findOne({
        where: {
            lc_number: letter.lc_number
        }
    }).then(letterToBeUpdated => {
        if (letterToBeUpdated) {
            return letterToBeUpdated.updateAttributes(letter)
        }
    }).then(updatedLetter => {
        res.json(updatedLetter)
    }).catch((err) => {
        return next(err)
    })
})

//end updates

//deletes

router.put('/delete', ensureAuthenticated, (req, res, next) => {
    Letter.findOne({
        where: {
            id: req.body.letter.id
        }
    }).then(letterToBeRemoved => {
        letterToBeRemoved.status = 0
        letterToBeRemoved.save().then(letter => {

        })
    })
})

//end deletes