
const config = require('../../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');
var MongoUrl = config.getMongoUrl();

var fs = require('fs');
var path = require('path');

var authCtrl = require('./auth.controller');

async function getNews(req, res){

    try{

        let userId = req.userId;
        let flagIsAdmin = false;
        let flagUnpublished = req.query.unpublished;

        if (userId){
            flagIsAdmin = await authCtrl.validateUserScope(userId, "admin");
        }

        let newsId = req.params.newsId;
        let filterObj;

        if (newsId){
            filterObj = {
                "_id" : ObjectID(newsId)
            }
        }else{
            filterObj = {}
        }

        if (!flagIsAdmin){
            filterObj["published"] = "true"
        }else{
            if (!flagUnpublished){
                filterObj["published"] = "true"
            }
        }

        MongoClient.connect(MongoUrl, function(err, db) {
  
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
 
            const collection = dbo.collection('news');
 
            collection.find(filterObj).sort( { date: -1 } ).toArray(function(error, result){
                if (error){
                    throw err;
                }

                if (newsId){
                    if (result.length > 0){
                        res.json(result[0]);
                    }else{
                        res.json({});
                    }
                }else{
                    res.json(result)
                }
            });
                
          });
 
    }catch(error){
        console.error(error.stack);
        res.send(403, "Something went wrong getting the users.");
    }

}; 



function updateNews(req, res){
    try{
        
        let userId = req.userId;

        let newsObj = req.body;
        let newsId = newsObj._id;
        let dateSaved = new Date();

        var file = req.file;

        if (file){
            var fqdn_file = config.getPubExposedDirUrl() + "n/" + file.originalname;
            newsObj["image"] = fqdn_file;
        }
  
        if (!newsId){
          res.send(500, "Please provide newsId");
          return;
        }else{
            delete newsObj._id;
        }

        newsObj["dateSaved"] = dateSaved;
        newsObj["date"] = new Date(newsObj["date"]);
    
        MongoClient.connect(MongoUrl, function(err, db) {
    
          if (err) throw err;
          
          let dbo = db.db(config.mongodb.database);
  
          // Get the documents collection
          const collection = dbo.collection('news');
   
          collection.replaceOne(
            {"_id" : ObjectID(newsId)},
            newsObj,
            function(err, docs){
              if (err) throw err;

              if (docs.ops.length > 0){
                res.json(docs.ops[0]);
              }else{
                res.json({})
              }
              
            });
  
        });
    
      }catch(error){
        console.error(error)
        res.send(500, "An error occured updating the team member: " + JSON.stringify(req.body) );
      }
}

function newNews(req, res){

    try{

        var file = req.file;
        var newsObj = req.body;
        


        try{
            newsObj["date"] = new Date(newsObj["date"]);
            var fqdn_file = config.getPubExposedDirUrl() + "/n/" + file.originalname;
            newsObj["image"] = fqdn_file;

        }catch(err){

        }

        MongoClient.connect(MongoUrl, function(err, db) {
    
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
    
            const collection = dbo.collection('news');
    
            collection.insertOne(
                newsObj,
              function(err, docs){
                if (err) throw err;

                if (docs.ops.length > 0){
                    res.json(docs.ops[0]);
                  }else{
                    res.json({})
                  }
              });
          });

    }catch(err){
        _deleteTmpFile(file.destination+file.originalname);
        console.error(error)
        res.send(500, "An error occured adding a news article: " + JSON.stringify(req.body) );
    }
    
}


function removeNews(req, res){
    try{

        var userId = req.userId;
        var newsId = req.params.newsId;
        
        MongoClient.connect(MongoUrl, function(err, db) {
    
            if (err) throw err;
            
            let dbo = db.db(config.mongodb.database);
    
            const collection = dbo.collection('news');
    
            collection.deleteOne(
              {
                  "_id" : ObjectID(newsId)
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
    getNews, 
    updateNews, 
    newNews, 
    removeNews
}