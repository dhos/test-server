'use strict';
var router = require('express').Router(); // eslint-disable-line new-cap
module.exports = router;
var path = require('path');
var db = require('../../../db');
var Letter = db.model('letter')
var User = db.model('user')
var chalk = require('chalk')
const nodemailer = require('nodemailer');
var multer = require('multer')
var env = require(path.join(__dirname, '../../../env'));
var Client = db.model('client')
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../../../../browser/uploads'))
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})
var upload = multer({
    storage: storage
})
var ensureAuthenticated = function(req, res, next) {
    var err;
    if (req.isAuthenticated()) {
        next();
    } else {
        err = new Error('You must be logged in.');
        err.status = 401;
        next(err);
    }
};

//fetches

router.get('/', ensureAuthenticated, (req, res, next) => {
    let query = req.query
    query.expire = {
        $gte: new Date(new Date() - (30 * 24 * 60 * 60 * 1000))
    }
    Letter.findAll({
        where: query
    }).then(letters => {
        res.json(letters)
    }).catch(err => {
        next(err)
    })
})

router.get('/archived', ensureAuthenticated, (req, res, next) => {
    Letter.findAndCountAll({
        where: {
            expire: {
                $lte: new Date(new Date() - (30 * 24 * 60 * 60 * 1000))
            }
        },
        offset: req.query.offset * 100,
        limit: 100
    }).then(archivedLetters => {
        res.json(archivedLetters)
    }).catch(err => next(err))
})

router.get('/expiring', ensureAuthenticated, (req, res, next) => {
    db.query(`select * from letters where letters.expire < NOW() + interval '30 days' and letters.expire >= NOW();`).then(expiringLetters => {
        res.json(expiringLetters)
    }).catch(err => {
        next(err)
    })
})

router.get('/:id', ensureAuthenticated, (req, res, next) => {
    Letter.findOne({
        where: {
            lc_number: req.params.id
        }
    }).then(letter => {
        console.log(letter.client)
        res.json(letter)
    }).catch(err => {
        next(err)
    })
})

//end fetches

//sets
router.post('/', ensureAuthenticated, upload.single('file'), (req, res, next) => {
    var newLetter = JSON.parse(req.body.newLetter)
    newLetter.uploads = [req.file.originalname]
    Letter.create(newLetter).then(letter => {
        res.json(letter)
    }).catch(err => {
        return next(err)
    })
})

//end sets

//updates

