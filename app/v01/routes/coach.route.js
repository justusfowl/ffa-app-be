var express = require('express'); 
var router = express.Router();
var coachCtrl = require('../controllers/coach.controller');

router.route('/sessions')
    .get(coachCtrl.getSessions)

router.route('/session/:sessionId')
    .get(coachCtrl.loadSession)

module.exports = router;