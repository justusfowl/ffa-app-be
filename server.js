const express = require('express'); 
const cors = require('cors'); 
const app = express(); 
const http = require('http');

const config = require('./app/config/config');

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}

const server = http.Server(app);

var sockets = require('./app/v01/sockets/sockets');

var routes = require('./app/v01/routes/index.routes');

app.use(cors(corsOptions)); 

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use('/api/v' + config.APIVersion, routes);

sockets.init(server);

server.listen(config.port, () => {
  console.log('Server started!');
});

