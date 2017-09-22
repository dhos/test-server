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
// create reusable transporter object using the default SMTP transport


// setup email data with unicode symbols


// send mail with defined transport object
// transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//         return console.log(error);
//     }
//     console.log('Message sent: %s', info.messageId);
//     // Preview only available when sending through an Ethereal account
//     console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

//     // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
//     // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
// });


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
    Letter.findAll({
        where: {
            expire: {
                $lte: new Date(new Date() - (30 * 24 * 60 * 60 * 1000))
            }
        }
    }).then(archivedLetters => {
        console.log(archivedLetters)
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
        res.json(updatedLetter)
        User.findAll({
            where: {
                countries: {
                    $contains: [updatedLetter.country]
                },
                customers: {
                    $contains: [updatedLetter.customer]
                }
            }
        }).then(users => {
            let emails = users.map(user => {
                return user.email
            })
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
                    <p>Customer Name: SABIC ASIA PACIFIC PTE LTD
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
    </div>
    <br>
    <br>
    <div style="color: #53565a; font-family: arial; font-size: 11px; line-height: 14px;padding: 10px;">
        <p style="font-size: 14px;">
            Sheetal Grover
            <br> Sr Representative, CS, SCM,
            <br> Petrochemicals, INS
            <br>
        </p>
        <p style="font-size: 14px;">
            SABIC
            <br> SABIC India Pvt. Ltd.
            <br> 10th Fl, Ambience Corp Twrs II Ambience Island, Gurugram
            <br> Gurugram, 122001
            <br> India
            <br> T: +91-124-4746151
            <br> E: <a href="mailto:grovers@sabic.com">grovers@sabic.com</a>
            <br> W: <a href="http://www.sabic.com"> www.sabic.com</a>
            <br> S: <a href="https://www.facebook.com/sabiccorp/"> Facebook</a> |<a href="https://www.instagram.com/sabic/"> Instagram</a> |<a href="https://www.linkedin.com/company/165806/"> LinkedIn</a> | <a href="https://twitter.com/SABIC"> Twitter</a> | <a href="https://www.youtube.com/sabic"> YouTube</a>
        </p>
        <p style="font-size: 9px;">
            This e-mail and any attachments are for authorized use by the intended recipient(s) only. They may contain proprietary material or confidential information and/or be subject to legal privilege. They should not be copied, disclosed to, or used by any other party. If you have reason to believe that you are not one of the intended recipients of this e-mail, please notify the sender immediately by reply e-mail and immediately delete this e-mail and any of its attachments. Thank you.</p>
    </div>`

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                host: 'smtp-aws.eliteasiapac.com',
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
            });
        })


        // send mail with defined transport object
        // }).catch(err => {
        //     next(err)
        // })
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
    Letter.findOne({
        where: {
            id: req.body.letter.id
        }
    }).then(letterToBeRemoved => {
        letterToBeRemoved.status = 0
        letterToBeRemoved.save().then(letter => {

        })
    }).catch(err => next(err))
})

//end deletes