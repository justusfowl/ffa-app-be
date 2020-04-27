
const config = require('../../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var MongoUrl = config.getMongoUrl();

function addPlaylist(playlistObj){

    return new Promise((resolve, reject) => {
        try{

            playlistObj["dateAdded"] = new Date();

            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
        
                const collection = dbo.collection('playlists');
        
                collection.insertOne(
                    playlistObj,
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

function loadPlaylists(){

    return new Promise((resolve, reject) => {
        try{

            MongoClient.connect(MongoUrl, function(err, db) {
        
                if (err) throw err;
                
                let dbo = db.db(config.mongodb.database);
        
                const collection = dbo.collection('playlists');
        
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

async function getPlaylists(req, res){
    try{
        let playlists = await loadPlaylists();
        res.json(playlists);
    }catch(err){
        console.error(err)
        return res.send(500, "An error occured requesting the playlists");
    }
}

function updatePlaylist(req, res){

    let playlistObj = req.body;
    let playlistObjId = req.body._id;

    if (playlistObjId){
        delete playlistObj._id;
    }
    
     try{
 
        MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
 
            const collection = dbo.collection('playlists');

            if (playlistObjId){
                collection.updateOne({"_id" : ObjectID(playlistObjId) }, { $set: playlistObj },
                function(err, docs){
                    if (err) throw err;
                    playlistObj["_id"] = playlistObjId;
                    res.json(playlistObj);
                }
            );
            }else{
                collection.insertOne(playlistObj,
                function(err, docs){
                    if (err) throw err;
                    playlistObj["_id"] = docs.insertedId.toString();
                    res.json(playlistObj);
                });
            }
                
          });
 
    }catch(error){
        console.error(error.stack);
        res.send(403, "Something went wrong getting the users.");
    }
}

function removePlaylist(req, res){
    try{

        var playlistId = req.params.playlistId;
        
        MongoClient.connect(MongoUrl, function(err, db) {
    
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
    
            const collection = dbo.collection('playlists');
    
            collection.deleteOne(
              {
                  "_id" : ObjectID(playlistId)
              },
              function(err, result){
                if (err) throw err;
                res.json({"success" : true});
              });
          });

    }catch(err){
        console.error(error)
        res.send(500, "An error occured adding a team member: " + JSON.stringify(req.body) );
    }
}

module.exports = {
    addPlaylist,
    getPlaylists,
    loadPlaylists,
    updatePlaylist,
    removePlaylist
}