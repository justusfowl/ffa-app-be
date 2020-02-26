var express = require('express'); 
var router = express.Router();

var messageCtrl = require('../controllers/message.controller');

router.route('/general')
    .post(messageCtrl.handleGeneralMessage)

    
router.route('/prescription')
    .post(messageCtrl.handlePrescriptionMessage)

module.exports = router;