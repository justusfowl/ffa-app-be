const config = require('../../config/config');
var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var MongoUrl = config.getMongoUrl();

var moment = require('moment-timezone');

const logger = require('../../../logger');

async function generateDialInCodes(id) { 

    return new Promise(async (resolve, reject) => {
        try{
            let min = 100000000;
            let max = 999999999;
            let uniqueDoc = false;
            let uniquePatient = false;
            let code;
        
            do {
                
                var hexTenantId = id.toString(16);
                var paddedHexTenantId = hexTenantId.padStart(4, '0');
                var generatedDoctorCode = createCode();
                var doctorCode = formatCodeScheme("" + generatedDoctorCode + paddedHexTenantId);
                var generatedPatientCode = createCode();
                var patientCode = formatCodeScheme("" + generatedPatientCode + paddedHexTenantId);
        
                uniqueDoc = await isDialCodeNonExisting(doctorCode);
                uniquePatient = await isDialCodeNonExisting(patientCode);
        
            }while (!uniquePatient || !uniqueDoc)
    
            resolve({ doctorCode: doctorCode, patientCode: patientCode });
        }catch(err){
            reject(err);
        }
       
    })

}


function formatCodeScheme (code) {
    return code.replace(/^([0-9a-f]{3})([0-9a-f]{3})([0-9a-f]{3})$/, '$1-$2-$3');
};


function createCode () {
    var DEC_MAX_CODE = parseInt('fffff', 16);
    var code = Math.floor(Math.random() * DEC_MAX_CODE).toString(16);
    return code.padStart(5, '0');
};


async function isDialCodeNonExisting(code){

    return new Promise((resolve, reject) => {
        try{
            let filterObj = {};
            
            MongoClient.connect(MongoUrl, function(err, db) {
      
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
     
                const collection = dbo.collection('appointments');
    
                collection.find({$or: [{"tele.doctorCode" : code},{"tele.patientCode" : code}]}).toArray(function(error, result){

                    if (error){
                        reject(error);
                    }else{
                        if (result.length > 0){
                            resolve(false);
                        }else{
                            resolve(true);
                        }
                        
                    }
    
                });
    
            });
     
        }catch(error){
            reject(error.stack);
        }
    })

}

async function login(){

    return new Promise ((resolve, reject) => {
        let body = {
            "class": "auth",
            "method": "login",
            "Tenant": {
                "alias": config.tele.tenantAlias
            },
            "User": {
                "alias": config.tele.userAlias,
                "symmetricUserKeyHash": config.tele.symmetricUserKeyHash
            },
            "session": {
                "deviceId": config.tele.deviceId
          }
        }

        try{
            request({
                url: config.tele.loginUrl,
                method: 'POST',
                body: body,
                json: true
              }, function(error, response, resbody) {
    
                if (error){
                    reject(error);
                }else{
                    resolve(resbody);
                }
    
                
            });
        }catch(err){
            reject(err);
        }
    })
   

}

/**
 * Function to remove the appointment from the telemedicine platform (DELETE)
 * @param {*} head_id provide the head ID as string (-> tele.head_id)
 */
async function removeAppointment(head_id){
    var TELE_SESSION;
    await login().then(response => {
        TELE_SESSION = response;
    }).catch(err => {
        logger.error(err);
    })

    return new Promise((resolve, reject) => {

        let body = {
            "class": "crud",
            "method": "delete",
            "VideoAppointment": {
                "head_id": head_id
            },
            "session": {
                "session_id": TELE_SESSION.session.session_id,
                "terminal_id": TELE_SESSION.session.terminal_id,
                "deviceId": TELE_SESSION.session.deviceId
            }
        }

        try{
            request({
                url: config.tele.apiBase,
                method: 'POST',
                body: body,
                json: true
              }, function(error, response, resbody) {
    
                if (error || !resbody.success){
                    reject(error || resbody);
                }else{
                    resolve(resbody);
                }
    
            });
        }catch(err){
            reject(err);
        }

    })

}

async function insertAppointment(startDate, durationInSecs){
    
    var TELE_SESSION, USER_GROUP_ID;
    await login().then(response => {
        TELE_SESSION = response;
    }).catch(err => {
        logger.error(err);
    })

    try{
        USER_GROUP_ID = TELE_SESSION.user.memberOf[1];
    }catch(err){
        USER_GROUP_ID = config.tele.userGroupId
    }

   let codes = await generateDialInCodes(parseInt(config.tele.tenantId));
   let patientCode = codes.patientCode;
   let docCode = codes.doctorCode;

    return new Promise((resolve, reject) => {

        let body = {
            "class": "transaction",
            "method": "transaction",
            "transaction": [
                {
                    "class": "crud",
                    "method": "create",
                    "VideoAppointment": {
                        "start": moment(startDate).toISOString(),
                        "VideoAppointmentDetails": {
                            "patientName": "nwNny3mWCV3WUo/nY4dOHiJH1k tv/G3mWajkv6Ultn5yMDbmBb3Y7X4N4BjD0rgjZo",
                            "doctorName": "FFA",
                            "duration": Math.round(durationInSecs/60)
                        },
                        "doctorCode": docCode,
                        "patientCode": patientCode
                    },
                    "options": {
                        "user_group_id": USER_GROUP_ID
                    }
                },
                {
                    "class": "crud",
                    "method": "create",
                    "VideoConsultationCode": [
                        {
                            "id": docCode
                        },
                        {
                            "id": patientCode
                        }
                    ],
                    "options": {
                        "user_group_id": USER_GROUP_ID
                    }
                }
            ],
            "session": {
                "session_id": TELE_SESSION.session.session_id,
                "terminal_id": TELE_SESSION.session.terminal_id,
                "deviceId": TELE_SESSION.session.deviceId
          }
        }

        try{
            request({
                url: config.tele.apiBase,
                method: 'POST',
                body: body,
                json: true
              }, function(error, response, resbody) {
    
                if (error){
                    reject(error);
                }else{
                    resolve(resbody);
                }
            });
        }catch(err){
            reject(err);
        }

    })

}

module.exports = {
    insertAppointment, 
    removeAppointment
}