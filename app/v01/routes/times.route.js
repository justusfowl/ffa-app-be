var express = require('express'); 
var router = express.Router();
var timesCtrl = require('../controllers/times.controller')

router.route('/')
    .get(timesCtrl.getTimes)

module.exports = router;