router.put('/', ensureAuthenticated, (req, res, next) => {
    const letter = req.body.updates
    Letter.findOne({
        where: {
            lc_number: letter.lc_number
        }
    }).then(letterToBeUpdated => {
        if (letterToBeUpdated) {
            return letterToBeUpdated.updateAttributes(letter)
        }
    }).then(updatedLetter => {
        // setup email data with unicode symbols
        console.log(updatedLetter.client)
        res.json(updatedLetter)
        User.findAll({
            where: {
                $or: [{
                    id: updatedLetter.csp
                }, {
                    id: updatedLetter.pic
                }]

            }
        }).then(users => {
            Client.findOne({
                where: {
                    client_code: updatedLetter.client
                }
            }).then(client => {
                let userEmails = [users[0].email, users[1].email]
                let emails = client.emails.concat(userEmails)
                console.log(chalk.red(emails))
                let amended_clauses = []
                for (let key of Object.keys(updatedLetter.business_notes)) {
                    if (updatedLetter.business_notes[key].status == 2) amended_clauses.push(updatedLetter.business_notes[key])
                }
                for (let key of Object.keys(updatedLetter.commercial_notes)) {
                    if (updatedLetter.commercial_notes[key].status == 2) amended_clauses.push(updatedLetter.commercial_notes[key])
                }
                let emailHTML = `<div style="font-family: arial; font-size: 14px; color: #041e42; padding: 10px;">
        <table style="border: 0; width: 100%; padding: 0; font-size: 14px; " cellpadding="0" cellspacing="0">
            <tr>
                <td>
                    <p>Client Name: ${client.name}
                    </p>
                </td>
            </tr>
        </table>
        <p style="font-weight: bold; font-size: 14px; ">RE : L/C NO. ${updatedLetter.lc_number} DATED ${updatedLetter.updatedAt} (SABIC Sales Contract Number ${updatedLetter.contract})</p>
        <p style="font-size: 14px;">Dear SABIC Customer,</p>
        <p style="font-size: 14px;">We thank you for establishing the subject L/C in favour of SABIC Asia Pacific Pte Ltd. The subject L/C has been reviewed as per Annexure-A & the LC guidelines attached with the Sales Contract. </p>
        <p style="font-size: 14px;">Based on the advice & communication received from SABIC Asia Pacific Pte Ltd we are forwarding herewith the below amendments which are required to be carried out in your subject L/C :</p>
        <p style="font-weight: bold; font-size: 14px;">QUOTE</p>
        <ul style="padding-left:0; list-style: none; font-size: 14px;">`
                amended_clauses.forEach(clause => {
                    emailHTML += `<li style="margin-bottom: 10px;">1. CLAUSE ${clause.swift_code}: ${clause.note}</li>`
                })
                emailHTML += `</ul>
        <p style="font-weight: bold; font-size: 14px;">UNQUOTE</p>
        <ul style="padding-left:0; list-style: none; font-size: 14px;">
            <li style="margin-bottom: 10px;">Kindly arrange to carry out all the above amendments by a swift message and provide a transmitted swift copy of the same no later than dd/mm/yyyy (auto calculate date + 3 working days) to beneficiary.</li>
            <li style="margin-bottom: 10px;">Until the L/C which is without recourse, irrevocable, confirmed and clean as per SABIC’s terms and conditions is not received by the beneficiary, they retain the right to execute the shipment.</li>
            <li style="margin-bottom: 10px;">Should there be any further amendments that may be required by beneficiary, these will be communicated to you, as per their further instructions.</li>
            <li style="margin-bottom: 10px;">In case you have any queries or clarifications on the above amendment request, please contact SABIC Customer Service team member managing your account.</li>
        </ul>
        <p style="font-size: 14px;">Best regards,
            <br> For SABIC ASIA PACIFIC PTE LTD
        </p>
        <br>
        <br>
        <span style="font-size: 11px;">This e-mail and any attachments are for authorized use by the intended recipient(s) only. They may contain proprietary material or confidential information and/or be subject to legal privilege. They should not be copied, disclosed to, or used by any other party other than those intended for. If you have reason to believe that you are not one of the intended recipients of this e-mail, please notify the SABIC office and immediately delete this e-mail and any of its attachments. Thank you.</span>
        <p>This is a system generated e-mail. Please do not reply to the sender of this e-mail. All replies to this message will be returned undeliverable.</p>
    </div>`

                // create reusable transporter object using the default SMTP transport
                let transporter = nodemailer.createTransport({
                    host: 'smtp-aws.eliteglobalplatform.com.',
                    port: 25,
                    secure: false, // true for 465, false for other ports
                    auth: {}
                });
                let mailOptions = {
                    from: 'noreply@elitesin.com', // sender address
                    to: emails, // list of receivers
                    subject: `Update to LC ${updatedLetter.lc_number}`, // Subject line
                    text: 'emailBody', // plain text body
                    html: emailHTML // html body
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('hello', info.messageId)
                });
            })
        })
    }).catch((err) => {
        return next(err)
    })
})

router.put('/amend', upload.single('file'), ensureAuthenticated, (req, res, next) => {
    var updates = JSON.parse(req.body.updates)
    updates.uploads.unshift(req.file.originalname)
    Letter.findOne({
        where: {
            lc_number: updates.lc_number
        }
    }).then(letterToBeUpdated => {
        if (letterToBeUpdated) {
            return letterToBeUpdated.updateAttributes(updates)
        }

    }).then(updatedLetter => {
        res.json(updatedLetter)
    }).catch(err => {
        return next(err)
    })
})

//end updates


//deletes

router.put('/delete', ensureAuthenticated, (req, res, next) => {
    Letter.destroy({
        where: req.query
    }).then(() => {
        res.sendStatus(200)
    }).catch(err => next(err))
})

//end deletes