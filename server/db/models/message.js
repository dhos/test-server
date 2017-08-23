'use strict';
var bcrypt = require('bcryptjs');
var _ = require('lodash');
var Sequelize = require('sequelize');

var db = require('../_db');

module.exports = db.define('message', {
    sender: {
        type: Sequelize.INTEGER
    },
    receiver: {
        type: Sequelize.INTEGER
    },
    lc: {
        type: Sequelize.INTEGER
    },
    message: {
        type: Sequelize.TEXT
    }
});