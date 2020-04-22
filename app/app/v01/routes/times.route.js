var express = require('express'); 
var router = express.Router();
var timesCtrl = require('../controllers/times.controller')
var tokenValidator = require('../controllers/tokenvalidate.controller');
var middlware_hasScopeAdmin = tokenValidator.HasScope('admin');


router.route('/')
    .get(timesCtrl.getTimes)

router.route('/open')
    .put([tokenValidator.detectToken, middlware_hasScopeAdmin], timesCtrl.updateOpenDay)

router.route('/vacation')
    .put([tokenValidator.detectToken, middlware_hasScopeAdmin], timesCtrl.upsertVacation)

router.route('/vacation/:vacationId')
    .delete([tokenValidator.detectToken, middlware_hasScopeAdmin], timesCtrl.removeVacation)

router.route('/holidays')
    .post([tokenValidator.detectToken, middlware_hasScopeAdmin], timesCtrl.syncPublicHolidays)

module.exports = router;