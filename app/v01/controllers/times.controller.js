
const config = require('../../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var MongoUrl = config.getMongoUrl();


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

module.exports = {
    getTimes
}