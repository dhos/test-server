'use strict';
var Sequelize = require('sequelize');

var db = require('../_db');

module.exports = db.define('country', {
    name: {
        type: Sequelize.STRING
    },
    clauses: {
        type: Sequelize.JSON
    }
});