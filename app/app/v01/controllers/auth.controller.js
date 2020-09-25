const crypto = require('crypto');
const config = require('../../config/config');
var jwt = require('jsonwebtoken'); 
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var bcrypt = require('bcrypt');
var emailerCtrl = require('./emailer.controller');
const logger = require('../../../logger');

var MongoUrl = config.getMongoUrl();

async function login(req, res){

    var userName = req.body.userName;
    var password = req.body.password;

    if (!password || !userName){
        return res.status(403).send({ auth: false, message: 'Please provide both user-ID and password.' });
    }

    userName = userName.toString().toLowerCase();

    let logUserName = userName.substring(0,userName.indexOf("@")) + "@*******.XX";

    try{

         let userObj = await getUserByName(userName).catch(err => {
            logger.warn(`"Either username or password invalid" ${logUserName}`)
            res.status(403).send("Either username or password invalid"); 
            return; 
         });

         if (!userObj){
            logger.warn(`"Either username or password invalid" ${logUserName}`)
            res.status(403).send("Either username or password invalid"); 
            return;       
        }

        if(bcrypt.compareSync(password, userObj.passPhrase)) {

            let resp = userObj; 

            if (!userObj.validated){
                logger.warn(`Please verify your account first. ${logUserName}`)
                return res.status(425).send("Please verify your account first."); 
            }

            delete resp.passPhrase;

            var token = jwt.sign(resp, config.auth.jwtsec, {
                expiresIn: config.auth.expiresIn
            });

            resp.token = token;

            res.json({"data" : resp});
        }else{
            logger.warn(`Either username or password invalid. ${logUserName}`)
            res.status(403).send("Either username or password invalid");            
        }

    }catch(error){
        logger.error(`Something went wrong logging in: ${logUserName}`)
        logger.error(error);
        res.status(403).send("Something went wrong logging in.");
    }

}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validatePassphrase(pass){
    var mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{8,})");
    return mediumRegex.test(pass)
}

async function registerUser ( req, res ){

    try{
        let userName = req.body.userName;
        let pass = req.body.password;
        let logUserName = userName.substring(0,userName.indexOf("@")) + "@*******.XX";
    
        if (!validateEmail(userName)){
            logger.warn(`Please provide a valid email as a userName ${logUserName}`)
            res.status(406).send("Please provide a valid email as a userName");
            return;
        }
    
        if (!validatePassphrase(pass)){
            res.status(406).send("Please provide a strong passphrase (at least length=8 and special characters)");
            return;
        }

        userName = userName.toString().toLowerCase();
    
        var salt = bcrypt.genSaltSync(10);
        let passPhrase = bcrypt.hashSync(pass, salt);
    
        // all users coming here need to have accepted the basic terms, hence only the date will be stored for accepting
        let newUser = {
            "userName" : userName, 
            "passPhrase" : passPhrase, 
            "name" : req.body.name || null,
            "birthdate" : new Date(req.body.birthdate) || null,
            "validated" : false, 
            "acceptTerms" : new Date(), 
            "acceptInfoHistory" : [
                {
                    "acceptInfo" : req.body.acceptInfo || false, 
                    "timestamp" : new Date()
                }
            ],
            "notifications" : {
                "reminderCheckups" : req.body.acceptInfo || false, 
                "reminderVaccination" : req.body.acceptInfo || false, 
                "newsletter" : req.body.acceptInfo || false, 
                "reminderAppointments" : true
            }
        };
    
        let userObj = await getUserByName(userName);
    
        if (userObj){
            logger.info(`User cannot be created - already exists for user: ${logUserName}`);
            res.status(409).send("User cannot be created. Already exists");
            return;
        }
    
        MongoClient.connect(MongoUrl, function(err, db) {
      
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
    
            // Get the documents collection
            const collection = dbo.collection('users');
            
            collection.insertOne(
                newUser,
              async function(err, u){
    
                let resultUserObj = await getUserByName(userName);
    
                let resp = resultUserObj; 
    
                delete resp.passPhrase;
    
                res.json({"data" : resp});
    
                _sendAccountValidationEmail(resp._id, resp.userName);
    
              });
            
          });
    }catch(err){
        logger.error(err);
    }
}


