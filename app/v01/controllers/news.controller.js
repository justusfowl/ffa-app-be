
const config = require('../../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var MongoUrl = config.getMongoUrl();

function getNews(req, res){

    try{

        let newsId = req.params.newsId;
        let filterObj;

        if (newsId){
            filterObj = {
                "_id" : ObjectID(newsId)
            }
        }else{
            filterObj = {}
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

module.exports = {
    getNews
}