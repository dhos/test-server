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
}, {
    instanceMethods: {
        sanitize: function() {
            return _.omit(this.toJSON(), ['password', 'salt']);
        },
        correctPassword: function(candidatePassword) {
            return bcrypt.compareSync(candidatePassword, this.password, this.salt);
        }
    },
    hooks: {
        beforeCreate: function(user) {
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(user.password, salt);
            user.salt = salt;
            user.password = hash;
        }
    }
});