async function adminRegisterUser(req, res){

    try{

        let userName = req.body.userName;

        if (!validateEmail(userName)){
            res.status(406).send("Please provide a valid email as a userName");
            return;
        }


        let passPhrase = "non-password-admin-preregister"; 

        let newUser = {
            "userName" : userName, 
            "passPhrase" : passPhrase, 
            "validated" : false,
            "notifications" : {
                "reminderCheckups" : true, 
                "reminderVaccination" : true, 
                "newsletter" : true, 
                "reminderAppointments" : true
            }
        };

        let userObj = await getUserByName(userName).catch(err=>{
            throw err;
        });

        if (userObj){
            res.status(409).send("User cannot be created. Already exists");
            return;
        }

        MongoClient.connect(MongoUrl, function(err, db) {
    
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);

            // Get the documents collection
            const collection = dbo.collection('users');
            
            collection.insertOne(
                newUser,
            async function(err, u){

                res.json({"message" : "OK"});

                let resultUserObj = await getUserByName(userName).catch(err=>{
                    throw err;
                });

                let resp = resultUserObj;
                _sendAccountPreRegistrationEmail(resp._id, resp.userName);

            });
            
        });

    }catch(err){
        logger.error(err);
    }

}

async function getUserByName(userName){
    return new Promise ((resolve, reject) => {

        try{

            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);

                // Get the documents collection
                const collection = dbo.collection('users');
                
                collection.findOne(
                    {"userName" : userName.toLowerCase()},
                function(err, u){
                    if (err){
                        reject(err);
                    }
                    if (u){
                        resolve(u);
                    }else{
                        resolve(false);
                    }
                
                });
                
            });
        }catch(err){
            reject(err);
        }
    })

}


/**
 * Function to get users with a specific scope
 * @param {String/Array} scopes that a user needs to have, at least one of them
 */
function getUsersByScope(scopes){

    let scopesArray = [];

    if (Array.isArray(scopes)){
        scopes.forEach(element => {
            scopesArray.push(element.toLowerCase());
        });
    }else{
        scopesArray = [String(scopes).toLowerCase()];
    }


    return new Promise ((resolve, reject) => {

        try{

            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);

                // Get the documents collection
                const collection = dbo.collection('users');
                
                collection.find(
                    {scopes : {"$in" : scopesArray}},
                    {"passPhrase" : 0}
                ).toArray(
                function(err, u){
                    if (err){
                        reject(err);
                    }
                    if (u){
                        resolve(u);
                    }else{
                        resolve(false);
                    }
                
                });
                
            });
        }catch(err){
            reject(err);
        }
    })

}

/**
 * Retrieve a single user by Id
 * @param {*} _id userId in string format  
 */
async function getUserById(_id){
    return new Promise ((resolve, reject) => {
        try{
                
            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);

                // Get the documents collection
                const collection = dbo.collection('users');
                
                collection.findOne(
                    {"_id" : ObjectID(_id)},
                function(err, u){
                    if (err){
                        reject(err);
                    }
                    if (u){
                        resolve(u);
                    }else{
                        resolve(false);
                    }
                
                });
                
            });
        }catch(err){
            reject(err);
        }
    })
}
/**
 * Function to get array of users based on their IDs
 * @param {*} _idArray array containing ObjectIds (BSON formated)
 */
async function getManyUsersById(_idArray){
    return new Promise ((resolve, reject) => {
        try{
                
            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);

                // Get the documents collection
                const collection = dbo.collection('users');

                collection.find(
                    {"_id" : { $in : _idArray }}).toArray(
                    function(err, u){
                        if (err){
                            reject(err);
                        }
                        if (u){
                            resolve(u);
                        }else{
                            resolve(false);
                        }
                    
                });
                
            });
        }catch(err){
            reject(err);
        }
    })
}


