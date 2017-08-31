'use strict';
var Sequelize = require('sequelize');

var db = require('../_db');

module.exports = db.define('bank', {
    name: {
        type: Sequelize.STRING
    }
});