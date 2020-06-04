
var coachCtrl = require('../controllers/coach.controller');
var deviceCtrl = require('../controllers/device.controller');
var playlistCtrl = require('../controllers/playlist.controller');
var authCtrl = require('../controllers/auth.controller');
var jwt = require('jsonwebtoken');
const config = require('../../config/config');
const logger = require('../../../logger');

var sockets = {};

var devicesRequests = [];

const getAllIndexes = (arr, deviceId) => {
  return arr.map((elm, idx) => elm.deviceId == deviceId ? idx : null) 
}

function makePin(length) {

  let unique = false;
  var result           = '';

  while (!unique) {
    var characters       = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  
    let devIdx = devicesRequests.reduce((c, v, i) => v.pin == result ? c.concat(i) : c, []);
  
    if (devIdx.length < 1){
      unique = true;
    }
  }

  return result;
}


sockets.init = function (server) {

    var io = require('socket.io').listen(server);

    require('socketio-auth')(io, {
      authenticate: async (socket, data, callback) => {

        try{

            if (data.type == 'deviceSetup' && data.deviceId){

              logger.debug('socket connected, waiting for device to respond | ' + socket.id);

              socket["deviceSetup"] = data;

              let devIdx = devicesRequests.reduce((c, v, i) => v.deviceId == data.deviceId ? c.concat(i) : c, []);

              devIdx.forEach(element => {
                devicesRequests.splice(element, 1);
              });

              let storeDeviceRequest = {
                deviceId: data.deviceId, 
                socketId : socket.id, 
                pin : makePin(4)
              };
              
              devicesRequests.push(storeDeviceRequest);

              socket.emit('device:pin', {pin: storeDeviceRequest.pin});          

              return callback(null, true);
              
            }else{
              logger.debug('socket connected, waiting for authentication | ' + socket.id);
            }

            const { token } = data;
        
            jwt.verify(token, config.auth.jwtsec, async function(err, decoded) {
              if (err){
                if (err.name == "TokenExpiredError"){
                  socket.emit('token:expired', {});
                  return callback({ message: 'EXPIRED' , status : 440});
                }else{
                  return callback({ message: 'UNAUTHORIZED' , status : 401});
                }
                
              }else{
                if (decoded.deviceId){
                  socket["deviceId"] = decoded._id;
                  socket["device"] = decoded;

                  let deviceObject = await deviceCtrl.loadDeviceById( decoded._id).catch(err => {
                    throw err
                  });

                  // if no deviceId can be found tell the TV that it has been removed
                  if (!deviceObject){
                    return socket.emit('device:remove', {});
                  }

                }else{
                  socket["userId"] = decoded._id;
                }
                return callback(null, true);
              }
            });

        }catch(err){
          logger.error(err);
        }

      },
      postAuthenticate: async (socket) => {
        try{
          if (socket.device){

            let updateObj = {
              "_id" : socket.device._id, 
              "socketId" : socket.id,
              "online" : true
            };
  
            await deviceCtrl.updateDeviceDatabase(updateObj).then(result => {
              logger.debug(`Updating device successful as online: ${socket.device._id}`);
            }).catch(err => {
              throw err;
            });
  
            socket.broadcast.emit('device:do-reload', {});
  
          }else if (socket.deviceSetup){
            logger.debug(`Socket ${socket.id} is a device in setup-mode.`);
          }else{
            logger.debug(`Socket ${socket.id} authenticated.`);
          }
        }catch(err){
          logger.error(err);
        }        
        
      },
      disconnect: async (socket) => {

        try{
          logger.debug(`Socket ${socket.id} disconnected.`);

          if (socket.device){
  
            let updateObj = {
              "_id" : socket.device._id, 
              "socketId" : null,
              "online" : false
            };
  
            await deviceCtrl.updateDeviceDatabase(updateObj).then(result => {
              logger.debug(`Updating device successful as offline: ${socket.device._id}`);
            }).catch(err => {
              throw err;
            });
  
            socket.broadcast.emit('device:do-reload', {});
  
          }
        }catch(err){
          logger.error(err);
        }        

      },
      timeout: 1000
    });

    io.sockets.on('connection', function (socket) {

      socket.on('device:force-disconnect', async function(){
        socket.disconnect();
      });

      socket.on('device:add', async function (data){

        try{

          let pin = data.pin;
        let title = data.title;
        let userId = socket.userId; 

        let hasScope = await authCtrl.validateUserScope(userId, "admin").catch(err => {
          throw err;
        });

        if (!hasScope){
          return socket.emit('system:unauthorized', {});
        }

        let devIdx = devicesRequests.reduce((c, v, i) => v.pin == pin ? c.concat(i) : c, []);
        let deviceDetails, deviceSocketId;

        if (devIdx.length > 0){
          deviceDetails = devicesRequests[devIdx[0]];
          deviceSocketId = deviceDetails.socketId;
        
          let deviceObj = {
            "title" : title, 
            "deviceId" : deviceDetails.deviceId, 
            "dateAdded" : new Date(), 
            "socketId" : deviceSocketId, 
            "online" : true
          };

          await deviceCtrl.addDevice(deviceObj, socket.userId).then(result => {

            socket.emit('device:add-success', {});

            var deviceToken = jwt.sign(deviceObj, config.auth.jwtsec, {});

            deviceObj["token"] = deviceToken;

            io.to(deviceSocketId).emit('device:successfully-added', deviceObj);

            // remove device-pairing request
            devIdx.forEach(idx => {
              devicesRequests.splice(idx,1);
            });

          }).catch(err => {
            socket.emit('device:add-error', {"message" : "Something went wrong storing the device."});
            throw err;
          });

        }else{
          socket.emit('device:add-error', {"message" : "Device not found - please try pairing again."});
          throw new Error("Device could not be identified")
        }

        }catch(err){
          logger.error(err);
        }

      });

      socket.on('device:update', async function (data){
     
        try{
          if (typeof(data.device) == "undefined"){
            return;
          }

          let userId = socket.userId; 

          let hasScope = await authCtrl.validateUserScope(userId, "admin").catch(err => {
            throw err;
          });
  
          if (!hasScope){
            return socket.emit('system:unauthorized', {});
          }
  
          let device = data.device;
          let _id = device._id;

         let updateObj = {
           "_id" : _id, 
           "title" : device.title || "Unbenannt"
         };

          await deviceCtrl.updateDeviceDatabase(updateObj).then(result => {
            socket.emit('device:update-success', {});
          }).catch(err => {
            socket.emit('device:update-error', {"message" : "Device not found - please try pairing again."});
            throw err;
          });

        }catch(err){
          socket.emit('device:update-error', {"message" : "Something went wrong deleting the device."});
          logger.error(err);
        }
    
      });



      socket.on('device:remove', async function (data){

        try{

          if (typeof(data.device) == "undefined"){
            return socket.emit('device:remove-error', {"message" : "Please provide a device."});
          }

          let userId = socket.userId; 
          let hasScope = await authCtrl.validateUserScope(userId, "admin").catch(err => {
            throw err;
          });
  
          if (!hasScope){
            return socket.emit('system:unauthorized', {});
          }
  
          let device = data.device;
          let _id = device._id;
  
          let deviceObject = await deviceCtrl.loadDeviceById(_id).catch(err => {
            throw err;
          });

          if (!deviceObject){
            return socket.emit('device:remove-error', {"message" : "Device could not be found."});
          }
  
          if (!_id){
            return socket.emit('device:remove-error', {"message" : "Please provide a deviceId."});
          }

          let deviceSocketId = deviceObject.socketId;
  
          await deviceCtrl.removeDeviceDatabase(_id).then(result => {
            
            socket.emit('device:remove-success', {"_id" : _id});
            io.to(deviceSocketId).emit('device:remove', {});
            io.sockets.connected[deviceSocketId].disconnect();

          }).catch(err => {
            throw err;
          });
        }catch(err){
          logger.error(err);
          socket.emit('device:remove-error', {"message" : "Something went wrong deleting the device."});
        }
    
      });

      socket.on('device:reload', async function (data){
        try{

          let userId = socket.userId; 
          let hasScope = await authCtrl.validateUserScope(userId, "admin").catch(err => {
            throw err;
          });
  
          if (!hasScope){
            return socket.emit('system:unauthorized', {});
          }

          let deviceSocketId = data.device.socketId;
          io.to(deviceSocketId).emit('device:reload', {});
        }catch(err){
          logger.error(err);
        }
        
      });

      socket.on('device:get-playlist', async function (){
        try{
          let playlists = await playlistCtrl.loadPlaylists();
          socket.emit('device:playlist', playlists);
        }catch(err){
          logger.error(err);
        }
        
      });    
       
      socket.on('coach:ask', async function(inputSessionObj){

        try{
          let error;

          let sessionObj = coachCtrl.getNextQuestion(inputSessionObj);
  
          if (sessionObj.complete){
  
            socket.emit('loading', {isLoading: true});
  
            let flagValidEval = true;          
  
            let evaluation = await coachCtrl.getWellbeingEvaluation(socket.userId, sessionObj).catch(err => {
              flagValidEval = false;
              error = err;
              throw err;
            });
            
            if (flagValidEval){
  
              sessionObj.evaluation = evaluation;
  
              let s = await coachCtrl.storeSession(socket.userId, sessionObj).catch(err => {
                socket.emit('coach:badcomplete', sessionObj);
                throw err;
              });
  
              if (typeof(sessionObj._id) == "undefined"){
                sessionObj["_id"] = (s.insertedId).toString()
              }      
  
              socket.emit('coach:complete', sessionObj);
  
            }else{
              
              socket.emit('coach:badcomplete', sessionObj);
              
            }
            
          }else if (error){
            socket.emit('coach:error', inputSessionObj);
            throw error;
          }else{
            socket.emit('coach:question', inputSessionObj);
            socket.emit('coach:progress', {perc: inputSessionObj.progress});
          }
        }catch(err){
            logger.error(err);
        }
          
      })
     

    });

}

module.exports = sockets;