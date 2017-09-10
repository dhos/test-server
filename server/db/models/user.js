'use strict';
var bcrypt = require('bcryptjs');
var _ = require('lodash');
var Sequelize = require('sequelize');

var db = require('../_db');

module.exports = db.define('user', {
    username: {
        type: Sequelize.STRING
    },
    firstName: {
        type: Sequelize.STRING
    },
    lastName: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING
    },
    salt: {
        type: Sequelize.STRING
    },
    role: {
        type: Sequelize.INTEGER
            /*
            0:customer
            1:pic,
            2:csp,
            3:super manager,
            4:admin
            */
    },
    countries: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: []
    },
    customers: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: []
    },
    //customer
    email: {
        type: Sequelize.STRING
    },
    address: {
        type: Sequelize.JSON
    },
    number: {
        type: Sequelize.STRING
    },
    website: {
        type: Sequelize.STRING
    },
    clauses: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: []
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
            console.log(user)
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(user.password, salt);
            user.salt = salt;
            user.password = hash;
        }
    }
});