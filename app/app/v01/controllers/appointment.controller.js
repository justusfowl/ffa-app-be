
const config = require('../../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var jwt = require('jsonwebtoken'); 
var MongoUrl = config.getMongoUrl();
var moment = require('moment-timezone');

var authCtrl = require('./auth.controller');
var teleMedCtrl = require('./telemed.controller');
var emailCtrl = require('./emailer.controller');

// @TODO: Add those meta config data into the database 

var appointmentMeta = [{
    "type" : "general", 
    "name" : "Generelle Konsultation",
    "durationInSeconds" : 300
  },
  {
    "type" : "lab", 
    "name" : "Besprechung Laborwerte",
    "durationInSeconds" : 300
  },
  
  {
    "type" : "docletter", 
    "name" : "Befund-Rückfrage",
    "durationInSeconds" : 900
  },
  
  {
    "type" : "travel-vac", 
    "name" : "Reise-Impf-Beratung",
    "durationInSeconds" : 600
  }]

/**
 * Function to return an array of moments/dates between two input dates. Input dates are included.
 * @param {*} startDate start date, format MM-DD-YYYY
 * @param {*} endDate end date, format MM-DD-YYYY
 * @param {*} flagIncludeWeekends 
 */
function _getDaysArray (startDate, endDate, flagIncludeWeekends=false) {

    var dates = [];
    var DAY; 
    var iterr = 0;

    var currDate = moment(startDate, 'MM-DD-YYYY');
    var lastDate = moment(endDate, 'MM-DD-YYYY');

    do{
        DAY = currDate.clone().add(iterr, 'days');
        iterr++;
        
        if((DAY.weekday() == 0 || DAY.weekday() == 6) && flagIncludeWeekends){
            dates.push(DAY);
        }else if (DAY.weekday() < 6 && DAY.weekday() > 0){
            dates.push(DAY);
        }

    }while(DAY.unix() < lastDate.unix())

    return dates;
};


/**
 * Retrieve a single appointment by Id
 * @param {*} _id appointment ID in string format  
 */
async function getAppointmentById(_id){
    return new Promise ((resolve, reject) => {
        try{
                
            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);

                const collection = dbo.collection('appointments');
                
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
 * Validate if a user / user-email has open appointments
 * @param {*} userId id of a user BSON ready string
 * @param {*} userEmail string of a user's email address
 */
async function hasUserOpenAppointments(userId, userEmail){
    return new Promise ((resolve, reject) => {
        try{

            let userIdentifierArray = []

            if (userId){
                userIdentifierArray.push(userId);
            }

            if (userEmail){
                userIdentifierArray.push(userEmail);
            }

            let filterArray = [
                {"appointmentObj.start":  {$gte: new Date()} },
                {"inactive":  {$exists: false}},
                { "userId": { $in:  userIdentifierArray} }
            ]

            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);

                const collection = dbo.collection('appointments');
                
                collection.find(
                    {$and : filterArray}
                ).toArray(
                function(err, results){
                    if (err){
                        reject(err);
                    }
                    if (results){
                        resolve(results);
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

function _getAppointmentsFromDateRange(startDate, endDate, userId=null, docId=null, flagIncludeInActive=false){

    return new Promise((resolve, reject) =>{
        try{

            let filterArray = [ 
                {"appointmentObj.start":  {$gte: new Date(startDate)}},
                {"appointmentObj.end":  {$lte: new Date(endDate)}}
            ];

            if (userId){
                filterArray.push(
                    {"userId":  userId}
                )
            }

            if (docId){
                filterArray.push(
                    {"doc._id":  docId}
                )
            }

            if (!flagIncludeInActive){
                filterArray.push(
                    {"inactive":  {$exists: false}}
                )
            }

            MongoClient.connect(MongoUrl, function(err, db) {
      
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
     
                const collection = dbo.collection('appointments');
    
                collection.find({$and : filterArray}).sort({"appointmentObj.start": -1}).toArray(function(error, result){

                    if (error){
                        reject(error);
                    }else{
                        resolve(result);
                    }
    
                });
    
            });
     
        }catch(error){
            reject(error.stack);
        }
    })

}


function _getSlots(userId=null){

    return new Promise((resolve, reject) =>{
        try{
            let filterObj = {};
            
            try{
                if (userId){
                    // if requested ID is an actual BSON, then search for it
                    let userIdAsBSON = ObjectID(userId);
                    filterObj = {"userId" : userId}
                }
               
            }catch(err){

            }

            MongoClient.connect(MongoUrl, function(err, db) {
      
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
     
                const collection = dbo.collection('appslots');
    
                collection.find(filterObj).toArray(function(error, result){

                    if (error){
                        reject(error);
                    }else{
                        resolve(result);
                    }
    
                });
    
            });
     
        }catch(error){
            reject(error.stack);
        }
    })

}

function _validateSlotAgainstAppointments(slot, appointments){

    let confictIdx = appointments.findIndex(x => 
        (x.appointmentObj.end > slot.start && x.appointmentObj.end < slot.end) || 
        (x.appointmentObj.start > slot.start && x.appointmentObj.start < slot.end) || 
        (x.appointmentObj.start <= slot.start && x.appointmentObj.end >= slot.end)
        )
    if (confictIdx > -1){
        return false;
    }else{
        return true;
    }
}

async function _enrichSlotsWithUserInfo(slots){

    let userIds = [];

    slots.forEach(element => {
        if (userIds.indexOf(element.userId) < 0){
            userIds.push(ObjectID(element.userId));
        }
    });

    let userObjArray = await authCtrl.getManyUsersById(userIds);

    slots.forEach(element => {

        let userIdx = userObjArray.findIndex(x => x._id == element.userId);

        if (userIdx >= 0){
            element["userName"] = userObjArray[userIdx]["name"] || userObjArray[userIdx]["userName"];
        }

    });

    return slots;
}

function getAvailableDocs(req, res){
    try{

        MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
 
            const collection = dbo.collection('users');

            collection.find({"scopes" : "doc"}).toArray(async function(error, result){

                let docsArray = [];

                result.forEach(element => {
                    docsArray.push({
                        _id : element._id, 
                        userName : element.name || element.userName
                    })
                });

                if (error){
                   res.send(500, error.message)
                }else{
                    res.json(docsArray)
                }

            });

        });
 
    }catch(error){
        reject(error.stack);
    }
}

async function getAvailableSlots(req, res){

    try{

        let firstAvailableDate = moment(moment().add(1, 'day').format("MM-DD-YYYY"), "MM-DD-YYYY")
       
        let userId = req.userId;

        let startDate = req.query.startDate; 
        let endDate = req.query.endDate;
        let appointmentType = req.query.appointmentType;
        let docId = req.query.docId;

        let appointmentTypeIdx = appointmentMeta.findIndex(x => x.type == appointmentType);
        let appointmentTypeObj;

        if (moment(startDate, "MM-DD-YYYY").unix() < firstAvailableDate.unix()){
            // no meetings before today 
            startDate = firstAvailableDate.format("MM-DD-YYYY");
        }

        if (moment(endDate, "MM-DD-YYYY").unix() < firstAvailableDate.unix()){
            // return empty set of appointments for 
            return res.json([])
        }

        if (appointmentTypeIdx < 0){
            return res.send(500, "Please provide a valid appointment type");
        }else{
            appointmentTypeObj = appointmentMeta[appointmentTypeIdx];
        }

        if (!startDate || !endDate){
            return res.send(500, "Please provide start / end dates");
        }

        let datesInBetween =  _getDaysArray(startDate, endDate);

        if (datesInBetween.length > 35){
            return res.send(500, "Please limit date ranges to 35 days.");
        }

        // no further planning > 50 days
        if (moment(endDate, "MM-DD-YYYY").diff(firstAvailableDate, 'days') > 62){
            return res.json([])
        }

        let slots = await _getSlots(docId);

        slots = await _enrichSlotsWithUserInfo(slots);

        let existingAppointments = await _getAppointmentsFromDateRange(startDate, endDate);

        // create all theoretical slots for that type of appointment

        let allTheoSlots = [];
        let duration = appointmentTypeObj.durationInSeconds;

        datesInBetween.forEach(t_date => {
            slots.forEach(slot => {

                let flagIsWithinException = false;

                slot.exceptions.forEach(element => {

                    let excpStart = moment(element.start);
                    let excpEnd = moment(element.end);

                    if (excpStart.unix() <= t_date.unix() && excpEnd.unix() >= t_date.unix()){
                        flagIsWithinException = true;
                    }
                    
                });

                // first possible time based on the slot provided 
                let startingEvent = moment.tz(t_date.format("MM-DD-YYYY") + " " + slot.startTime, "MM-DD-YYYY HH:ss", config.timeZone);

                // last ending time based on the slot provided 
                let endingEvent = moment.tz(t_date.format("MM-DD-YYYY") + " " + slot.endTime, "MM-DD-YYYY HH:ss", config.timeZone);

                let eventEnd;

                if (t_date.day() == slot.dayId && !flagIsWithinException){

                    do {

                        eventEnd = moment.tz((startingEvent.unix()*1000) + (duration*1000), config.timeZone); 

                        let event = {
                            "startMoment" : startingEvent.toString(),
                            "start"  : startingEvent,
                            "end" : eventEnd,
                            "title" : slot.userName, 
                            "appointmentType" : appointmentType, 
                            "doc" : {
                                "userName" : slot.userName, 
                                "_id" : slot.userId
                            }
                        }

                        if (endingEvent.unix() >= eventEnd.unix()){
                            if (_validateSlotAgainstAppointments(event, existingAppointments)){
                                allTheoSlots.push(event);
                            }
                        }

                        startingEvent = eventEnd;

                    }while (endingEvent.unix() >= eventEnd.unix())

                }
                
            });
        });

        res.json(allTheoSlots);

    }catch(err){
        console.error(err); 
        return res.send(500, "Something went wrong retrieving slots.")
    }

}

async function _insertTeleAppointment(appointmentObj){

    // ensure start/end timestamps are properly formatted as dates.
    // these must be of type DATE for proper usage within mongodb
    appointmentObj.appointmentObj.start = new Date(moment(appointmentObj.appointmentObj.start).format());
    appointmentObj.appointmentObj.end = new Date(moment(appointmentObj.appointmentObj.end).format());

    return new Promise((resolve, reject) => {
        try{

            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
        
                const collection = dbo.collection('appointments');
        
                collection.insertOne(
                    appointmentObj,
                  function(err, result){
                    if (err) {
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

 async function addTeleAppointment(req, res){

    try{

        let userId = req.userId || null;
        let appointmentObject = req.body;
        
        if (req.flagGuest){
            appointmentObject["userId"] = req.guestObject.userEmail;
            appointmentObject["flagGuest"] = true;
        }else if (!userId){
            return res.send(500, "Please provide userId");
        }else{
            appointmentObject["userId"] = userId;
        }

        let userObj, userEmail; 
        if (req.flagGuest){
            userObj = req.guestObject;
            userEmail = userObj.userEmail;
        }else{
            userObj = await authCtrl.getUserById(userId);
            userEmail = userObj.userName;
        }

       let openAppointments = await hasUserOpenAppointments(userId, userEmail).catch(err => {
           throw new Error(err);
       })

       if (openAppointments.length > 2){
            return res.json({"success" : false, "message" : "Too many outstanding existing appointments for this user."})
       }

       let startDate = moment(appointmentObject.appointmentObj.start);
       let endDate = moment(appointmentObject.appointmentObj.end);

        // get duration in seconds
        let durationInSec = (endDate.unix() - startDate.unix());
        
        teleMedCtrl.insertAppointment(appointmentObject.appointmentObj.start, durationInSec).then(async response => {

            try{

                let allSuccess = true;
                response.forEach(element => {
                    if (!element.success){
                        allSuccess = false;
                    }
                });

                let videoAppointmentObjIdx = response.findIndex(x => x.VideoAppointment.length > 0);

                if (allSuccess && videoAppointmentObjIdx > -1 && response[videoAppointmentObjIdx].VideoAppointment.length > 0){

                    let videoAppointmentObj = response[videoAppointmentObjIdx].VideoAppointment[0];

                    videoAppointmentObj["dialInUrlPatient"] = config.tele.dialInPatient + videoAppointmentObj.patientCode;
                    videoAppointmentObj["dialInUrlDoc"] = config.tele.dialInDoc + videoAppointmentObj.doctorCode;

                    appointmentObject["tele"] = videoAppointmentObj; 
                    appointmentObject["red"] = response; 

                    _insertTeleAppointment(appointmentObject).then(async insertRes => {

                        if (insertRes.insertedCount < 1){
                            res.send(500, "Unknown error inserting into FFA")
                        }else{
                            

                            let appointmentId = insertRes.insertedId.toString();

                            let data = {
                                "_id" : appointmentObject["userId"], 
                                "appointmentId" : appointmentId
                            };
    
                            let now = moment();
                        
                            var token = jwt.sign(data, config.auth.jwtsec, {
                                expiresIn: ((endDate.unix() - now.unix())*1000)
                            });
                        
                            let urlBase;
                    
                            if (config.env == "development"){
                                urlBase = config.hostProto + "://" + config.hostBase + ":" + config.hostExposedPort  + "/home?c=cancel-appointment&appointmentId="  + appointmentId  + "&token=";
                            }else{
                                urlBase = config.hostProto + "://" + config.hostBase + "/home?c=cancel-appointment&appointmentId="  + appointmentId  + "&token=";
                            }
                    
                            let tokenUrl = encodeURI(urlBase + token); 
    
                            let displayStartDate = startDate.tz(config.timeZone).locale("de");
    
                            let emailContext = {
                                userEmail : userObj.userName,
                                userName : userObj.name || userObj.userName,
                                patientCode : videoAppointmentObj.patientCode, 
                                dialInUrlPatient : videoAppointmentObj["dialInUrlPatient"], 
                                appointmentDate : displayStartDate.format("LLL"), 
                                appointmentType : appointmentObject.appointmentType.name, 
                                docName : appointmentObject.doc.userName, 
                                startDate : startDate, 
                                endDate : endDate, 
                                tokenUrl : tokenUrl
                            }
    
                            await emailCtrl.sendTeleAppointment(emailContext).catch(err => {
                                console.error(err);
                            })

                            res.json({"success" : true});
                        }
                        

                    }).catch(err => {
                        throw err;
                    })

                }else{
                    res.send(500, "An error occured adding a tele appointment.")
                }

            }catch(err){
                res.send(500, "An error occured adding a tele appointment.")
                throw err;
            }
            
        })
    }catch(err){
        res.send(500, err)
    }
}

async function getMyAppointments(req, res){
    try{
        let userId = req.userId;
        let startDate, endDate; 
        let flagIncludePast = req.query.flagIncludePast;

        if (!userId){
            return res.send(401, "No userId provided.")
        }

        if (req.query.startDate && req.query.endDate){
            startDate = req.query.startDate;
            endDate = req.query.endDate;
        }else{
            if (flagIncludePast){
                startDate = new Date('01-01-1900');
            }else{
                startDate = new Date();
            }
            
            endDate = new Date('01-01-2099');
        }
    
        let appointments = await _getAppointmentsFromDateRange(startDate, endDate, userId, null, true);
    
        res.json(appointments)
    }catch(err){
        res.send(500, err)
    }
}

async function getAppointments(req, res){
    try{
        let startDate, endDate, docId; 

        docId = req.query.docId;

        if (req.query.startDate && req.query.endDate){
            startDate = new Date(req.query.startDate);
            endDate = new Date(req.query.endDate);

            if ((endDate.getTime() - startDate.getTime())/(1000*60*60*24) > 35 ){
                return res.send(500, "Invalid timeframe - limit to 35 days.")
            }
        }else{
            return res.send(500, "please provide start/end dates")
        }

        let appointments; 
        if (docId){
            appointments = await _getAppointmentsFromDateRange(startDate, endDate, null, docId);
        }else{
            appointments = await _getAppointmentsFromDateRange(startDate, endDate);
        }
       
        res.json(appointments)
    }catch(err){
        res.send(500, err)
    }
}

async function removeAppointment(req, res){

    try{

        var appointmentId = req.params.appointmentId;
        let userId = req.userId;
        let now = new Date();

        // When a URL is provided to cancel a meeting, the parameter provided in the DELETE 
        // request must match the decoded information from the token
        // for normal deletions, there will not be any appointmentId information available 
        // from a token, yet the token itself will be valid
        if (req.appointmentId){
            if (req.appointmentId != appointmentId){
                return res.send(403, "Modifications only allowed on provided appointment Ids from the cancel-url")
            }else{
                
            }
        }

        let appointmentObj = await getAppointmentById(appointmentId);

        if (appointmentObj.userId != userId){
            return res.send(403, "Modifications allowed only for individual appointments.")
        }

        if (new Date(appointmentObj.appointmentObj.start).getTime() < now.getTime()){
            return res.json({"success" : false, "message" : "Appointments can only be removed when they are outstanding in the future."});
        }

        teleMedCtrl.removeAppointment(appointmentObj.tele.head_id).then(result => {

            MongoClient.connect(MongoUrl, function(err, db) {
    
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
        
                const collection = dbo.collection('appointments');
        
                  collection.updateOne(
                    {
                        "_id" : ObjectID(appointmentId), 
                        "userId" : userId
                    },
                    {
                        $set: {
                            "inactive" : true
                        }
                    },
                    function(err, docs){
                        if (err){
                            res.send(500, err);
                        }else{
                            res.json({"success" : true});
                        }
                    }
                );
    
              });
        }).catch(err => {
            res.send(500, err);
        })
        
    }catch(err){
        res.sen(500, err);
    }

}

async function adminGetTeleSlots(req, res){
    try{
        let slots = await _getSlots(null);
        slots = await _enrichSlotsWithUserInfo(slots);
        res.json(slots);

    }catch(err){
        return res.send(500, err);
    }
}

function adminAddTeleSlot(req, res){
    try{

        let body = req.body;
        
        let newSlot = {
            userId : body.userId, 
            dayId : body.dayId, 
            startTime : body.startTime, 
            endTime : body.endTime, 
            exceptions : body.exceptions
        }

        MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
 
            const collection = dbo.collection('appslots');

            collection.insertOne(
                newSlot,
              function(err, result){
                if (err) throw err;
                res.json(result);
              });

        });
 
    }catch(error){
        return res.send(500, error);
    }
}

function adminUpdateTeleSlot(req, res){
    try{

        let slot = req.body;
        let slotId = slot._id; 
        let allowedAttributes = ["dayId" , "startTime", "endTime", "userId", "exceptions"];

        if (!slotId){
            return res.send(500, "Please provide an Id")
        }

        const keys = Object.keys(slot)
        for (const key of keys) {
            if (allowedAttributes.findIndex(x => x == key) < 0){
                delete slot[key];
            }
        }

        slot.exceptions.forEach(element => {
            element["start"] = new Date( element["start"])
            element["end"] = new Date( element["end"])
        });

        MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
 
            const collection = dbo.collection('appslots');

            collection.updateOne(
                {
                    "_id" : ObjectID(slotId)
                }, 
                {
                    $set: slot
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
        return res.send(500, error);
    }
}

function removeAdminTeleSlot(req, res){
    try{

        var slotId = req.params.slotId;
        if (!slotId){
            return res.send(500, "Please provide an Id")
        }

        MongoClient.connect(MongoUrl, function(err, db) {
    
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
    
            const collection = dbo.collection('appslots');
    
            collection.deleteOne(
              {
                  "_id" : ObjectID(slotId)
              },
              function(err, result){
                if (err) throw err;
                res.json(result);
              });
          });

    }catch(err){
        console.error(error)
        res.send(500, "An error occured adding a team member: " + JSON.stringify(req.body) );
    }
}

module.exports = {
    getAvailableSlots, 
    getAvailableDocs, 

    addTeleAppointment, 
    getMyAppointments,
    getAppointments, 

    removeAppointment, 

    adminGetTeleSlots, 
    adminAddTeleSlot, 
    adminUpdateTeleSlot,
    removeAdminTeleSlot
}