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
    commercial_notes: {
        type: Sequelize.JSON,
        defaultValue: {}
    },
    business_notes: {
        type: Sequelize.JSON,
        defaultValue: {}
    },
    date: {
        type: Sequelize.DATE
    },
    expire: {
        type: Sequelize.DATE
    },
    country: {
        type: Sequelize.INTEGER
    },
    client: {
        type: Sequelize.INTEGER
    },
    bank: {
        type: Sequelize.INTEGER
    },
    pic: {
        type: Sequelize.INTEGER
    },
    csp: {
        type: Sequelize.INTEGER
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
		*/
    },
    archived: {
        type: Sequelize.BOOLEAN
    },
    draft: {
        type: Sequelize.BOOLEAN
    },
    client_approved: {
        type: Sequelize.BOOLEAN
    },
    business_approved: {
        type: Sequelize.BOOLEAN
    },
    client_draftText: {
        type: Sequelize.JSON
    },
    business_draftText: {
        type: Sequelize.JSON
    },
    finDoc: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    finDate: {
        type: Sequelize.DATE
    },
    amendedCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }
});