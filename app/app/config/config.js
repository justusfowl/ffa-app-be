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

    hostExposedPort : process.env.HOST_EXPOSED_PORT,
    hostBase :  process.env.HOST_BASE,
    hostProto : process.env.HOST_PROTO,
    hostPubDir : process.env.HOST_EXPOSED_PUB_DIR,

    APIVersion: process.env.API_V,

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
      smtpEmail : process.env.SMTP_EMAIL,
      smtpEmailSenderName : process.env.SMTP_EMAIL_SENDER_NAME, 
      backofficeEmailReceiver : process.env.BACKOFFICE_EMAIL_RECEIVE
    }, 

    tele : {
      loginUrl : process.env.TELE_LOGIN_URL, 
      apiBase : process.env.TELE_API_BASE, 
      dialInDoc: process.env.TELE_URL_BASE_DIAL_DOC, 
      dialInPatient: process.env.TELE_URL_BASE_DIAL_PATIENT,
      tenantId : process.env.TELE_TENANT_ID, 
      tenantAlias : process.env.TELE_TENANT_ALIAS, 
      userAlias : process.env.TELE_USER_ALIAS, 
      symmetricUserKeyHash : process.env.TELE_SYMMETRIC_KEY_HASH, 
      userGroupId: process.env.TELE_USER_GROUP_ID
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

  function getPubExposedDirUrl(){

    var url = config.hostProto + "://" + config.hostBase;

    if (config.hostExposedPort != 443){
      url += ":" + config.hostExposedPort;
    }

    url += "/" + config.hostPubDir ;

    url += "/" ;

    return url;
      
  }


  config["getMongoUrl"] = getMongoUrl;
  config["getPubExposedDirUrl"] = getPubExposedDirUrl


  
  module.exports = config;
