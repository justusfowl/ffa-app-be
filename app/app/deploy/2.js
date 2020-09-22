
const config = require('../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var cryptoSrv = require('../v01/crypto/crypto');
var MongoUrl = config.getMongoUrl();

const logger = require('../../logger');

const messageCtrl = require('../v01/controllers/message.controller');

function getMessages(){
    return new Promise((resolve, reject) => {
        try{
            MongoClient.connect(MongoUrl, function(err, db) {
      
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
     
                const collection = dbo.collection('messages');
    
                collection.find({}).toArray(function(error, result){

                    if (error){
                        reject(error);
                    }else{
                        resolve(result);
                    }
    
                });
    
            });
        }catch(err){
            reject(err);
        }
    })
}

function storeMessage(messageObj){
    return new Promise((resolve, reject) => {
        try{

            let id = messageObj._id.toString();

            delete messageObj._id;

            MongoClient.connect(MongoUrl, function(err, db) {
      
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
     
                const collection = dbo.collection('messages');

                let filterObj = {_id : ObjectID(id)}
    
                collection.updateOne(filterObj, {$set : messageObj}, function(error, result){

                    if (error){
                        reject(error);
                    }else{
                        resolve(result);
                    }
    
                });
    
            });
        }catch(err){
            reject(err);
        }
    })
}

async function init(){    

    try{

        let messages = await getMessages();

        for (var i=0;i<messages.length; i++){
            let messageObj = messages[i];
            if (messageObj.medications){

                for (var j=0;j<messageObj.medications.length;j++){
                    messageObj.medications[j] = messageCtrl.encryptMedication(messageObj.medications[j]);
                }
            }

            if (messageObj.userName){
                messageObj.userName = cryptoSrv.encrypt(messageObj.userName);
            }

            await storeMessage(messageObj);
        }

    }catch(err){
        logger.error(err);
    }
    
}

// Description: Encrypting the fields of the medications requested by the patient

module.exports = {
    init
}