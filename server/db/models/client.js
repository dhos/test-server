'use strict';
var Sequelize = require('sequelize');

var db = require('../_db');

module.exports = db.define('client', {
    client_code: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
    },
    customer: {
        type: Sequelize.INTEGER
    },
    emails: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
    }
});