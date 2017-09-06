var chalk = require('chalk');
var db = require('./server/db');
var Letter = db.model('letter')
var User = db.model('user');
var Country = db.model('country')
var Bank = db.model('bank')
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
        organizeData(csvData)
        makeUsers()
            // makeCountries()
        makeBanks()

    })

var temp = [{
        id: 1,
        name: 'Bangladesh',
        clauses: [{
            swift: '27',
            fieldDescription: 'Sequence of Total',
            lineDescription: '1/1 (Number)(Total)'
        }, {
            swift: '40 A',
            fieldDescription: 'Form of Documentary Credit',
            lineDescription: 'Irrevocable'
        }, {
            swift: '31C',
            fieldDescription: 'Date of Issue',
            lineDescription: 'dd/mm/yyyy'
        }]
    }, {
        id: 2,
        name: 'Nepal',
        clauses: [{
            swift: '40E',
            fieldDescription: 'Applicable Rules',
            lineDescription: 'UCP LATEST VERSION'
        }, {
            swift: '32B',
            fieldDescription: `Currency`,
            lineDescription: `/Amount □ USD        □  JPY       □ EUR`
        }, {
            swift: '51A',
            fieldDescription: 'Applicant',
            lineDescription: 'Bank'
        }]
    }, {
        id: 3,
        name: 'Sri Lanka',
        clauses: [{
            swift: '59',
            fieldDescription: `Beneficiary
(Follow this address in L/C
application to avoid amendment, 
as this is our official address
information in our letterhead)"`,
            lineDescription: `SABIC ASIA PACIFIC PTE LTD
ONE TEMASEK AVENUE 
NO. 06-01 MILLENIA TOWER
SINGAPORE 039192"`
        }, {
            swift: '39A',
            fieldDescription: `Percentage Credit
Amount Tolerance`,
            lineDescription: `10/10`
        }]
    }, {
        id: 4,
        name: 'India',
        clauses: [{
            swift: '39B',
            fieldDescription: 'Maximum Credit Amount',
            lineDescription: 'Not Exceeding'
        }, {
            swift: '41D',
            fieldDescription: 'Available With/by',
            lineDescription: 'ANY BANK IN SINGAPORE BY NEGOTIATION'
        }]
    }, {
        id: 5,
        name: 'Bhutan',
        clauses: [{
            swift: '42C',
            fieldDescription: `  Drafts At`,
            lineDescription: `□ XX Days from B/L date                  □ Sight`
        }, {
            swift: '42A',
            fieldDescription: 'Drawee',
            lineDescription: 'ISSUING BANK / CONFIRMING BANK'
        }]
    }]
    // temp.forEach(country => {
    //     Country.create(country)
    // })
var makeCountries = () => {
    var countries = {
        'Bangladesh': 1,
        'Nepal': 2,
        'Sri Lanka': 3,
        'India': 4,
        'Bhutan': 5
    }
    for (var key of Object.keys(countries)) {
        Country.create({
            id: countries[key],
            name: key
        })
    }
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
        username: 'Sabic',
        password: 'test',

    })
}
var makeUsers = () => {
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
    for (var key of Object.keys(users)) {
        User.create({
            username: key,
            password: "test",
            role: Math.ceil(Math.random() * 2)
        })
    }
    User.create({
        username: 'test',
        password: 'test',
        role: 4
    })
    User.create({
        username: 'Sabic',
        password: 'test',
        role: 0,

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