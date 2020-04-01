var express = require('express'); 
var router = express.Router();

var messageCtrl = require('../controllers/message.controller');
var emailerCtrl = require('../controllers/emailer.controller');


router.route('/general')
    .post(messageCtrl.handleGeneralMessage)

    
router.route('/prescription')
    .post(messageCtrl.handlePrescriptionMessage)

router.route("/test")
    .post(emailerCtrl.testEmail)


module.exports = router;