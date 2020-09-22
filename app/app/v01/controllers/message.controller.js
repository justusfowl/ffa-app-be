const config = require('../../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var MongoUrl = config.getMongoUrl();

var emailerCtrl = require('./emailer.controller');
var timesCtrl = require('./times.controller');
var authCtrl = require('./auth.controller');

const logger = require('../../../logger');

const cryptoSrv = require('../crypto/crypto');

async function handleGeneralMessage (req, res){

    try{
        let messageObj = req.body; 
        let userName = messageObj.name;
        let email = messageObj.email; 
        let message = messageObj.message;

        if (!userName || !email || !message || message.length == 0){

            return res.send(500, "Please provide a valid message");
        }

        let contextObject = {
            userName : userName, 
            messageText : message, 
            userEmail : email
        };

        let isVacationObj = await timesCtrl.getIsCurrentlyVacation().catch(err => {
            throw err;
        });

        let emailSent = await emailerCtrl.sendMessageToBackOffice(contextObject).catch(err => {
            throw err;
        });

        if (isVacationObj.isVacation){
            await emailerCtrl.sendVacationAutoReply(userName, email, message, isVacationObj.vacationObj).then(result => {
                res.json({"message" : "OK"})
            }).catch(err =>{
                res.send(500, "An error occured sending a message: " + JSON.stringify(err) );
            });
        }else{
            await emailerCtrl.sendGeneralAutoReply(userName, email, message).then(result => {
                res.json({"message" : "OK"})
            }).catch(err =>{
                res.send(500, "An error occured sending a message: " + JSON.stringify(err) );
            });
        }

    }catch(err){
        logger.error(err);
        res.send(500, "An error occured sending a message." );
    }

}

function encryptMedication(medicationObject){

    medicationObject.name = cryptoSrv.encrypt(medicationObject.name);
    medicationObject.amount = cryptoSrv.encrypt(medicationObject.amount);
    medicationObject.substance = cryptoSrv.encrypt(medicationObject.substance);
    medicationObject.dose = cryptoSrv.encrypt(medicationObject.dose);
    medicationObject.pzn = cryptoSrv.encrypt(medicationObject.pzn);
    medicationObject.dosageform = cryptoSrv.encrypt(medicationObject.dosageform);

    return medicationObject;
}

function decryptMedication(medicationObject){
    
    medicationObject.name = cryptoSrv.decrypt(medicationObject.name);
    medicationObject.amount = cryptoSrv.decrypt(medicationObject.amount);
    medicationObject.substance = cryptoSrv.decrypt(medicationObject.substance);
    medicationObject.dose = cryptoSrv.decrypt(medicationObject.dose);
    medicationObject.pzn = cryptoSrv.decrypt(medicationObject.pzn);
    medicationObject.dosageform = cryptoSrv.decrypt(medicationObject.dosageform);

    return medicationObject;
}

async function handlePrescriptionMessage(req, res){
    try{
        let messageObj = req.body; 
        let userName = messageObj.name;
        let email = messageObj.email; 
        let medications = messageObj.medications;
        let deliveryType = messageObj.deliveryType; 
        let collectDrugStore = messageObj.collectDrugStore; 

        if (!userName || !email || !medications || medications.length == 0 || (deliveryType == 'drugstore' && collectDrugStore.length < 1)){
            return res.send(500, "Please provide a valid message");
        }

        let flagCollectFromPractice = false;
        if (deliveryType == 'collect'){
            flagCollectFromPractice = true;
        }

        let contextObject = {
            userName : userName, 
            medications : medications, 
            sendDate : new Date(),
            userEmail : email, 
            flagCollectFromPractice : flagCollectFromPractice, 
            collectDrugStore : collectDrugStore
        };

        let message = "Eingang | Ihre Rezeptvorbestellung";

        let userObj = await authCtrl.getUserByName(email).catch(err => {
            throw err;
        });

        if (userObj._id){

            let msgObj = JSON.parse(JSON.stringify(contextObject))
            msgObj["userId"] = userObj._id.toString();
            delete msgObj.userEmail;

            for (var i=0;i<msgObj.medications.length;i++){
                msgObj.medications[i] = encryptMedication(msgObj.medications[i])
            }

            storeMessage(msgObj).catch(err => {
                throw err;
            });
        };

        let isVacationObj = await timesCtrl.getIsCurrentlyVacation().catch(err => {
           throw err;
        });

        let emailSent = await emailerCtrl.sendMessageToBackOffice(contextObject).catch(err => {
           throw err;
        });

        if (isVacationObj.isVacation){
            let subject = "Eingang und Urlaubsnotiz | Wir haben Ihre Rezeptbestellung erhalten";
            await emailerCtrl.sendVacationAutoReply(userName, email, "", isVacationObj.vacationObj, medications, flagCollectFromPractice, collectDrugStore, subject).then(result => {
                res.json({"message" : "OK"});
            }).catch(err =>{
                throw err;
            });
        }else{
            let subject = "Eingang | Wir haben Ihre Rezeptbestellung erhalten";
            await emailerCtrl.sendGeneralAutoReply(userName, email, "", medications, flagCollectFromPractice, collectDrugStore, subject).then(result => {
                res.json({"message" : "OK"});
            }).catch(err =>{
                throw err;
            });
        }

    }catch(err){
        logger.error(err);
        res.send(500, "An error occured sending a message");
    }
}

function storeMessage(messageObject){
    return new Promise((resolve, reject) => {
        try{

            if (messageObject.sendDate){
                messageObject.sendDate = new Date(messageObject.sendDate);
            }

            if (messageObject.userName){
                messageObject.userName = cryptoSrv.encrypt(messageObject.userName);
            }

            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
        
                const collection = dbo.collection('messages');
        
                collection.insertOne(
                    messageObject,
                  function(err, result){
                    if (err){
                        reject(err);
                    }else{
                        resolve(true);
                    }
                    
                  });
              });
    
        }catch(err){
            reject(err);
        }
    })
}

