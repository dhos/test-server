'use strict';
var Sequelize = require('sequelize');

var db = require('../_db');

module.exports = db.define('letter', {
    lc_number: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    uploads: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
    },
    amendments: {
        type: Sequelize.JSON
    },
    date: {
        type: Sequelize.DATE
    },
    country: {
        type: Sequelize.INTEGER
    },
    client: {
        type: Sequelize.INTEGER
    },
    bank: {
        type: Sequelize.STRING
    },
    pic: {
        type: Sequelize.STRING
    },
    csp: {
        type: Sequelize.STRING
    },
    contract: {
        type: Sequelize.STRING
    },
    state: {
        type: Sequelize.INTEGER
            /*
    	1 = new
		2 = pending review
		3 = amended
		4 = frozen
		5 = 
		*/
    },
    archived: {
        type: Sequelize.BOOLEAN
    },
    approved: {
        type: Sequelize.STRING,
        defaultValue: '00'
    },
    approved: {
        type: Sequelize.STRING,
        defaultValue: '00'
    },
    draftText: {
        type: Sequelize.JSON
            /*{client:{},
                elite:{}}*/
    },
    finDoc: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    finDate: {
        type: Sequelize.DATE
    }
});