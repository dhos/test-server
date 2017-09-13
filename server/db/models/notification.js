'use strict';
var Sequelize = require('sequelize');

var db = require('../_db');

module.exports = db.define('notification', {
    Text: {
        type: Sequelize.STRING
    },
    lc_ref: {
        type: Sequelize.STRING
    }
});