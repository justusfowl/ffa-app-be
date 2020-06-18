var express = require('express'); 
var router = express.Router();

var deviceCtrl = require('../controllers/device.controller');
var playlistCtrl = require('../controllers/playlist.controller');
var tokenValidator = require('../controllers/tokenvalidate.controller');
var middlware_hasScopeAdminTv = tokenValidator.HasScope(['admin', 'tv']);

router.route('/')
    .get([tokenValidator.detectToken, middlware_hasScopeAdminTv], deviceCtrl.getDevices)

router.route('/:devideId')
    .put([tokenValidator.detectToken, middlware_hasScopeAdminTv], deviceCtrl.updateDevice)
    .delete([tokenValidator.detectToken, middlware_hasScopeAdminTv], deviceCtrl.removeDevice)

router.route('/playlist')
    .get([tokenValidator.detectToken, middlware_hasScopeAdminTv], playlistCtrl.getPlaylists)

router.route('/playlist/:playlistId')
    .put([tokenValidator.detectToken, middlware_hasScopeAdminTv], playlistCtrl.updatePlaylist)
    .delete([tokenValidator.detectToken, middlware_hasScopeAdminTv], playlistCtrl.removePlaylist)

module.exports = router;