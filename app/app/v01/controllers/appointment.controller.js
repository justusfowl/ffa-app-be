
const config = require('../../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var MongoUrl = config.getMongoUrl();

var authCtrl = require('./auth.controller');
var teleMedCtrl = require('./telemed.controller');
var emailCtrl = require('./emailer.controller');

var util = require('../util');

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

function _getDaysArray(start, end, flagIncludeWeekends=false) {
    start = new Date(start); 
    end = new Date(end); 

    for(var arr=[],dt=start; dt<=end; dt.setDate(dt.getDate()+1)){

        let newDate = new Date(dt); 

        if((newDate.getDay() == 0 || newDate.getDay() == 6) && flagIncludeWeekends){
            arr.push(newDate);
        }else if (newDate.getDay() < 6 && newDate.getDay() > 0){
            arr.push(newDate);
        }
        
    }
    return arr;
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

function _getAppointmentsFromDateRange(startDate, endDate, userId=null, flagIncludeInActive=false){

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
                // if requested ID is an actual BSON, then search for it
                let userIdAsBSON = ObjectID(userId);
                filterObj = {"userId" : userId}
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
        (x.appointmentObj.end >= slot.start && x.appointmentObj.end <= slot.end) || 
        (x.appointmentObj.start >= slot.start && x.appointmentObj.start <= slot.end) || 
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
            element["userName"] = userObjArray[userIdx]["userName"] || "noch unbekannt";
        }

    });

    return slots;
}

async function getAvailableDocs(req, res){
    try{

        MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
 
            const collection = dbo.collection('appslots');

            collection.aggregate( [ { $group : { _id : "$userId" } } ] ).toArray(async function(error, result){

                let userIds = [];
                result.forEach(element => {
                    userIds.push(ObjectID(element._id))
                });

                let userObjArray = await authCtrl.getManyUsersById(userIds);

                let docsArray = [];

                userObjArray.forEach(element => {
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

    let today = new Date();
    let userId = req.userId;

    let startDate = req.query.startDate; 
    let endDate = req.query.endDate;
    let appointmentType = req.query.appointmentType;
    let docId = req.query.docId;

    let appointmentTypeIdx = appointmentMeta.findIndex(x => x.type == appointmentType);
    let appointmentTypeObj;

    if (new Date(startDate).getTime() < today.getTime()){
        // no meetings before today 
        startDate = util.convertDateToString(today);
    }

    if (new Date(endDate).getTime() < today.getTime()){
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

    let slots = await _getSlots(docId);

    slots = await _enrichSlotsWithUserInfo(slots);

    let existingAppointments = await _getAppointmentsFromDateRange(startDate, endDate);

    // create all theoretical slots for that type of appointment

    let allTheoSlots = [];
    let duration = appointmentTypeObj.durationInSeconds;

    datesInBetween.forEach(t_date => {
        slots.forEach(slot => {

            // first possible time based on the slot provided 
            let slotStartHours = parseFloat(slot.startTime.substring(0,slot.startTime.indexOf(":")));
            let slotStartMin = parseFloat(slot.startTime.substring(slot.startTime.indexOf(":")+1, slot.startTime.length));

            let startingEvent = new Date(t_date);
            startingEvent.setHours(slotStartHours, slotStartMin);

            // last ending time based on the slot provided 
            let slotEndHours = parseFloat(slot.endTime.substring(0,slot.endTime.indexOf(":")));
            let slotEndMin = parseFloat(slot.endTime.substring(slot.endTime.indexOf(":")+1, slot.endTime.length));

            let endingEvent = new Date(t_date);
            endingEvent.setHours(slotEndHours, slotEndMin);

            let eventEnd;

            if (t_date.getDay() == slot.dayId){

                do {

                    eventEnd = new Date(startingEvent.getTime() + (duration * 1000));

                    let event = {
                        "start"  : startingEvent,
                        "end" : eventEnd,
                        "title" : slot.userName, 
                        "appointmentType" : appointmentType
                    }

                    if (endingEvent.getTime() >= eventEnd.getTime()){
                        if (_validateSlotAgainstAppointments(event, existingAppointments)){
                            allTheoSlots.push(event);
                        }
                    }

                    startingEvent = eventEnd;

                }while (endingEvent.getTime() >= eventEnd.getTime())

            }
            
        });
    });

    res.json(allTheoSlots);

}

async function _insertTeleAppointment(appointmentObj){

    // ensure start/end timestamps are properly formatted as dates.
    appointmentObj.appointmentObj.start = new Date(appointmentObj.appointmentObj.start);
    appointmentObj.appointmentObj.end = new Date(appointmentObj.appointmentObj.end);

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

 function addTeleAppointment(req, res){

    try{

        let userId = req.userId;

        if (!userId){
            return res.send(500, "Please provide userId");
        }

        let appointmentObject = req.body;
        appointmentObject["userId"] = userId;

        let startDate = new Date(appointmentObject.appointmentObj.start);
        let endDate = new Date(appointmentObject.appointmentObj.end);

        // get duration in seconds
        let durationInSec = (endDate.getTime() - startDate.getTime()) / 1000;
        
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

                        res.json(response);

                        let userObj = await authCtrl.getUserById(userId);

                        let emailContext = {
                            userName : userObj.name || userObj.userName,
                            patientCode : videoAppointmentObj.patientCode, 
                            dialInUrlPatient : videoAppointmentObj["dialInUrlPatient"], 
                            appointmentDate : startDate, 
                            appointmentType : appointmentObject.appointmentType.name, 
                            docName : appointmentObject.doc.userName
                        }

                        emailCtrl.sendTeleAppointment(emailContext).catch(err => {
                            console.error(err);
                        })

                    }).catch(err => {
                        throw err;
                    })

                }else{
                    res.send(500, "An error occured adding a tele appointment.")
                }

            }catch(err){
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
        let startDate = new Date('01-01-1900');
        let endDate = new Date('01-01-2099');
        
    
        let appointments = await _getAppointmentsFromDateRange(startDate, endDate, userId, true);
    
        res.json(appointments)
    }catch(err){
        res.send(500, err)
    }
}

// @TODO: implement so that admins can remove appointments
async function removeAppointment(req, res){

    try{

        var appointmentId = req.params.appointmentId;
        let userId = req.userId;

        let appointmentObj = await getAppointmentById(appointmentId);

        if (appointmentObj.userId != userId){
            return res.send(403, "Modifications allowed only for individual appointments.")
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
                            res.json({"message" : "ok"});
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

module.exports = {
    getAvailableSlots, 
    getAvailableDocs, 

    addTeleAppointment, 
    getMyAppointments, 

    removeAppointment
}