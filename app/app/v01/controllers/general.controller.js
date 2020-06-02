
const config = require('../../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var request = require('request');
var MongoUrl = config.getMongoUrl();
var path = require('path');
var LZString = require('lz-string');
var base64ToImage = require('base64-to-image');
var uuid = require("uuid");

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

async function testEmail (req, res){

    await emailCtrl.testEmail("ulikaulfuss@k-datacenter.de", "https://blank").then(result => {
        res.json({"message" : "ok"});
    }).catch(err => {
        res.send(500, err);
    })
    
}

function uploadFile(req, res){
    try{

        var file = req.file;
        var body = req.body;
        var fsEndPoint = req.fsEndPoint;

        var previewItem;

        if (!fsEndPoint){
            throw new Error("No endpoint defined");
        }

        if (file){
            var fqdn_file = config.getPubExposedDirUrl() + fsEndPoint + file.filename;
        }else{
            throw new Error("Either type is not allowed of no file could be found uploaded")
        }

        let responseObj = {
            "filePath" : fqdn_file
        };

        if (body.previewSrc){
            var base64Str = body.previewSrc;

            let filename =  uuid.v1();

            let dir = path.join(config.baseDirectory, "pub/" + fsEndPoint);

            var optionalObj = {'fileName': filename, 'type':'jpeg'}; 
            
            var imageInfo = base64ToImage(base64Str, dir, optionalObj); 
            
            responseObj["avatarPath"] = config.getPubExposedDirUrl() + fsEndPoint + filename + ".jpeg";
        }

        if (body.duration){
            responseObj["duration"] = parseInt(body.duration).toFixed(); 
            responseObj["videoDuration"] = parseInt(body.duration).toFixed(); 
        }

        res.json(responseObj);

    }catch(err){
        console.error(err);
        res.send(500, "Something went wrong uploading a file.")
    }
}

async function findCities(req, res){

    try{

        let backendConfig = await config.getBackendConfig();
        let q = req.query.q;

        if (typeof(backendConfig.tv.weatherAPIKey) == "undefined"){
            return res.send(500, "Please provide an API key.")
        }

        if (!q){
            return res.send(500, "Please provide a search string.");
        }

        request({
            url: 'https://api.openweathermap.org/data/2.5/find?appid=' + backendConfig.tv.weatherAPIKey  + '&q=' + q + '&type=like&sort=population&cnt=30&lang=de',
            method: 'GET',
            json: true
          }, function(error, response, body) {
    
            if (error || parseFloat(body.cod) != 200){
                throw error;
            }

            console.log(body)
            res.json(body);

        });

    }catch(err){
        console.error(err);
        res.send(500, "Something went wrong finding a City.")
    }
  
}

async function getWeatherFromLocation(req, res){

    try{

        let backendConfig = await config.getBackendConfig();
        let lon = parseFloat(req.query.lon);
        let lat = parseFloat(req.query.lat); 

        if (typeof(backendConfig.tv.weatherAPIKey) == "undefined"){
            return res.send(500, "Please provide an API key.")
        }

        if (!lon || !lat){
            return res.send(500, "Please provide both LON and LAT coordinates.");
        }

        request({
            url: 'https://api.openweathermap.org/data/2.5/onecall?appid=' + backendConfig.tv.weatherAPIKey  + '&lon=' + lon + '&lat=' + lat + '&lang=de&units=metric',
            method: 'GET',
            json: true
          }, function(error, response, body) {
    
            if (error){
                throw error;
            }
            res.json(body);

        });

    }catch(err){
        console.error(err);
        res.send(500, "Something went wrong finding a City.")
    }
  
}


module.exports = {
    getSettings, 
    storeSettings,
    getConfig, 
    storeConfig,
    uploadFile,

    findCities,
    getWeatherFromLocation,


    testEmail
}