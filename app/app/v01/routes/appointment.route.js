var express = require('express'); 
var router = express.Router();

var appointmentCtrl = require('../controllers/appointment.controller');
var tokenValidator = require('../controllers/tokenvalidate.controller');
var middlware_hasScopeAdmin = tokenValidator.HasScope('admin');
var middlware_hasScopeAdminDocMfa = tokenValidator.HasScope(['admin', 'doc', 'mfa']);

router.route("/")
    .get([tokenValidator.verifyToken, middlware_hasScopeAdminDocMfa], appointmentCtrl.getAppointments)

router.route("/:appointmentId")
    .delete([tokenValidator.detectToken, middlware_hasScopeAdmin], appointmentCtrl.adminRemoveAppointment)

router.route('/new')
    .get([tokenValidator.detectToken, tokenValidator.HasUserVerifiedEmail], appointmentCtrl.getAvailableSlots)
    .post([tokenValidator.detectToken, tokenValidator.HasUserVerifiedEmail], appointmentCtrl.addTeleAppointment)

router.route('/my')
    .get([tokenValidator.verifyToken], appointmentCtrl.getMyAppointments)

router.route('/my/:appointmentId')
    .delete([tokenValidator.verifyToken], appointmentCtrl.removeAppointment)

router.route('/docs')
    .get(appointmentCtrl.getAvailableDocs)

router.route('/slots')
    .get([tokenValidator.detectToken, middlware_hasScopeAdmin], appointmentCtrl.adminGetTeleSlots)
    .post([tokenValidator.detectToken, middlware_hasScopeAdmin], appointmentCtrl.adminAddTeleSlot)
    .put([tokenValidator.detectToken, middlware_hasScopeAdmin], appointmentCtrl.adminUpdateTeleSlot)

router.route('/slots/:slotId')
    .delete([tokenValidator.detectToken, middlware_hasScopeAdmin], appointmentCtrl.removeAdminTeleSlot)

router.route('/download')
    .get([tokenValidator.detectToken, middlware_hasScopeAdmin], appointmentCtrl.downloadAppointments)   

module.exports = router;