'use strict';
var Sequelize = require('sequelize');

var db = require('../_db');

module.exports = db.define('customer', {
    name: {
        type: Sequelize.STRING,
    },
    email: {
        type: Sequelize.STRING
    },
    address: {
        type: Sequelize.STRING
    },
    number: {
        type: Sequelize.STRING
    },
    website: {
        type: Sequelize.STRING
    }
});