var express  = require('express');
var router = express.Router();
const config = require('../../config/config');
var jwt = require('jsonwebtoken'); 
var authCtrl = require('../controllers/auth.controller');

router.get('/validateAccount', function(req, res, next) {

  let token = req.query.token;

  jwt.verify(token, config.auth.jwtsec, function(err, decoded) {   

        if (err){

            res.render('accountValidationError',{
                layout: 'accountValidationError'
            });

        }else{
            
            let userId = decoded._id;

            authCtrl.executeAccountValidation(userId).then(result => {
                res.render('accountValidated',{
                    layout: 'accountValidated'
                });
            }).catch(err => {
                res.render('accountValidationError',{
                    layout: 'accountValidationError'
                });
            });
           
        }

    });

});

router.get('/resetPassword', function(req, res, next) {

    let token = req.query.token;
  
    jwt.verify(token, config.auth.jwtsec, function(err, decoded) {   

        if (err){

            res.render('accountValidationError',{
                layout: 'accountValidationError'
            });

        }else{
            
            let userId = decoded._id;

            authCtrl.executeAccountValidation(userId).then(result => {
                res.render('passwordReset',{
                    layout: 'passwordReset'
                });
            }).catch(err => {
                res.render('accountValidationError',{
                    layout: 'accountValidationError'
                });
            });
           
        }

    });

});

module.exports = router