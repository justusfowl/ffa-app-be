
const config = require('../../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var MongoUrl = config.getMongoUrl();

function getTeam(req, res){

    try{

        MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
 
            const collection = dbo.collection('team');
 
            collection.find({}).toArray(function(error, result){
                if (error){
                    throw err;
                }

                res.json(result)

            });
                
          });
 
    }catch(error){
        console.error(error.stack);
        res.send(403, "Something went wrong getting the users.");
    }

}; 

module.exports = {
    getTeam
}