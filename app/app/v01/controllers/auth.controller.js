const crypto = require('crypto');
const config = require('../../config/config');
var jwt = require('jsonwebtoken'); 
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var bcrypt = require('bcryptjs');
var emailerCtrl = require('./emailer.controller');

var MongoUrl = config.getMongoUrl();

async function login(req, res){

    var userName = req.body.userName;
    var password = req.body.password;

    if (!password || !userName){
        return res.status(403).send({ auth: false, message: 'Please provide both user-ID and password.' });
    }

    try{

         let userObj = await getUserByName(userName).catch(err => {
            res.send(403, "Either username or password invalid"); 
            return; 
         });

         if (!userObj){
            res.send(403, "Either username or password invalid"); 
            return;       
        }

        // let passPhrase = crypto.createHash('sha256').update(password).digest("hex");

        if(bcrypt.compareSync(password, userObj.passPhrase)) {

            let resp = userObj; 

            delete resp.passPhrase;

            var token = jwt.sign(resp, config.auth.jwtsec, {
                expiresIn: config.auth.expiresIn
            });

            resp.token = token;

            res.json({"data" : resp});
        }else{
            res.send(403, "Either username or password invalid");            
        }

    }catch(error){
        console.error(error.stack);
        res.send(403, "Something went wrong logging in.");
    }

}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validatePassphrase(pass){
    var mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
    return mediumRegex.test(pass)
}

async function registerUser ( req, res ){

    let userName = req.body.userName;
    let pass = req.body.password;

    if (!validateEmail(userName)){
        res.send(406, "Please provide a valid email as a userName");
        return;
    }

    if (!validatePassphrase(pass)){
        res.send(406, "Please provide a strong passphrase (at least length=8 and special characters)");
        return;
    }

    let passPhrase = bcrypt.hashSync(pass); // crypto.createHash('md5').update(pass).digest("hex");

    let newUser = {
        "userName" : userName, 
        "passPhrase" : passPhrase, 
        "validated" : false
    };

    let userObj = await getUserByName(userName);

    if (userObj){
        res.send(409, "User cannot be created. Already exists");
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

            var token = jwt.sign(resp, config.auth.jwtsec, {
                expiresIn: config.auth.expiresIn
            });

            resp.token = token;

            res.json({"data" : resp});

            _sendAccountValidationEmail(resp._id, resp.userName);

          });
        
      });

}


async function adminRegisterUser(req, res){
    
    let userName = req.body.userName;

    if (!validateEmail(userName)){
        res.send(406, "Please provide a valid email as a userName");
        return;
    }


    let passPhrase = "non-password-admin-preregister"; 

    let newUser = {
        "userName" : userName, 
        "passPhrase" : passPhrase, 
        "validated" : false
    };

    let userObj = await getUserByName(userName);

    if (userObj){
        res.send(409, "User cannot be created. Already exists");
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

            let resultUserObj = await getUserByName(userName);

            let resp = resultUserObj;
            _sendAccountPreRegistrationEmail(resp._id, resp.userName);

          });
        
      });

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


async function executeAccountValidation(_id){
    return new Promise ((resolve, reject) => {
        MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
    
            // Get the documents collection
            const collection = dbo.collection('users');
            
            collection.updateOne(
                {"_id" : ObjectID(_id)},
                {$set : {validated : true}},
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
        if (user.scopes.indexOf(scope) != -1){
            return true;
        }else{
            return false;
        }
    }

}

function _sendAccountForgotPasswordEmail (_id, userName){
    return new Promise((resolve, reject) => {

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
    })
}

function _sendPasswordWasResetEmail (userName){
    return new Promise((resolve, reject) => {

        let contextObj = {
            "userName" : userName
        }

        emailerCtrl.sendPasswordWasResetEmail(contextObj).then(result => {
            resolve(true)
        }).catch(err =>{
            reject(false);
        })
    })
}

function _sendAccountValidationEmail (_id, userName){
    return new Promise((resolve, reject) => {

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
    })
}

function _sendAccountPreRegistrationEmail (_id, userName){
    return new Promise((resolve, reject) => {

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
    })
}


async function userIssueAccountValidationEmail (req, res){

    let userId = req.userId;
    let userObj = await getUserById(userId);

    if (userObj){
        _sendAccountValidationEmail(userId, userObj.userName).then (result => {
            res.json({"message" : "OK - message sent"});
        }).catch(err => {
            console.error(err);
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
        let userId = userObj.userId;
        _sendAccountForgotPasswordEmail(userId, userObj.userName).then (result => {
            res.json({"message" : "OK - message sent"});
        }).catch(err => {
            console.error(err);
            res.send(500, "Email could not be sent.");
        })
    }else{
        console.log("Reset password, user not found for: " + userName);
        res.json({"message" : "OK"});
        //res.send(404, "User not found.");
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

        let passPhrase = bcrypt.hashSync(pass);


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
        console.error(error.stack);
        res.send(403, "Something went wrong resetting the password.");
    }


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
        console.error(error.stack);
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
        console.error(error.stack);
        res.send(403, "Something went wrong getting the users.");
    }
}


module.exports = { 
    login, 
    registerUser, 
    adminRegisterUser,
    executeAccountValidation, 
    userIssueAccountValidationEmail, 
    validateUserScope, 
    getUsers, 
    updateUser, 
    resetUserPassword, 
    userIssueAccountValidationEmail,
    userIssueForgotPasswordEmail }