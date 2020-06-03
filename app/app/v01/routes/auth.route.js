var express = require('express'); 
var router = express.Router();

var authCtrl = require('../controllers/auth.controller');
const tokenValidator = require('../controllers/tokenvalidate.controller');

var middlware_hasScopeAdmin = tokenValidator.HasScope('admin');

router.route('/login')
    .post(authCtrl.login)

router.route('/register')
    .post(authCtrl.registerUser)
    
router.route('/adminRegisterUser')
    .post([tokenValidator.detectToken, middlware_hasScopeAdmin], authCtrl.adminRegisterUser)

router.route('/forgotPassword')
    .post(authCtrl.userIssueForgotPasswordEmail)

router.route('/getValidateEmail')
    .get([tokenValidator.verifyToken], authCtrl.userIssueAccountValidationEmail)

router.route('/passwordReset')
    .post([tokenValidator.detectToken], authCtrl.resetUserPassword)

router.route('/users')
    .get([tokenValidator.detectToken, middlware_hasScopeAdmin], authCtrl.getUsers)
    .put([tokenValidator.detectToken, middlware_hasScopeAdmin], authCtrl.updateUser)

router.route('/users/:targetUserId')
    .delete([tokenValidator.detectToken, middlware_hasScopeAdmin], authCtrl.removeUser)

module.exports = router;