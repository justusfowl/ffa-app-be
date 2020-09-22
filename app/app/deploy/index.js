
const config = require('../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var MongoUrl = config.getMongoUrl();

const logger = require('../../logger');

//requiring path and fs modules
const path = require('path');
const fs = require('fs');
//joining path of directory 


function getCurrentVersion(){

    return new Promise((resolve, reject) => {
        try{

            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
        
                const collection = dbo.collection('sys');
        
                collection.findOne({}, function(err, result){
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

function updateVersion(version){

    return new Promise((resolve, reject) => {
        try{

            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
        
                const collection = dbo.collection('sys');
        
                collection.updateOne(
                    {}, 
                    { $set: { version: parseInt(version) } },
                    { upsert: true }, 
                    function(err, result){
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


function run(){
    const directoryPath = path.join(__dirname);
    //passsing directoryPath and callback function
    
    fs.readdir(directoryPath, async function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        
        let idx = files.indexOf("index.js");
        files.splice(idx, 1);

        let applicationSettings = await getCurrentVersion();

        let currentApplicationVersion = applicationSettings.version || -1;

        for (var i=0;i<files.length;i++){
            let file = files[i];

            if (file.indexOf(".js") > -1){
                let versionNumber = parseInt(file.substring(0, file.indexOf(".js")));

                if (versionNumber > currentApplicationVersion){

                    console.log(`Starting deploying for version ${versionNumber}`); 

                    let {init} = require("./" + file);
        
                    await init();

                    await updateVersion(versionNumber);

                    console.log(`Deploying completed for version ${versionNumber}`); 
            
                    
                }else{
                    console.log(`Skipped: Version ${versionNumber}`); 
                }
            }
        }
        
    });
}


module.exports = {run}