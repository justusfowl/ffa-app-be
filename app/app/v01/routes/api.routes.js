var express  = require('express');
const config = require('../../config/config');
var router = express.Router();

var authRoutes = require('./auth.route');
var profileRoutes = require('./profile.route');
var teamRoutes = require('./team.route');
var coachRoutes = require('./coach.route');
var newsRoutes = require('./news.route');
var timesRoutes = require('./times.route');
var messageRoutes= require('./message.routes');
var generalRoutes = require('./general.route');
var appointmentRoutes = require('./appointment.route');

const tokenValidator = require('../controllers/tokenvalidate.controller');

router.use('/hb', function (req, res){
    res.json({"response": "healthy", "cfg" : config.env})
});

router.use('/auth', authRoutes);

router.use('/profile', [tokenValidator.verifyToken], profileRoutes);

router.use('/coach', [tokenValidator.verifyToken], coachRoutes);

// static content:

router.use('/message', messageRoutes);

router.use('/team', teamRoutes);

router.use('/news', newsRoutes);

router.use('/times', timesRoutes);

router.use('/general', generalRoutes)

router.use('/appointment', [tokenValidator.verifyToken, tokenValidator.HasUserVerifiedEmail], appointmentRoutes)

module.exports = router; 
