const config = require('../../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var MongoUrl = config.getMongoUrl();

var emailerCtrl = require('./emailer.controller');
var timesCtrl = require('./times.controller');
var authCtrl = require('./auth.controller');

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

        let isVacationObj = await timesCtrl.getIsCurrentlyVacation();

        let emailSent = await emailerCtrl.sendMessageToBackOffice(contextObject);

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
        console.error(err);
        res.send(500, "An error occured sending a message: " + JSON.stringify(req.body) );
    }

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

        let message = "Ihre Rezeptvorbestellung für: ";

        medications.forEach(element => {
            message += element.name + " "
        });

        let userObj = await authCtrl.getUserByName(email);

        if (userObj._id){
            let msgObj = JSON.parse(JSON.stringify(contextObject))
            msgObj["userId"] = userObj._id.toString();
            delete msgObj.userEmail;
            storeMessage(msgObj).catch(err => {
                console.error(err);
            });
        }

        let isVacationObj = await timesCtrl.getIsCurrentlyVacation().catch(err => {
            console.error(err);
        });;

        let emailSent = await emailerCtrl.sendMessageToBackOffice(contextObject).catch(err => {
            console.error(err);
        });;

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
        console.error(err);
        res.send(500, "An error occured sending a message: " + JSON.stringify(req.body) );
    }
}

function storeMessage(messageObject){
    return new Promise((resolve, reject) => {
        try{

            if (messageObject.sendDate){
                messageObject.sendDate = new Date(messageObject.sendDate);
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
        console.error(err);
        res.send(500, "An error occured acquiring myMessages: " + JSON.stringify(err) );
    }
}


module.exports = {
    handleGeneralMessage,
    handlePrescriptionMessage,
    getMyMessages
}