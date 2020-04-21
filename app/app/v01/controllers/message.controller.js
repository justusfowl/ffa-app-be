const config = require('../../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var MongoUrl = config.getMongoUrl();

var emailerCtrl = require('./emailer.controller');
var timesCtrl = require('./times.controller');

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
            userEmail : email, 
            flagCollectFromPractice : flagCollectFromPractice, 
            collectDrugStore : collectDrugStore
        };

        let message = "Ihre Rezeptvorbestellung für: ";

        medications.forEach(element => {
            message += element.name + " "
        });

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



module.exports = {
    handleGeneralMessage,
    handlePrescriptionMessage
}