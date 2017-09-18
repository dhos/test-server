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
            4:admin
            */
    },
    manager: {
        type: Sequelize.BOOLEAN
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
    },
    last_login: {
        type: Sequelize.DATE
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
        },
        beforeUpdate: function(instance, optons, next) {
            var SALT_FACTOR = 5;
            if (!instance.changed('password')) return next();
            bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
                if (err) return next(err);

                bcrypt.hash(instance.get('password'), salt, null, function(err, hash) {
                    if (err) return next(err);
                    instance.set('password', hash);
                    console.log(instance.get('password'))
                    next()
                });
            });
        }
    }
});