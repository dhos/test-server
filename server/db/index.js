'use strict';
var db = require('./_db');
module.exports = db;

var User = require('./models/user')
var Letter = require('./models/letter')
var Country = require('./models/country')
var Bank = require('./models/bank')
var SwiftClause = require('./models/swiftClause')
var Customer = require('./models/customer')