const express = require('express'); 
const cors = require('cors'); 
const app = express(); 
const http = require('http');
const fs = require("fs");
const path = require('path');
const config = require('./app/config/config');

config["baseDirectory"] = __dirname;

const pubDirectory = path.join(__dirname, "pub");

if (!fs.existsSync(pubDirectory)){
  fs.mkdirSync(pubDirectory);
}

var hbs = require( 'express-handlebars');

console.log("Launching...")

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

sockets.init(server);

server.listen(config.port, () => {
  console.log('Server started at port !' + config.port);
});