function getMessagesByUserId(userId){
    return new Promise((resolve, reject) => {
        try{

            if (!userId){
                return reject(false);
            }

            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
        
                const collection = dbo.collection('messages');
        
                collection.find({userId : userId}).sort( { sendDate: -1 } ).toArray(function(err, result){
                    if (err){
                        reject(err);
                    }else{

                        result.forEach(msgObj => {
                            
                            if (msgObj.medications){
                                for (var i=0;i<msgObj.medications.length;i++){
                                    msgObj.medications[i] = decryptMedication(msgObj.medications[i])
                                }
                            }

                            if (msgObj.userName){
                                msgObj.userName = cryptoSrv.decrypt(msgObj.userName);
                            }

                        });

                        resolve(result);
                    }                    
                  });
              });
    
        }catch(err){
            reject(err);
        }
    })
}

async function getMyMessages(req, res){
    try{
        let userId = req.userId;
        let messages = await getMessagesByUserId(userId);

        res.json({"messages" : messages});
    }catch(err){
        logger.error(err);
        res.send(500, "An error occured acquiring myMessages." );
    }
}

async function cleanUserDataFromAccountRemove(userId){

    return new Promise((resolve, reject) => {
        try{
            MongoClient.connect(MongoUrl, function(err, db) {
    
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
        
                const collection = dbo.collection('messages');
        
                collection.updateMany(
                  {
                      "userId" : userId
                  },
                  {
                      $set : {
                          "userEmail" : "removed", 
                          "userName" : "removed"
                      }
                  },
                  function(err, result){
                    if (err){
                        reject(err);
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

async function setPrescriptionInfoToRemoved(userId, meetingId){

    return new Promise((resolve, reject) => {
        try{
            MongoClient.connect(MongoUrl, function(err, db) {
    
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
        
                const collection = dbo.collection('messages');
        
                collection.updateOne(
                  {
                      "_id" : ObjectID(meetingId.toString()), 
                      "userId" : userId,
                      "medications" : {
                          "$exists" : true
                      }
                  },
                  {
                      $set : { 
                          "removeDate" : new Date(),
                          "removed" : true,
                          "userName" : "",
                          "medications.$[].name" : "removed",
                          "medications.$[].amount" : "removed",
                          "medications.$[].substance" : "removed",
                          "medications.$[].dose" : "removed",
                          "medications.$[].pzn" : "removed",
                          "medications.$[].dosageform" : "removed",
                        }
                  },
                  function(err, result){
                    if (err){
                        reject(err);
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

async function handlePrescriptionMessageRemove(req, res){

    try{

        let messageId = req.params.messageId;
        let userId = req.userId;

        if (!messageId){
            throw new Error("No message Id provided.")
        }

        await setPrescriptionInfoToRemoved(userId, messageId);
        res.json({"message" : "OK"});

    }catch(err){
        logger.error(err);
        res.send(500, "An error occured sending a message");
    }

}

module.exports = {
    handleGeneralMessage,
    handlePrescriptionMessage,
    getMyMessages,
    cleanUserDataFromAccountRemove, 
    handlePrescriptionMessageRemove, 

    decryptMedication, 
    encryptMedication
}