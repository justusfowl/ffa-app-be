var express = require('express'); 
var router = express.Router();

var generalCtrl = require('../controllers/general.controller');
var tokenValidator = require('../controllers/tokenvalidate.controller');
var middlware_hasScopeAdmin = tokenValidator.HasScope('admin');


router.route('/test')
    .get(generalCtrl.test)


router.route('/settings')
    .get(generalCtrl.getSettings)

router.route('/settings/:settingsObjId')
    .put([tokenValidator.detectToken, middlware_hasScopeAdmin], generalCtrl.storeSettings)

module.exports = router;