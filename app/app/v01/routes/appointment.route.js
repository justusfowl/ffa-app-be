var express = require('express'); 
var router = express.Router();

var appointmentCtrl = require('../controllers/appointment.controller');

var tokenValidator = require('../controllers/tokenvalidate.controller');
var middlware_hasScopeAdmin = tokenValidator.HasScope('admin');
var middlware_hasScopeAdminDoc = tokenValidator.HasScope(['admin', 'doc']);

router.route("/")
    .get([tokenValidator.detectToken, middlware_hasScopeAdminDoc], appointmentCtrl.getAppointments)

router.route('/new')
    .get(appointmentCtrl.getAvailableSlots)
    .post(appointmentCtrl.addTeleAppointment)

router.route('/my')
    .get(appointmentCtrl.getMyAppointments)

router.route('/my/:appointmentId')
    .delete(appointmentCtrl.removeAppointment)

router.route('/docs')
    .get(appointmentCtrl.getAvailableDocs)

router.route('/slots')
    .get([tokenValidator.detectToken, middlware_hasScopeAdmin], appointmentCtrl.adminGetTeleSlots)
    .post([tokenValidator.detectToken, middlware_hasScopeAdmin], appointmentCtrl.adminAddTeleSlot)
    .put([tokenValidator.detectToken, middlware_hasScopeAdmin], appointmentCtrl.adminUpdateTeleSlot)

router.route('/slots/:slotId')
    .delete([tokenValidator.detectToken, middlware_hasScopeAdmin], appointmentCtrl.removeAdminTeleSlot)


module.exports = router;