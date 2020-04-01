var jwt = require('jsonwebtoken');
var ObjectID = require('mongodb').ObjectID;
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

        if (decoded.appointmentId){
          req.appointmentId = decoded.appointmentId;
        }
        

        next();

        });
    }else{
        res.send(403, { auth: false, message: 'No token provided.' });
    }
   
  
  }

// difference: let all requests pass and decode token for the requests where token exists
// include: guest requests and mark them as such 
  function detectToken(req, res, next) {

    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    let guestUserEmail = req.headers['x-guest-user-email'];
   

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
    }else if (guestUserEmail){

      let guestUserName = req.headers['x-guest-user-name'];

      req.flagGuest = true;
      req.guestObject = {
        userName : guestUserEmail,
        userEmail : guestUserEmail,
        name : guestUserName
      }
      next();
    }    
    else{
      req.userId = null;
      req.flagGuest = false;
      req.flagAnonymous = true;
      next();
    }

  }

  async function HasUserVerifiedEmail (req, res, next){
    
    let flagValidUserIdAsBSON = false;

    if (req.userId){
      try{
        ObjectID(req.userId)
        flagValidUserIdAsBSON = true;
      }catch(err){
      }
    }

    if (flagValidUserIdAsBSON){
      let userId = req.userId;
      let userObj = await authCtrl.getUserById(userId);
      if (userObj.validated){
        next();
      }else{
        return res.send(412, { auth: false, message: 'Die eMail wurde nicht verifiziert.' });  
      }
    }else {
      next();
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