async function executeAccountValidation(_id){
    return new Promise ((resolve, reject) => {
        MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
    
            // Get the documents collection
            const collection = dbo.collection('users');
            
            collection.updateOne(
                {"_id" : ObjectID(_id)},
                {$set : {validated : true, acceptTerms : new Date() }},
              function(err, u){
                if (err){
                    reject(err);
                }
                if (u){
                    resolve(u);
                }else{
                    resolve(false);
                }
               
              });
            
          });
    });
} 

async function validateUserScope(userId, scope){
    let user = await getUserById(userId);

    if (typeof(user.scopes) == "undefined"){
        return false;
    }else{

        if (Array.isArray(scope)){
            let flagHasScope = false;
            scope.forEach(element => {
                if (user.scopes.indexOf(element) != -1){
                    flagHasScope = true;
                }
            });
            return flagHasScope; 
        }else if (typeof scope === 'string' || scope instanceof String){
            if (user.scopes.indexOf(scope) != -1){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

}

function _sendAccountForgotPasswordEmail (_id, userName){
    return new Promise((resolve, reject) => {

        try{
            let data = {
                "_id" : _id
            };
        
            var token = jwt.sign(data, config.auth.jwtsec, {
                expiresIn: 86400000
            });
        
            let urlBase;
    
            if (config.env == "development"){
                urlBase = config.hostProto + "://" + config.hostBase + ":" + config.hostExposedPort  + "/passreset?token=";
            }else{
                urlBase = config.hostProto + "://" + config.hostBase + "/passreset?token=";
            }
    
            let tokenUrl = encodeURI(urlBase + token); 
        
            emailerCtrl.sendForgotPasswordEmail(userName, tokenUrl).then(result => {
                resolve(true)
            }).catch(err =>{
                reject(false);
            })
        }catch(err){
            logger.error(err);
        }
        
    })
}

function _sendPasswordWasResetEmail (userName){
    return new Promise((resolve, reject) => {

        try{
            let contextObj = {
                "userName" : userName
            }
    
            emailerCtrl.sendPasswordWasResetEmail(contextObj).then(result => {
                resolve(true)
            }).catch(err =>{
                reject(false);
            })
        }catch(err){
            logger.error(err);
        }
       
    })
}

function _sendAccountValidationEmail (_id, userName){
    return new Promise((resolve, reject) => {

        try{
            let data = {
                "_id" : _id
            };
        
            var token = jwt.sign(data, config.auth.jwtsec, {
                expiresIn: 86400000
            });
        
            let urlBase;
    
            if (config.env == "development"){
                urlBase = config.hostProto + "://" + config.hostBase + ":" + config.hostExposedPort  + "/web/validateAccount?token=";
            }else{
                urlBase = config.hostProto + "://" + config.hostBase + "/web/validateAccount?token=";
            }
    
            let tokenUrl = encodeURI(urlBase + token); 
        
            emailerCtrl.sendValidateAccountEmail(userName, tokenUrl).then(result => {
                resolve(true)
            }).catch(err =>{
                reject(false);
            })
        }catch(err){
            logger.error(err);
        }
        
    })
}

function _sendAccountPreRegistrationEmail (_id, userName){
    return new Promise((resolve, reject) => {

        try{
            let data = {
                "_id" : _id, 
                "flagPreRegister" : true
            };
        
            var token = jwt.sign(data, config.auth.jwtsec, {
                expiresIn: 86400000
            });
        
            let urlBase;
    
            if (config.env == "development"){
                urlBase = config.hostProto + "://" + config.hostBase + ":" + config.hostExposedPort  + "/passreset?token=";
            }else{
                urlBase = config.hostProto + "://" + config.hostBase + "/passreset?token=";
            }
    
            let tokenUrl = encodeURI(urlBase + token); 
        
            emailerCtrl.sendPreRegistrationEmail(userName, tokenUrl).then(result => {
                resolve(true)
            }).catch(err =>{
                reject(false);
            })
        }catch(err){
            logger.error(err);
        }
       
    })
}


async function userIssueAccountValidationEmail (req, res){

    let userId = req.userId;
    let userObj = await getUserById(userId);

    if (userObj){
        _sendAccountValidationEmail(userId, userObj.userName).then (result => {
            res.json({"message" : "OK - message sent"});
        }).catch(err => {
            logger.error(err);
            res.send(500, "Email could not be sent.");
        })
    }else{
        res.send(404, "User not found.");
    }
}

async function userIssueForgotPasswordEmail (req, res){

    let userName = req.body.userName;
    let userObj = await getUserByName(userName);

    if (userObj){
        let userId = String(userObj._id);
        _sendAccountForgotPasswordEmail(userId, userObj.userName).then (result => {
            res.json({"message" : "OK - message sent"});
        }).catch(err => {
            logger.error(err);
            res.send(500, "Email could not be sent.");
        })
    }else{
        logger.info("Reset password, user not found for: " + userName);
        res.json({"message" : "OK"});
    }
}


async function resetUserPassword (req, res){

    try{

        let userId = req.userId;
        let pass = req.body.password; 
        let userObj = await getUserById(userId);
        
        if (!validatePassphrase(pass)){
            res.send(406, "Please provide a strong passphrase (at least length=8 and special characters)");
            return;
        }

        if (!userObj._id){
            res.send(404, "Invalid user");
            return;
        }

        var salt = bcrypt.genSaltSync(10);
        let passPhrase = bcrypt.hashSync(pass, salt);

        MongoClient.connect(MongoUrl, function(err, db) {
    
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);

            // Get the documents collection
            const collection = dbo.collection('users');
            
            collection.updateOne(
                {"_id" : ObjectID(userObj._id)},
                {$set : {passPhrase : passPhrase, validated : true}},
            function(err, u){
                if (err || !u){
                    console.error(err);
                    res.send(500, "Error - password could not be reset.");
                }
                if (u){
                    res.json({"message" : "OK"});

                    _sendPasswordWasResetEmail(userObj.userName).then(() => {

                    }).catch(err => {
                        throw err;
                    })
                }
            
            });
            
        });

    }catch(error){
        logger.error(error);
        res.send(403, "Something went wrong resetting the password.");
    }iimm


}

function getUsers(req, res){
    try{
      
        MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
 
            const collection = dbo.collection('users');
 
            collection.find({}).toArray(function(error, result){
                if (error){
                    throw error;
                }

                result.forEach(element => {
                    delete element.passPhrase;
                });

                res.json(result)
            });
                
          });
 
    }catch(error){
        logger.error(error);
        res.send(403, "Something went wrong getting the users.");
    }
}

