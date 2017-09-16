var chalk = require('chalk');
var db = require('./server/db');
var Letter = db.model('letter')
var User = db.model('user');
var Country = db.model('country')
var Customer = db.model('customer')
var Bank = db.model('bank')
var Clause = db.model('swift_clause')
var fs = require('fs')
var path = require('path')
var Promise = require('sequelize').Promise;
var parse = require('csv-parse');
var sample = path.join(__dirname, '/sample.csv')

var csvData = []

fs.createReadStream(sample)
    .pipe(parse({
        delimiter: ':'
    }))
    .on('data', csvrow => {
        csvData.push(csvrow)
    })
    .on('end', () => {
        //organizeData(csvData)
        // makeUsers()
        // makeCountries()
        // makeBanks()
        // makeClauses()
        makeCustomers()

    })


var makeCountries = () => {
    var temp = [{
        id: 1,
        name: 'Bangladesh',
        clauses: [1, 2, 3]
    }, {
        id: 2,
        name: 'Nepal',
        clauses: [4, 5, 6]
    }, {
        id: 3,
        name: 'Sri Lanka',
        clauses: [7, 8]
    }, {
        id: 4,
        name: 'India',
        clauses: [9, 10]
    }, {
        id: 5,
        name: 'Bhutan',
        clauses: [11, 12]
    }]
    temp.forEach(country => {
        Country.create(country)
    })
}

var makeClauses = () => {


    var clauses = [{
        swift_code: '27',
        field_description: 'Sequence of Total',
        line_description: '1/1 (Number)(Total)'
    }, {
        swift_code: '40 A',
        field_description: 'Form of Documentary Credit',
        line_description: 'Irrevocable'
    }, {
        swift_code: '31C',
        field_description: 'Date of Issue',
        line_description: 'dd/mm/yyyy'
    }, {
        swift_code: '40E',
        field_description: 'Applicable Rules',
        line_description: 'UCP LATEST VERSION'
    }, {
        swift_code: '32B',
        field_description: `Currency`,
        line_description: `/Amount □ USD        □  JPY       □ EUR`
    }, {
        swift_code: '51A',
        field_description: 'Applicant',
        line_description: 'Bank'
    }, {
        swift_code: '59',
        field_description: `Beneficiary
(Follow this address in L/C
application to avoid amendment, 
as this is our official address
information in our letterhead)"`,
        line_description: `SABIC ASIA PACIFIC PTE LTD
ONE TEMASEK AVENUE 
NO. 06-01 MILLENIA TOWER
SINGAPORE 039192"`
    }, {
        swift_code: '39A',
        field_description: `Percentage Credit
Amount Tolerance`,
        line_description: `10/10`
    }, {
        swift_code: '39B',
        field_description: 'Maximum Credit Amount',
        line_description: 'Not Exceeding'
    }, {
        swift_code: '41D',
        field_description: 'Available With/by',
        line_description: 'ANY BANK IN SINGAPORE BY NEGOTIATION'
    }, {
        swift_code: '42C',
        field_description: `  Drafts At`,
        line_description: `□ XX Days from B/L date                  □ Sight`
    }, {
        swift_code: '42A',
        field_description: 'Drawee',
        line_description: 'ISSUING BANK / CONFIRMING BANK'
    }]
    clauses.forEach(clause => {
        Clause.create(clause)
    })
}
var makeBanks = () => {
    var banks = {
        "CITI": 1,
        "SCB": 2,
        "HSBC": 3,
        "BTMU": 4
    }
    for (var key of Object.keys(banks)) {
        Bank.create({
            name: key,
            id: banks[key]
        })
    }
}

var makeCustomers = () => {
    Customer.create({
        name: 'Sabic'

    })
}
var makeUsers = () => {
    // var users = {
    //     JENY: 1,
    //     THINHA: 2,
    //     ANURAG: 3,
    //     SURYA: 4,
    //     SANJEEV: 5,
    //     NAVDEEP: 6,
    //     GAURAV: 7,
    //     VIPIN: 8,
    //     SHEETAL: 9
    // }
    // for (var key of Object.keys(users)) {
    //     User.create({
    //         username: key,
    //         password: "test",
    //         role: Math.ceil(Math.random() * 2)
    //     })
    // }
    User.create({
        username: 'admin',
        password: 'admin',
        role: 4
    })
}

var organizeData = csvData => {
    var countries = {
        'Bangladesh': 1,
        'Nepal': 2,
        'Sri Lanka': 3,
        'India': 4,
        'Bhutan': 5
    }
    var banks = {
        "CITI": 1,
        "SCB": 2,
        "HSBC": 3,
        "BTMU": 4
    }
    var users = {
        JENY: 1,
        THINHA: 2,
        ANURAG: 3,
        SURYA: 4,
        SANJEEV: 5,
        NAVDEEP: 6,
        GAURAV: 7,
        VIPIN: 8,
        SHEETAL: 9
    }
    var headers = csvData.shift()
    csvData.pop()
    csvData.forEach(row => {
        columns = row[0].split(',')
        var letterToBeCreated = {
            bank: banks[columns[0]],
            date: new Date(columns[1]),
            expiry: new Date(1504813174792),
            contract: columns[2],
            lc_number: columns[3],
            country: countries[columns[4]],
            pic: users[columns[5]],
            csp: users[columns[6]],
            state: Math.floor(Math.random() * 4) + 1,
            draft: false

        }

        Letter.create(letterToBeCreated)
    })
}