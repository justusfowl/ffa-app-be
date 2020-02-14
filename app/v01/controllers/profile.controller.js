
const config = require('../../config/config');
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var MongoUrl = config.getMongoUrl();


function updateUser(req, res){

    // @TODO check for admin privileges 

   let targetUserId = req.userId;

   let targetUser = req.body.user;
   
    // remove userId for update to work
   if (targetUser._id){
       delete targetUser._id;
   }

   // remove token if passed
   if (targetUser.token){
        delete targetUser.token;
    }

   // remove username, prevent changing of the email address
   if (targetUser.userName){
        delete targetUser.userName;
   }

    if (Object.keys(targetUser).length == 0){
        res.json({"message" : "ok"});
        return;
    }
   
    try{

       MongoClient.connect(MongoUrl, function(err, db) {
 
           if (err) throw err;
           
           let dbo = db.db(config.mongodb.database);

           const collection = dbo.collection('users');

           collection.updateOne(
               {
                   "_id" : ObjectID(targetUserId)
               }, 
               {
                   $set: targetUser
               },
               function(err, docs){
                   res.json({"message" : "ok"});
               }
           );
               
         });

   }catch(error){
       console.error(error.stack);
       res.send(403, "Something went wrong getting the users.");
   }

}

module.exports = { updateUser }