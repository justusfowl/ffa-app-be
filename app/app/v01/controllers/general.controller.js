
const config = require('../../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var MongoUrl = config.getMongoUrl();

function getSettings(req, res){

    try{

        MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
 
            const collection = dbo.collection('settings');

            collection.find({}).toArray(function(error, result){
                if (error){
                    throw err;
                }

                res.json(result);

            });

        });
 
    }catch(error){
        console.error(error.stack);
        res.send(403, "Something went wrong getting the settings.");
    }

}

function getConfig(req, res){

    try{

        MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
 
            const collection = dbo.collection('config');

            collection.findOne({}, function(error, result){
                if (error){
                    throw err;
                }

                res.json(result);

            });

        });
 
    }catch(error){
        console.error(error.stack);
        res.send(403, "Something went wrong getting the config.");
    }

}

function storeConfig(req, res){

    try{

        let configObjId = req.params.configObjId;
        let configObj = req.body;

        if (!configObjId){
            res.send(500, "Please provide the configObjId");
            return;
        }else{
            if (configObjId != "1"){
                configObjId = ObjectID(configObjId);
            }

            delete configObj._id;
        }

        MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
 
            const collection = dbo.collection('config');

            collection.updateOne(
                {
                    "_id" : configObjId
                }, 
                {
                    $set: configObj
                },
                { upsert: true },
                function(err, docs){
                    if (err){
                        throw err;
                    }

                    res.json({"message" : "ok"});
                }
            );

        });
 
    }catch(error){
        console.error(error.stack);
        res.send(403, "Something went wrong writing the config object.");
    }

}


function storeSettings(req, res){

    try{

        let settingsObjId = req.params.settingsObjId;
        let settingsObj = req.body;

        if (!settingsObjId){
            res.send(500, "Please provide the settingsObjId");
            return;
        }else{
            if (settingsObjId != "1"){
                settingsObjId = ObjectID(settingsObjId);
            }
        }

        MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
 
            const collection = dbo.collection('settings');

            collection.updateOne(
                {
                    "_id" : settingsObjId
                }, 
                {
                    $set: settingsObj
                },
                { upsert: true },
                function(err, docs){
                    if (err){
                        throw err;
                    }

                    res.json({"message" : "ok"});
                }
            );

        });
 
    }catch(error){
        console.error(error.stack);
        res.send(403, "Something went wrong writing the settings object.");
    }

}

var emailCtrl = require('./emailer.controller');

async function test (req, res){

    await emailCtrl.testEmail("ulikaulfuss@k-datacenter.de", "https://blank").then(result => {
        res.json({"message" : "ok"});
    }).catch(err => {
        res.send(500, err);
    })
    
}


module.exports = {
    getSettings, 
    storeSettings,
    getConfig, 
    storeConfig,
    test
}