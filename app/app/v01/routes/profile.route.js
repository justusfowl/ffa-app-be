var express = require('express'); 
var router = express.Router();
var profileController = require('../controllers/profile.controller')

router.route('/user')
    .put(profileController.updateUser)

module.exports = router;