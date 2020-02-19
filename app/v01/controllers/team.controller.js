
const config = require('../../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var MongoUrl = config.getMongoUrl();

async function getTeam(req, res){

    try{

        let docs = await _getActiveTeam('doc');
        let mfa = await _getActiveTeam('assistant');

        let resp = {
            "docs" : docs, 
            "mfa" : mfa
        }

        res.json(resp);

 
    }catch(error){
        console.error(error.stack);
        res.send(403, "Something went wrong getting the users.");
    }

}; 

function _getActiveTeam(type){
    return new Promise((resolve, reject) => {

        MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
 
            const collection = dbo.collection('team');
 
            collection.find({"type" : type}).toArray(function(error, result){
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
    getTeam
}