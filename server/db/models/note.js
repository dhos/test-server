'use strict';
var Sequelize = require('sequelize');

var db = require('../_db');

module.exports = db.define('note', {
    ref_lc: {
        type: Sequelize.STRING,
    },
    user: {
        type: Sequelize.INTEGER
    }
});