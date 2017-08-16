'use strict';
var Sequelize = require('sequelize');

var db = require('../_db');

module.exports = db.define('letter', {
    lc_number: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    pdf: {
        type: Sequelize.STRING
    },
    ammendments: {
        type: Sequelize.JSON
    },
    country: {
        type: Sequelize.INTEGER
    },
    client: {
        type: Sequelize.INTEGER
    },
    state: {
        type: Sequelize.INTEGER
            /*
    	1 = new
		2 = pending review
		3 = updated
		4 = frozen
		5 = archived
		*/
    }
});