var express = require('express'); 
var router = express.Router();
var uuid = require('uuid');

var multer = require('multer');
var fs = require("fs");
var config = require('../../config/config');
var path = require('path');

var generalCtrl = require('../controllers/general.controller');
var tokenValidator = require('../controllers/tokenvalidate.controller');
var middlware_hasScopeAdmin = tokenValidator.HasScope('admin');
var middlware_hasScopeAdminTV = tokenValidator.HasScope(['admin', 'tv']);

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let fsEndPoint = 'content/';
        req["fsEndPoint"] = fsEndPoint;
        let dir = path.join(config.baseDirectory, "pub/" + fsEndPoint);
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        cb(null, dir)
    },
    filename: function (req, file, cb) {
        const fileName = uuid.v1() + "." + file.mimetype.substring(file.mimetype.indexOf("/")+1, file.mimetype.length)
        cb(null, fileName) 
    }
})

var filterFunction = function (req, file, cb) {

    var allowedTypes = ["jpeg", "jpg", "mp4", "ogg", "png"];

    var mime = file.mimetype;

    var ext = mime.substring(mime.indexOf("/")+1, mime.length);
    ext = ext.toLowerCase();

    if (allowedTypes.indexOf(ext) > -1){
        cb(null, true)
    }else{
        cb(null, false)
    }   
  
  }

var upload = multer({ storage: storage, fileFilter : filterFunction });


/*
router.route('/test')
    .get(generalCtrl.testEmail)
*/

router.route('/settings')
    .get(generalCtrl.getSettings)

router.route('/settings/:settingsObjId')
    .put([tokenValidator.detectToken, middlware_hasScopeAdmin], generalCtrl.storeSettings)

router.route('/config')
    .get(generalCtrl.getConfig)

router.route('/config/:configObjId')
    .put([tokenValidator.detectToken, middlware_hasScopeAdmin], generalCtrl.storeConfig)

router.route('/content/tv')
    .post([tokenValidator.detectToken, middlware_hasScopeAdminTV, upload.single('file')], generalCtrl.uploadFile)

module.exports = router;