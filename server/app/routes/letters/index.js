'use strict';
var router = require('express').Router(); // eslint-disable-line new-cap
module.exports = router;
var path = require('path');
var db = require('../../../db');
var Letter = db.model('letter')
var multer = require('multer')
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../../../../browser/uploads'))
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})
var upload = multer({
    storage: storage
})
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
    let query = req.query
    query.expire = {
        $gte: new Date(new Date() - (30 * 24 * 60 * 60 * 1000))
    }
    Letter.findAll({
        where: query
    }).then(letters => {
        res.json(letters)
    }).catch(err => {
        next(err)
    })
})

router.get('/archived', ensureAuthenticated, (req, res, next) => {
    Letter.findAll({
        where: {
            expire: {
                $lte: new Date(new Date() - (30 * 24 * 60 * 60 * 1000))
            }
        }
    }).then(archivedLetters => {
        console.log(archivedLetters)
        res.json(archivedLetters)
    }).catch(err => next(err))
})

router.get('/expiring', ensureAuthenticated, (req, res, next) => {
    db.query(`select * from letters where letters.expire < NOW() + interval '30 days' and letters.expire >= NOW();`).then(expiringLetters => {
        res.json(expiringLetters)
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
router.post('/', ensureAuthenticated, upload.single('file'), (req, res, next) => {
    console.log(req.body)
    var newLetter = JSON.parse(req.body.newLetter)
    newLetter.uploads = [req.file.originalname]
    Letter.create(newLetter).then(letter => {
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

router.put('/amend', upload.single('file'), ensureAuthenticated, (req, res, next) => {
    var updates = JSON.parse(req.body.updates)
    console.log(req.file)
    updates.uploads.unshift(req.file.originalname)
    console.log(updates.uploads)
    Letter.findOne({
        where: {
            lc_number: updates.lc_number
        }
    }).then(letterToBeUpdated => {
        if (letterToBeUpdated) {
            return letterToBeUpdated.updateAttributes(updates)
        }

    }).then(updatedLetter => {
        res.json(updatedLetter)
    }).catch(err => {
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
    }).catch(err => next(err))
})

//end deletes