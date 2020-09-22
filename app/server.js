const express = require('express'); 
const cors = require('cors'); 
const app = express(); 
const http = require('http');
const fs = require("fs");
const path = require('path');
const logger = require('./logger');
var MongoClient = require('mongodb').MongoClient;

var deployment = require('./app/deploy');
// const expressWinston=require('express-winston');


const config = require('./app/config/config');
var MongoUrl = config.getMongoUrl();

const jobController = require('./app/v01/controllers/jobs.controller');

config["baseDirectory"] = __dirname;

const pubDirectory = path.join(__dirname, "pub");

if (!fs.existsSync(pubDirectory)){
  fs.mkdirSync(pubDirectory);
}

var hbs = require( 'express-handlebars');

console.log("Launching...");

app.set('view engine', 'hbs');
app.set('views', path.resolve(__dirname, './app/v01/views/'));

const handlebarOptions = {
  partialsDir: './partials',
  layoutsDir: path.resolve(__dirname, './app/v01/views/') ,
  viewPath: path.resolve(__dirname, './app/v01/views/'),
  extname: '.hbs',
  defaultView: 'default',
  defaultLayout: 'default',
};



app.engine( 'hbs', hbs(handlebarOptions));

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}

const server = http.Server(app);

var sockets = require('./app/v01/sockets/sockets');

var apiRoutes = require('./app/v01/routes/api.routes');
var wbRoutes = require('./app/v01/routes/web.routes');

app.use(cors(corsOptions)); 

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

/*
app.use(expressWinston.logger({
  transports: [logger],
  meta: false,
  msg: `{{req.ip}} - {{res.statusCode}} - {{req.method}} - {{res.responseTime}}ms - {{req.url}} - {{req.headers['user-agent']}}`,
  expressFormat: false,
  colorize: true
}));
*/

app.use('/api/v' + config.APIVersion, apiRoutes);
app.use('/web', wbRoutes);

app.use('/pub', express.static(pubDirectory));

app.use('/', express.static('frontend/dist/ffa-web'));

const buildLocation = 'frontend/dist/ffa-web';
app.use((req, res, next) => {
  if (!req.originalUrl.includes(buildLocation)) {
    res.sendFile(`${__dirname}/${buildLocation}/index.html`);
  } else {
    next();
  }
});

if (config.appSecret.encryptionKey){
  logger.info("APP_ENC_KEY defined")
}else{
  logger.error("no APP_ENC_KEY defined")
  throw new Error("No APP_ENC_KEY was defined.");
  process.exit(1)
}

sockets.init(server);

jobController.init();

server.listen(config.port, () => {
  logger.info('Server started at port !' + config.port);

  MongoClient.connect(MongoUrl, {useUnifiedTopology: true}, function(err, db) {
  
    if (err) throw err;
    
    let dbo = db.db(config.mongodb.database);

    const collection = dbo.collection('config');

    collection.findOne({}, function(error, result){
        if (error){
            throw err;
        }else{

          logger.info("mongoDB connected successfully");
          

          deployment.run();

        }
    });

});

});


