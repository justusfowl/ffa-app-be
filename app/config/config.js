require('dotenv').config();

let env = (process.env.NODE_ENV).toLowerCase() || 'development'; 

var port;

if (env == 'development'){
  port = process.env.PORT || 8000;

}
else if (env == 'production'){
  port = process.env.PORT || 80;
}else{
  port = 8000;
}

const config = {
    env: env,
    port: port,
    APIVersion: '01',

    mongodb: {
      username: process.env.MONGO_USER,
      password: process.env.MONGO_PASS,
      database: process.env.MONGO_DB,
      host: process.env.MONGO_HOST, 
      port : process.env.MONGO_PORT 
    },

    auth: {
      jwtsec : process.env.JWT_TOKEN_SEC, 
      expiresIn:  process.env.JWT_EXPIRY_MILLISEC
    },
    procBackend : {
      host: process.env.PROC_BACKEND_HOST,
      port : process.env.PROC_BACKEND_PORT,
    },

    email : {
      smtpServer : process.env.SMTP_SERVER,
      smtpPass : process.env.SMTP_PASS,
      smtpEmail : process.env.SMTP_EMAIL
    }

  };


  function getMongoUrl(){

    var url = "mongodb://" + 
    config.mongodb.username + ":" + 
    config.mongodb.password + "@" + 
    config.mongodb.host + ":" + config.mongodb.port +"/" + 
    config.mongodb.database + "?authSource=" + config.mongodb.database + "&w=1" ;

    return url; 

  }


  config["getMongoUrl"] = getMongoUrl


  
  module.exports = config;
