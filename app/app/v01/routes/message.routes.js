var express = require('express'); 
var router = express.Router();

var messageCtrl = require('../controllers/message.controller');
var emailerCtrl = require('../controllers/emailer.controller');
var tokenValidator = require('../controllers/tokenvalidate.controller');

router.route('/general')
    .post([tokenValidator.detectToken], messageCtrl.handleGeneralMessage)

    
router.route('/prescription')
    .post([tokenValidator.detectToken], messageCtrl.handlePrescriptionMessage)

router.route('/prescription/:messageId')
    .delete([tokenValidator.verifyToken], messageCtrl.handlePrescriptionMessageRemove)

router.route('/my')
    .get([tokenValidator.verifyToken],messageCtrl.getMyMessages)

module.exports = router;