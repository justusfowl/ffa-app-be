
var coachCtrl = require('../controllers/coach.controller');
var jwt = require('jsonwebtoken');
const config = require('../../config/config');
var sockets = {};

sockets.init = function (server) {

    var io = require('socket.io').listen(server);

    require('socketio-auth')(io, {
      authenticate: async (socket, data, callback) => {

        console.log('socket connected, waiting for authentication | ' + socket.id);

        const { token } = data;
    
        jwt.verify(token, config.auth.jwtsec, function(err, decoded) {
          if (err){
            if (err.name == "TokenExpiredError"){
              return callback({ message: 'EXPIRED' , status : 440});
            }else{
              return callback({ message: 'UNAUTHORIZED' });
            }
            
          }else{
            socket["userId"] = decoded._id;
            return callback(null, true);
          }
        });

      },
      postAuthenticate: (socket) => {
        console.log(`Socket ${socket.id} authenticated.`);
      },
      disconnect: (socket) => {
        console.log(`Socket ${socket.id} disconnected.`);
      },
      timeout: 1000
    });

    io.sockets.on('connection', function (socket) {

        socket.on('coach:ask', async function(inputSessionObj){

          let sessionObj = coachCtrl.getNextQuestion(inputSessionObj);

          if (sessionObj.complete){

            socket.emit('loading', {isLoading: true});

            let flagValidEval = true;
            let error;

            let evaluation = await coachCtrl.getWellbeingEvaluation(socket.userId, sessionObj).catch(err => {
              flagValidEval = false;
              error = err;
            });
            
            if (flagValidEval){

              sessionObj.evaluation = evaluation;

              let s = await coachCtrl.storeSession(socket.userId, sessionObj).catch(err => {
                socket.emit('coach:badcomplete', sessionObj);
              });

              if (typeof(sessionObj._id) == "undefined"){
                sessionObj["_id"] = (s.insertedId).toString()
              }      
  
              socket.emit('coach:complete', sessionObj);

            }else{
              
              socket.emit('coach:badcomplete', sessionObj);
              
            }
           

          }else{
            socket.emit('coach:question', inputSessionObj);
            socket.emit('coach:progress', {perc: inputSessionObj.progress});
          }
            
        })

        // other logic
    });

}

module.exports = sockets;