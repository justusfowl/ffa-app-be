var jwt = require('jsonwebtoken');
//var jwks = require('jwks-rsa');
const config = require('../../config/config');
var authCtrl = require('./auth.controller');

function verifyToken(req, res, next) {

    // check header or url parameters or post parameters for token

    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase



    if (token){

        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }
        // verifies secret
        jwt.verify(token, config.auth.jwtsec, function(err, decoded) {   
        if (err){
            if (err.name == "TokenExpiredError"){
                return res.send(440, { auth: false, message: 'Token expired.' });    
              }else{
                return res.send(401, { auth: false, message: 'Failed to authenticate token.' });    
              }
        }
            

        // if everything is good, save to request for use in other routes
        req.userId = decoded._id;

        next();

        });
    }else{
        res.send(403, { auth: false, message: 'No token provided.' });
    }
   
  
  }

// difference: let all requests pass and decode token for the requests where token exists
  function detectToken(req, res, next) {

    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase

    if (token){

      if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
      }
  
      // verifies secret
      jwt.verify(token, config.auth.jwtsec, function(err, decoded) {
        if (err){
          if (err.name == "TokenExpiredError"){
            return res.send(440, { auth: false, message: 'Token expired.' });    
          }
        }else{
          req.userId = decoded._id;
        }
          
        next();
  
      });
    }else{
      next();
    }

  }

  async function HasUserVerifiedEmail (req, res, next){
    
      let userId = req.userId;
      let userObj = await authCtrl.getUserById(userId);
      if (userObj.validated){
        next();
      }else{
        return res.send(412, { auth: false, message: 'Die eMail wurde nicht verifiziert.' });  
      }
    
  }

  function HasScope(scope) {
    return async function(req, res, next) {

      if (!req.userId){
        return res.send(403, { auth: false, message: 'No token provided.' });
      }
      let hasScope = await authCtrl.validateUserScope(req.userId, scope);
      if (!hasScope){
        return res.send(401, { auth: false, message: 'No privileges to access this ressource.' });    
      }else{
        next();
      }
     
    }

  }


module.exports = { verifyToken, detectToken, HasScope, HasUserVerifiedEmail} ;