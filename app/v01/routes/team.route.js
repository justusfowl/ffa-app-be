var express = require('express'); 
var router = express.Router();
var teamCtrl = require('../controllers/team.controller')

router.route('/')
    .get(teamCtrl.getTeam)

module.exports = router;