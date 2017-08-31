'use strict';
var router = require('express').Router();
module.exports = router;

router.use('/users', require('./users'));
router.use('/lc', require('./letters'))
router.use('/countries', require('./countries'))
router.use('/banks', require('./banks'))
    // router.user('/message', require('./message'))
    // Make sure this is after all of
    // the registered routes!
router.use(function(req, res) {
    res.status(404).end();
});