function updateUser(req, res){
    try{

        
        let targetUser = req.body;
        let targetUserId = targetUser._id;

        if (targetUser._id){
            delete targetUser._id;
        }else{
            res.send(500, "No userID found in request.");
        }
      
        MongoClient.connect(MongoUrl, function(err, db) {
 
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
 
            const collection = dbo.collection('users');
 
            collection.updateOne(
                {
                    "_id" : ObjectID(targetUserId)
                }, 
                {
                    $set: targetUser
                },
                function(err, docs){
                    if (err){
                        throw err;
                    }
                    res.json({"message" : "ok"});
                }
            );
                
          });
 
    }catch(error){
        logger.error(error);
        res.send(403, "Something went wrong getting the users.");
    }
}

function removeUser(req, res){

    try{

        var targetUserId = req.params.targetUserId;
        
        MongoClient.connect(MongoUrl, function(err, db) {
    
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
    
            const collection = dbo.collection('users');
    
            collection.deleteOne(
                {
                    "_id" : ObjectID(targetUserId)
                },
                function(err, result){
                if (err) throw err;
                res.json({"success" : true});
                });
            });

    }catch(err){
        logger.error(error)
        res.send(500, "An error occured deleting the user: " + targetUserId );
    }

}


module.exports = { 
    login, 
    registerUser, 
    adminRegisterUser,
    removeUser,
    executeAccountValidation, 
    userIssueAccountValidationEmail, 
    validateUserScope, 
    getUsers, 
    updateUser, 
    resetUserPassword, 
    userIssueAccountValidationEmail,
    userIssueForgotPasswordEmail, 

    getManyUsersById, 
    getUserById,
    getUserByName, 
    getUsersByScope
    }