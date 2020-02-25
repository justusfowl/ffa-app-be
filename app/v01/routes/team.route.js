var express = require('express'); 
var router = express.Router();
var teamCtrl = require('../controllers/team.controller');
var tokenValidator = require('../controllers/tokenvalidate.controller');
var multer = require('multer');
var fs = require("fs");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = 'pub/a/';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        cb(null, dir)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) 
    }
})

var upload = multer({ storage: storage });

var middlware_hasScopeAdmin = tokenValidator.HasScope('admin');

router.route('/')
    .get(teamCtrl.getTeam)
    .post([tokenValidator.detectToken, middlware_hasScopeAdmin, upload.single('file')], teamCtrl.addMember)
    

router.route('/:memberId')
    .put([tokenValidator.detectToken, middlware_hasScopeAdmin], teamCtrl.updateMember)
    .delete([tokenValidator.detectToken, middlware_hasScopeAdmin], teamCtrl.removeTeam)

module.exports = router;