
const config = require('../../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var MongoUrl = config.getMongoUrl();

function addDevice(deviceObj, userId){

    return new Promise((resolve, reject) => {
        try{

            deviceObj["userIdAdded"] = userId;
            deviceObj["dateAdded"] = new Date();

            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
        
                const collection = dbo.collection('devices');
        
                collection.insertOne(
                    deviceObj,
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

function loadDevices(){

    return new Promise((resolve, reject) => {
        try{

            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
        
                const collection = dbo.collection('devices');
        
                collection.find({}).toArray(function(err, result){
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

function loadDeviceById(_id){

    return new Promise((resolve, reject) => {
        try{

            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
        
                const collection = dbo.collection('devices');
        
                collection.findOne({"_id" : ObjectID(_id)}, function(err, result){
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



async function getDevices(req, res){
    try{
        let devices = await loadDevices();
        res.json(devices);
    }catch(err){
        console.error(err)
        return res.send(500, "An error occured requesting the devices list");
    }
}

async function updateDeviceDatabase(deviceObj){

    return new Promise((resolve, reject) => {
        let deviceObjId = deviceObj._id;

        if (!deviceObjId){
            reject(false);
        }else{
            delete deviceObj._id;
        }
        
         try{
     
            MongoClient.connect(MongoUrl, function(err, db) {
      
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
     
                const collection = dbo.collection('devices');
    
                collection.updateOne({"_id" : ObjectID(deviceObjId) }, { $set: deviceObj },
                    function(err, docs){
                        if (err){
                            reject(err);
                        }else{  
                            resolve(true);
                        }
                    }
                );
                    
              });
     
        }catch(error){
            reject(err);
        }
    })

}

async function removeDeviceDatabase(deviceId){

    return new Promise((resolve, reject) => {
        try{
            
            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
        
                const collection = dbo.collection('devices');
        
                collection.deleteOne(
                  {
                      "_id" : ObjectID(deviceId)
                  },
                  function(err, result){
                    if (err){
                        reject(err);
                    }else{  
                        resolve(true);
                    }
                    
                  });
              });
    
        }catch(err){
            reject(err);
        }
    })
}

function updateDevice(req, res){
    try{
        let deviceObj = req.body;
        updateDeviceDatabase(deviceObj).then(res => {
            res.json({"success" : true})
        }).catch(err => {
            console.error(err);
            res.send(500, "The device could not have been updated.")
        });

    }catch(err){
        res.send(500, "The device could not have been updated.")
    }
}

function removeDevice(req, res){
    try{
        let deviceObjId = req.params.devideId;
        if(!deviceObjId){
            return res.send(500, "Please provide devideId.")
        }
        removeDeviceDatabase(deviceObjId).then(res => {
            res.json({"success" : true})
        }).catch(err => {
            console.error(err);
            res.send(500, "The device could not have been updated.")
        });

    }catch(err){
        res.send(500, "The device could not have been updated.")
    }
}


module.exports = {

    loadDeviceById, 
    
    addDevice, 
    getDevices,

    updateDevice,
    updateDeviceDatabase,

    removeDevice,
    removeDeviceDatabase
}