var express = require('express'); 
var router = express.Router();

var deviceCtrl = require('../controllers/device.controller');
var playlistCtrl = require('../controllers/playlist.controller');
var tokenValidator = require('../controllers/tokenvalidate.controller');
var middlware_hasScopeAdmin = tokenValidator.HasScope('admin');

router.route('/')
    .get([tokenValidator.detectToken, middlware_hasScopeAdmin], deviceCtrl.getDevices)

router.route('/:devideId')
    .put([tokenValidator.detectToken, middlware_hasScopeAdmin], deviceCtrl.updateDevice)
    .delete([tokenValidator.detectToken, middlware_hasScopeAdmin], deviceCtrl.removeDevice)

router.route('/playlist')
    .get([tokenValidator.detectToken, middlware_hasScopeAdmin], playlistCtrl.getPlaylists)

router.route('/playlist/:playlistId')
    .put([tokenValidator.detectToken, middlware_hasScopeAdmin], playlistCtrl.updatePlaylist)
    .delete([tokenValidator.detectToken, middlware_hasScopeAdmin], playlistCtrl.removePlaylist)

module.exports = router;