
const config = require('../../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var appointmentCtrl = require('./appointment.controller');
var messageCtrl = require('./message.controller');

var MongoUrl = config.getMongoUrl();

const logger = require('../../../logger');

/**
 * Function to update one's individual user
 * @param {*} req 
 * @param {*} res 
 */
function updateUser(req, res){

   let targetUserId = req.userId;

   let targetUser = req.body.user;
   
    // remove userId for update to work
   if (targetUser._id){
       delete targetUser._id;
   }

   // remove token if passed
   if (targetUser.token){
        delete targetUser.token;
    }

    // remove validated if passed, so that it is not overwritten
    if (typeof(targetUser.validated) != "undefined"){
        delete targetUser.validated;
    }

   // remove username, prevent changing of the email address
   if (targetUser.userName){
        delete targetUser.userName;
   }

   // remove scopes, prevent user changing of the scopes 
   if (targetUser.scopes){
        delete targetUser.scopes;
    }

    // do not allow modification of master data (e.g. accept terms date)
    if (targetUser.acceptTerms){
        delete targetUser.acceptTerms;
    }
    if (targetUser.acceptInfoHistory){
        delete targetUser.acceptInfoHistory;
    }

    if (Object.keys(targetUser).length == 0){
        res.json({"message" : "ok"});
        return;
    }
   
    try{

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
                   res.json({"message" : "ok"});
               }
           );
               
         });

   }catch(error){
       logger.error(error);
       res.send(403, "Something went wrong getting the users.");
   }

}

function removeProfile(userId){
    return new Promise (async (resolve, reject) => {
        try{
            MongoClient.connect(MongoUrl, function(err, db) {
      
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
     
                const collection = dbo.collection('users');
     
                collection.deleteOne(
                    {
                        "_id" : ObjectID(userId)
                    }, 
                    function(err, docs){
                        if (err){
                            reject(err);
                        }else{
                            resolve(docs);
                        }
                        
                    }
                );
                    
              });
     
        }catch(error){
            logger.error(error);
            res.send(403, "Something went wrong getting the users.");
        }
    })
}

async function deleteAccount(req, res){

    let targetUserId = req.userId;

    try{

        await appointmentCtrl.cleanUserDataFromAccountRemove(targetUserId).catch(err => {
            throw err;
        });
    
        await messageCtrl.cleanUserDataFromAccountRemove(targetUserId).catch(err => {
            throw err;
        });

        await removeProfile(targetUserId).catch(err => {
            throw err;
        });

        res.json({"message" : "ok"});

    }catch(err){
        logger.error(error);
        res.send(403, "Something went wrong removing the account the users.");
    } 
}

async function asyncGetUserProfile(userId){
    return new Promise ((resolve, reject) => {
        try{

            MongoClient.connect(MongoUrl, function(err, db) {
      
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
     
                const collection = dbo.collection('users');
     
                collection.findOne(
                    {
                        "_id" : ObjectID(userId)
                    },
                    function(err, user){
                        if (user){

                            if (user.passPhrase){
                                delete user.passPhrase;
                            }
                            
                            resolve(user);
                        }else{
                            reject("No user found with id: " + userId);
                        }
                    }
                );
                    
              });
     
        }catch(error){
            reject(error);
        }
    });
}

module.exports = { updateUser, deleteAccount, asyncGetUserProfile }