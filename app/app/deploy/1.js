
const config = require('../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var cryptoSrv = require('../v01/crypto/crypto');
var MongoUrl = config.getMongoUrl();

const logger = require('../../logger');


function getAppointments(){
    return new Promise((resolve, reject) => {
        try{
            MongoClient.connect(MongoUrl, function(err, db) {
      
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
     
                const collection = dbo.collection('appointments');
    
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

function storeAppointment(appointmentObj){
    return new Promise((resolve, reject) => {
        try{

            let id = appointmentObj._id.toString();

            delete appointmentObj._id;

            MongoClient.connect(MongoUrl, function(err, db) {
      
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
     
                const collection = dbo.collection('appointments');

                let filterObj = {_id : ObjectID(id)}
    
                collection.updateOne(filterObj, {$set : appointmentObj}, function(error, result){

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

        let appointments = await getAppointments();

        for (var i=0;i<appointments.length; i++){
            let appointmentObj = appointments[i];
            if (appointmentObj.patientName){
                appointmentObj.patientName = cryptoSrv.encrypt(appointmentObj.patientName);
            }

            await storeAppointment(appointmentObj);
        }

    }catch(err){
        logger.error(err);
    }
    
}

// Description: Encrypting the field patientName of appointments

module.exports = {
    init
}