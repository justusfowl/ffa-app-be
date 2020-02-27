var express = require('express'); 
var router = express.Router();
var newsCtrl = require('../controllers/news.controller');
var tokenValidator = require('../controllers/tokenvalidate.controller');
var multer = require('multer');
var fs = require("fs");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir = path.join(config.baseDirectory, 'pub/n/');
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
    .get([tokenValidator.detectToken], newsCtrl.getNews)
    .post([tokenValidator.detectToken, middlware_hasScopeAdmin, upload.single('file')], newsCtrl.newNews)

router.route('/:newsId')
    .get(newsCtrl.getNews)
    .put([tokenValidator.detectToken, middlware_hasScopeAdmin, upload.single('file')], newsCtrl.updateNews)

module.exports = router;