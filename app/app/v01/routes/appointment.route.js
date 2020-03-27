var express = require('express'); 
var router = express.Router();

var appointmentCtrl = require('../controllers/appointment.controller');

var tokenValidator = require('../controllers/tokenvalidate.controller');
var middlware_hasScopeAdmin = tokenValidator.HasScope('admin');

router.route('/new')
    .get(appointmentCtrl.getAvailableSlots)
    .post(appointmentCtrl.addTeleAppointment)

router.route('/my')
    .get(appointmentCtrl.getMyAppointments)

router.route('/my/:appointmentId')
    .delete(appointmentCtrl.removeAppointment)

router.route('/docs')
    .get(appointmentCtrl.getAvailableDocs)


module.exports = router;