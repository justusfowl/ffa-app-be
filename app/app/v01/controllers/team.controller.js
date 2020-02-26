
const config = require('../../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var MongoUrl = config.getMongoUrl();

var fs = require('fs');
var path = require('path');

var authCtrl = require('./auth.controller');

async function getTeam(req, res){

    try{

        let userId = req.userId;
        let flagIsAdmin = false;
        let flagAlsoInActive = false;

        if (userId){
            flagIsAdmin = await authCtrl.validateUserScope(userId, "admin");
        }

        if (flagIsAdmin){
            if (req.query.includeInactive){
                flagAlsoInActive = true; 
            }
        }

        let docs = await _getActiveTeam('doc', flagAlsoInActive);
        let mfa = await _getActiveTeam('mfa', flagAlsoInActive);

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

function _getActiveTeam(type, flagAlsoInActive=false){
    return new Promise((resolve, reject) => {

        MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
 
            const collection = dbo.collection('team');

            let filterObj = {
                "type" : type
            }

            if (!flagAlsoInActive){
                filterObj["flagActive"] = true
            }
 
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

function updateMember(req, res){
    try{
  
        let memberObj = req.body;
        let memberId = memberObj._id;
  
        if (!memberId){
          res.send(500, "Please provide memberId");
          return;
        }
    
        MongoClient.connect(MongoUrl, function(err, db) {
    
          if (err) throw err;
          
          let dbo = db.db(config.mongodb.database);
  
          // Get the documents collection
          const collection = dbo.collection('team');
  
          if (memberObj._id){
            delete memberObj._id
        }
  
          collection.replaceOne(
            {"_id" : ObjectID(memberId)},
            memberObj,
            function(err, docs){
              if (err) throw err;
              res.json(docs);
            });
  
        });
    
      }catch(error){
        console.error(error)
        res.send(500, "An error occured updating the team member: " + JSON.stringify(req.body) );
      }
}

function addMember(req, res){

    try{

        var file = req.file;
        var teamMember = req.body;
        var fqdn_file = config.getPubExposedDirUrl() + "/a/" + file.originalname;

        teamMember["picture"] = fqdn_file;

        MongoClient.connect(MongoUrl, function(err, db) {
    
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
    
            const collection = dbo.collection('team');
    
            collection.insertOne(
              teamMember,
              function(err, result){
                if (err) throw err;
                res.json(result);
              });
          });

    }catch(err){
        _deleteTmpFile(file.destination+file.originalname);
        console.error(error)
        res.send(500, "An error occured adding a team member: " + JSON.stringify(req.body) );
    }
    
}

function removeTeam(req, res){
    try{

        var userId = req.userId;
        var teamId = req.params.memberId;
        
        MongoClient.connect(MongoUrl, function(err, db) {
    
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
    
            const collection = dbo.collection('team');
    
            collection.deleteOne(
              {
                  "_id" : ObjectID(teamId)
              },
              function(err, result){
                if (err) throw err;
                res.json(result);
              });
          });

    }catch(err){
        console.error(error)
        res.send(500, "An error occured adding a team member: " + JSON.stringify(req.body) );
    }
}


function _deleteTmpFile(path){
    try {
        fs.unlinkSync(path)      
    } catch(err) {
        console.error(err)
    }
}

module.exports = {
    getTeam, 
    updateMember,
    addMember,
    removeTeam
}