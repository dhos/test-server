'use strict';
var router = require('express').Router();
var db = require('../../../db')
var Customer = db.model('customer');


var ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).end();
    }
}
router.get('/', (req, res, next) => {
    Customer.findAll({
        where: req.query
    }).then(customers => {
        res.json(customers)
    }).catch(err => {
        next(err)
    })
})

router.get('/:id', (req, res, next) => {
    Customer.findOne({
        where: {
            id: req.params.id
        }
    }).then(customer => {
        res.json(customer)
    }).catch(err => next(err))
})

//UPDATES FOR THINGS
router.put('/update', function(req, res, next) {
    const updates = req.body
    Customer.update(updates, {
        where: {
            id: req.body.id
        }
    }).then(result => {
        res.json(result)
    }).catch((err) => {
        return next(err)
    })
})

router.post('/create', function(req, res, next) {
    var customer = req.body
    Customer.create(customer).then(createdCustomer => {
        res.json(createdCustomer)
    }).catch(err => {
        next(err)
    })
})


router.delete('/', ensureAuthenticated, (req, res, next) => {
    Customer.destroy({
        where: req.query
    }).then(() => {
        res.sendStatus(200)
    }).catch(err => {
        return next(err)
    })
})

module.exports = router;