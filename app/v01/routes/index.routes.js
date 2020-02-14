var express  = require('express');
const config = require('../../config/config');
var router = express.Router();

var authRoutes = require('./auth.route');
var profileRoutes = require('./profile.route');
var teamRoutes = require('./team.route');

const tokenValidator = require('../controllers/tokenvalidate.controller');


router.use('/hb', function (req, res){
    res.json({"response": "healthy", "cfg" : config.env})
});

router.use('/auth', authRoutes);

router.use('/profile', [tokenValidator.verifyToken], profileRoutes);

// static content:

router.use('/team', teamRoutes);

module.exports = router; 
