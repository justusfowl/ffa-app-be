
const config = require('../../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment-timezone');
var MongoUrl = config.getMongoUrl();

var request = require('request');

async function getTimes(req, res){

    try{

        let vacationTimes = await _getVacationTimes();
        let openHrs = await _getOpeningHrs();

        let resp = {
            "vacation" : vacationTimes, 
            "opening" : openHrs
        }

        res.json(resp);

 
    }catch(error){
        console.error(error.stack);
        res.send(403, "Something went wrong getting the times.");
    }

}; 

function _getOpeningHrs(){
    return new Promise((resolve, reject) => {

        MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
 
            const collection = dbo.collection('openinghrs');
 
            collection.find(
                {}
            ).toArray(function(error, result){
                if (error){
                    reject(err);
                }else{
                    resolve(result);
                }

            });
                
          });

    })
}

function _getVacationTimes(){
    return new Promise((resolve, reject) => {

        MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
 
            const collection = dbo.collection('vacation');
 
            collection.find(
                {vacationEnd:  {$gte: new Date()}}
            ).sort( { vacationEnd: 1 } ).toArray(function(error, result){
                if (error){
                    reject(err);
                }else{
                    resolve(result);
                }

            });
                
          });

    })
}

function getIsCurrentlyVacation(){
    return new Promise((resolve, reject) => {

        MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
 
            const collection = dbo.collection('vacation');
 
            collection.find(
                {vacationEnd:  {$gte: new Date()}, vacationStart:  {$lte: new Date()}}
            ).toArray(function(error, result){

                if (error){
                    reject(err);
                }else{
                    let responseObj = {
                        "isVacation" : false, 
                        "vacationObj" : {}
                    }
                    if (result.length > 0){
                        responseObj.isVacation = true;
                        responseObj.vacationObj = result[0];
                    }
                    resolve(responseObj);
                }

            });
                
          });

    })
}

/**
 * Function to return vacation slots that are falling within a given timeframe
 * @param {*} startDate 
 * @param {*} endDate 
 */
function getVacationBetweenDates(startDate, endDate){

    startDate = new Date(startDate);
    endDate = new Date(endDate);

    let filterObj = {
        $or : [
            { $and : [ {"vacationEnd":  {$gt: startDate}}, {"vacationEnd":  {$lt: endDate}}]},
            { $and : [ {"vacationStart":  {$gt: startDate}}, {"vacationStart":  {$lt: endDate}}]},
            { $and : [ {"vacationStart":  {$gte: startDate}}, {"vacationEnd":  {$lte: endDate}}]},
            { $and : [ {"vacationStart":  {$lte: startDate}}, {"vacationEnd":  {$gte: endDate}}]}
        ]
    };

    return new Promise((resolve, reject) => {

        MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
 
            const collection = dbo.collection('vacation');
 
            collection.find(filterObj).toArray(function(error, result){

                if (error){
                    reject(err);
                }else{
                   resolve(result);
                }

            });
                
          });

    })
}

function updateOpenDay(req, res){
    try{
  
        let dayObj = req.body;
        let dayId = dayObj._id;
  
        if (!dayId){
          res.send(500, "Please provide dayId");
          return;
        }
    
        MongoClient.connect(MongoUrl, function(err, db) {
    
          if (err) throw err;
          
          let dbo = db.db(config.mongodb.database);
  
          // Get the documents collection
          const collection = dbo.collection('openinghrs');
  
          if (dayObj._id){
            delete dayObj._id
        }
  
          collection.replaceOne(
            {"_id" : ObjectID(dayId)},
            dayObj,
            function(err, docs){
              if (err) throw err;
              res.json(docs);
            });
  
        });
    
      }catch(error){
        console.error(error)
        res.send(500, "An error occured updating the day opening hours: " + JSON.stringify(req.body) );
      }
}

function upsertVacation(req, res){
    try{
  
        let vacationObj = req.body;
        let vacationId =  ObjectID(vacationObj._id)  || "";

        if (
            typeof(vacationObj.vacationStart) == "undefined" || typeof( vacationObj.vacationStart) == "undefined"
            ){
                return res.send(500, "Please provide correct format for vacation object" + JSON.stringify(req.body) );
            }

        vacationObj.vacationStart = new Date(vacationObj.vacationStart);
        vacationObj.vacationEnd = new Date(vacationObj.vacationEnd);
      
        MongoClient.connect(MongoUrl, function(err, db) {
    
          if (err) throw err;
          
          let dbo = db.db(config.mongodb.database);
  
          // Get the documents collection
          const collection = dbo.collection('vacation');
  
          if (vacationObj._id){
            delete vacationObj._id
        }
  
          collection.updateOne(
            {"_id" : vacationId},
            {$set : vacationObj},
            { upsert: true },
            function(err, docs){
              if (err) throw err;
              res.json(docs);
            });
  
        });
    
      }catch(error){
        console.error(error)
        res.send(500, "An error occured upserting the vacation entry: " + JSON.stringify(req.body) );
      }
}


