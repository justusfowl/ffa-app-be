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

        let userObj = await authCtrl.getUserByName(email);

        let flagHasAccount = false;

        if (userObj._id){
            contextObject["userId"] = userObj._id.toString();
            flagHasAccount = true;
        };

        for (var i=0;i<contextObject.medications.length;i++){
            contextObject.medications[i] = encryptMedication(contextObject.medications[i])
        }

        let msgObjResult = await storeMessage(contextObject);
        contextObject["_id"] = msgObjResult._id.toString();

        let messageId = msgObjResult._id.toString();

        let isVacationObj = await timesCtrl.getIsCurrentlyVacation();

        let adminMessageUrl;

        if (config.env == "development"){
            adminMessageUrl = config.hostProto + "://" + config.hostBase + ":" + config.hostExposedPort  + `/requests?tab=rezeptanfragen&messageId=${messageId}`;
        }else{
            adminMessageUrl = config.hostProto + "://" + config.hostBase + `/requests?tab=rezeptanfragen&messageId=${messageId}`;
        }

        adminMessageUrl = encodeURI(adminMessageUrl); 

        contextObject["messageUrl"] = adminMessageUrl;

        let emailSent = await emailerCtrl.sendMessageToBackOffice(contextObject);

        if (isVacationObj.isVacation){
            let subject = "Eingang und Urlaubsnotiz | Wir haben Ihre Rezeptbestellung erhalten";
            await emailerCtrl.sendVacationAutoReply(userName, email, "", isVacationObj.vacationObj, flagCollectFromPractice, collectDrugStore, subject, true, messageId, flagHasAccount).then(result => {
                res.json({"message" : "OK"});
            });
        }else{
            let subject = "Eingang | Wir haben Ihre Rezeptbestellung erhalten";
            await emailerCtrl.sendGeneralAutoReply(userName, email, "", true, flagCollectFromPractice, collectDrugStore, subject, messageId, flagHasAccount).then(result => {
                res.json({"message" : "OK"});
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

            let newMessageObj = JSON.parse(JSON.stringify(messageObject));

            newMessageObj["status"] = 0;

            if (newMessageObj.sendDate){
                newMessageObj.sendDate = new Date(newMessageObj.sendDate);
            }

            if (newMessageObj.userName){
                newMessageObj.userName = cryptoSrv.encrypt(newMessageObj.userName);
            }

            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
        
                const collection = dbo.collection('messages');
        
                collection.insertOne(
                    newMessageObj,
                  function(err, result){
                    if (err){
                        reject(err);
                    }else{
                        messageObject["_id"] = result.insertedId.toString();
                        resolve(messageObject);
                    }
                  });
              });
    
        }catch(err){
            reject(err);
        }
    })
}


/**
 * Function to retrieve messages, including the option to filter by workflow status
 * for status see function updateMessageStatus
 * @param {*} options 
 */
function getMessages(options){
    return new Promise((resolve, reject) => {
        try{

            let filterIndividualMessage = false;

            let filterObj = {"medications" : {$exists : true}, "removed" : {$exists : false}};

            let sortObj = { sendDate: 1 };

            if (options.status){
                filterObj["status"] = parseInt(options.status);
                sortObj = { sendDate: 1 };
            }else if (!options.flagIncludeCompleted){
                filterObj["status"] = {$lt : 100};
                sortObj = { sendDate: -1 };
            }

            if (options.messageId){
                filterObj = {"_id" : ObjectID(options.messageId.toString())};
                filterIndividualMessage = true;
            }

            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
        
                const collection = dbo.collection('messages');
        
                collection.find(filterObj).sort( sortObj ).toArray(function(err, result){
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

                        if (result.length > 0 && filterIndividualMessage){
                            result = result[0];
                        }

                        resolve(result);
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

async function adminHandleGetRequests(req, res){
    try{
        let userId = req.userId;
        let flagIncludeCompleted = req.query.flagincludecompleted;

        let messages = await getMessages({flagIncludeCompleted});

        res.json({"messages" : messages});


    }catch(err){
        logger.error(err);
        res.send(500, "An error occured acquiring myMessages." );
    }
}

/**
 * Function to update a workflow status of a message
 * [0]=created, [100]=completed, [50]=waiting on patient
 * @param {*} messageId 
 * @param {*} status 
 */
function updateMessageStatus(messageId, status){
    return new Promise ((resolve, reject) => {
        try{

            status = parseInt(status);

            MongoClient.connect(MongoUrl, function(err, db) {
      
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
     
                const collection = dbo.collection('messages');
     
                collection.updateOne(
                    {
                        "_id" : ObjectID(messageId)
                    }, 
                    {
                        $set: {
                            "status" : status
                        }
                    },
                    function(err, docs){
                        if (err) throw err;
                        resolve(true);
                    }
                );
                    
              });
     
        }catch(error){
            reject(err);
        }

    })
}

async function handleMessageStatusUpdate(req, res){
    try{
        
        let messageId = req.params.messageId;
        let status = req.body.status;

        if (!messageId || !status){
            throw new Error("messageId or status undefined")
        }

        status = parseInt(status);

        await updateMessageStatus(messageId, status);

        let messageObj = await getMessages({messageId});

        let userId = messageObj.userId || false;

        let userEmail = messageObj.userEmail;
        let userName = messageObj.userName;

        if (userId){
            let userObj = await authCtrl.getUserById(userId);

            userEmail = userObj.userName;
            userName = userObj.name;
        }

        if (!userEmail){
            throw new Error(`userEmail undefined for sending general msgnotification for message: ${messageId}`)
        }

        if (!userName){
            userName = userEmail;
        }

        await emailerCtrl.sendGeneralMsgNotification(userEmail, userName, userId, {status, messageId});

        res.json({"key" : "SUCCESS"});

    }catch(err){
        logger.error(err);
        res.send(500, "An error occured updating via handleMessageStatusUpdate." );
    }
} 

module.exports = {
    handleGeneralMessage,
    handlePrescriptionMessage,
    getMyMessages,
    cleanUserDataFromAccountRemove, 
    handlePrescriptionMessageRemove, 

    decryptMedication, 
    encryptMedication, 

    adminHandleGetRequests, 

    handleMessageStatusUpdate
}