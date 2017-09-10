'use strict';
var Sequelize = require('sequelize');

var db = require('../_db');

module.exports = db.define('swift_clause', {
    swift_code: {
        type: Sequelize.STRING
    },
    field_description: {
        type: Sequelize.TEXT
    },
    line_description: {
        type: Sequelize.TEXT
    },
    commercial: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }

});