var express = require('express'); 
var router = express.Router();

var authCtrl = require('../controllers/auth.controller');
const tokenValidator = require('../controllers/tokenvalidate.controller');

router.route('/login')
    .post(authCtrl.login)

router.route('/register')
    .post(authCtrl.registerUser)

router.route('/getValidateEmail')
    .get([tokenValidator.verifyToken], authCtrl.userIssueAccountValidationEmail)

module.exports = router;