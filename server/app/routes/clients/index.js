'use strict';
var router = require('express').Router();
var db = require('../../../db')
var Client = db.model('client');


var ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).end();
    }
}
router.get('/', (req, res, next) => {
    Client.findAndCountAll({
        where: JSON.parse(req.query.where),
        order: [
            ['name', 'ASC']
        ],
        offset: req.query.offset * 100,
        limit: 100
    }).then(clients => {
        res.json(clients)
    }).catch(err => {
        next(err)
    })
})
router.get('/all', (req, res, next) => {
    Client.findAll({
        order: [
            ['name', 'ASC']
        ],
    }).then(clients => {
        res.json(clients)
    }).catch(err => next(err))
})
router.get('/:id', (req, res, next) => {
    Client.findOne({
        where: {
            client_code: req.params.id
        }
    }).then(client => {
        res.json(client)
    }).catch(err => next(err))
})

//UPDATES FOR THINGS
router.put('/update', function(req, res, next) {
    const updates = req.body
    Client.update(updates, {
        where: {
            client_code: req.body.client_code
        }
    }).then(result => {
        res.json(result)
    }).catch((err) => {
        return next(err)
    })
})

router.post('/create', function(req, res, next) {
    var client = req.body
    client.emails = client.emails.split(',')
    Client.create(client).then(createdClient => {
        res.json(createdClient)
    }).catch(err => {
        next(err)
    })
})


router.delete('/', ensureAuthenticated, (req, res, next) => {
    Client.destroy({
        where: req.query
    }).then(() => {
        res.sendStatus(200)
    }).catch(err => {
        return next(err)
    })
})

module.exports = router;