function removeVacation(req, res){
    try{

        var vacationId  = req.params.vacationId;
        
        MongoClient.connect(MongoUrl, function(err, db) {
    
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
    
            const collection = dbo.collection('vacation');
    
            collection.deleteOne(
              {
                  "_id" : ObjectID(vacationId)
              },
              function(err, result){
                if (err) throw err;
                res.json({"message" : "OK"});
              });
          });

    }catch(err){
        console.error(error)
        res.send(500, "An error occured adding a team member: " + JSON.stringify(req.body) );
    }
}

/**
 * Fetch the public holidays per year and state from feiertage-api.de
 * @param {number} year full year (e.g. 2019)
 * @param {string} state State information (e.g. HE for Hessia)
 */
async function fetchPublicHolidays(year, state){

    return new Promise(async(resolve, reject) => {

        if (!year || !state){
           reject("Missing information")
        }
    
      request({
          url: `https://feiertage-api.de/api/?jahr=${year}&nur_land=${state}`,
          method: 'GET',
          json: true
        }, function(error, response, body) {
            if (error){
                reject(error);
            }else{
                resolve(body);
            }
      });
    });
  
}

async function removePublicHolidaysFromToday(){

    return new Promise(async (resolve, reject) => {
        try{

            let now = new Date();
            
            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
        
                const collection = dbo.collection('vacation');
        
                collection.deleteMany({"flagHoliday" : true, "vacationStart" : {$gte : now}}, function(err, result){
                    if (err) throw err;
                    resolve(result)
                  });
              });
    
        }catch(err){
            reject(err);
        }
    })

}

async function insertPublicHolidays(holidayArray){

    return new Promise(async (resolve, reject) => {
        try{
            
            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
        
                const collection = dbo.collection('vacation');
        
                collection.insertMany(holidayArray, 
                  function(err, result){
                    if (err) throw err;
                    resolve(result)
                  });
              });
    
        }catch(err){
            reject(err);
        }
    })

}

async function syncPublicHolidays(req, res){

    try{
        let backendConfig = await config.getBackendConfig();
        let stateInfo;
    
        try{
            stateInfo = backendConfig.master.state.abbreviation || "HE";
        }catch(err){
            
           return res.send(500, "Missing master data about state");
        }
    
        let yearStart = new Date().getFullYear();
        let toBeAddedHolidays = [];
    
        await removePublicHolidaysFromToday().catch(err => {
            console.error(err);
        });
    
    
        let pubHolidaysThisYear = await fetchPublicHolidays(yearStart, stateInfo).catch(err => {
            console.error(err);
        });
    
        Object.keys(pubHolidaysThisYear).forEach(key => {
            let day = pubHolidaysThisYear[key];
            let newObj = {
                "vacationStart" : moment(day.datum, 'YYYY-MM-DD').toDate(),
                "vacationEnd" : moment(day.datum, 'YYYY-MM-DD').toDate(),
                "title" : key, 
                "flagHoliday" : true
            };
            toBeAddedHolidays.push(newObj);
        });
    
        let pubHolidaysNextYear = await fetchPublicHolidays(yearStart+1, stateInfo).catch(err => {
            console.error(err);
        });
    
        Object.keys(pubHolidaysNextYear).forEach(key => {
            let day = pubHolidaysNextYear[key];
            let newObj = {
                "vacationStart" : moment(day.datum, 'YYYY-MM-DD').toDate(),
                "vacationEnd" : moment(day.datum, 'YYYY-MM-DD').toDate(),
                "title" : key, 
                "flagHoliday" : true
            };
            toBeAddedHolidays.push(newObj);
        })
        
        await insertPublicHolidays(toBeAddedHolidays).catch(err => {
            console.error(err);
        });
    
        res.json({"success" : true});
    }catch(err){
        res.send(500, {"success" : false, "message" : "Something went wrong syncing the public holidays."});
    }   

}

module.exports = {
    getTimes,
    updateOpenDay,
    upsertVacation,
    removeVacation,
    getIsCurrentlyVacation,
    getVacationBetweenDates, 
    syncPublicHolidays
}