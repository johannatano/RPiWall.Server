var express = require('express')
var SocketServer = require('./server')
var MongooseDB = require('./db')

var app = express()
app.set('port', (process.env.PORT || 5000))



/* DATABASE SETUP */

var db = new MongooseDB();

var uristring = process.env.MONGODB_URI || 'mongodb://johanna:annahoj@ds159963.mlab.com:59963/heroku_jm3b1q8n'
db.connect(uristring, onDBConnect, onDBError);

/* SOCKET SERVER SETUP */
var socketServer = new SocketServer();


/* APP */

var tilesData = [];

function onDBConnect(){
  

  socketServer.start(3000, onClientConnection, onSocketEvent, onSocketUpdate);
}

function onDBError(err){
  console.log(err);
}


function getTileDataByID(id){
  for(var i = 0; i < tilesData.length; i++){
    if(tilesData[i].id == id) return tilesData[i];
  }
}


function onClientConnection(client){


  db.getTiles(function(result){
    // console.log(result);
    client.emit('init', result);
  }, function(err){});
}

function onSocketEvent(type, data){


  switch(type){
    case "reboot":
    socketServer.emit('rpi:reboot');
    console.log('RPI reboot');
    break;
    case "restart_app":
    socketServer.emit('rpi:restart_app');
    console.log('RPI restart_app');
    break;

    case "restart_playback":
    socketServer.emit('rpi:restart_playback');
    console.log('RPI restart_playback');
    break;

    case "update_source":
    socketServer.emit('rpi:update_source');
    console.log('RPI update_source');
    break;

    case "stop":
    socketServer.emit('rpi:stop:' + data.id);
    console.log('RPI stop', data.id);
    break;

    case "start":
    socketServer.emit('rpi:start:' + data.id);
    console.log('RPI start', data.id);
    break;
  }
}

function onSocketUpdate(type, data){
  switch(type){
    case "set:tile_data:settings":
      for(var i = 0; i < data.length; i++){
        var id = data[i].id;
        // var currentTileData = getTileDataByID(id);

        console.log(data[i]);

        db.setTile(data[i], function(success){
          console.log('Tile successfuly updated');
        }, function(err){});

        console.log('changed:tile_data:' + id + ':settings')
        socketServer.emit('changed:tile_data:' + id + ':settings', data[i])
      }
      
      break;

      case "set:tile_data:status":

      for(var i = 0; i < data.length; i++){
        data[i].lastSeen = new Date().getTime()/1000;
          db.setTile(data[i], function(success){
          }, function(err){});
        }
        default:
      }
    }

    function ping(){
      db.getTiles(function(result){
        tilesData = result;
        socketServer.emit('tiles_data', result);
      }, function(err){});
    }

    setInterval(ping, 5000);


    app.use('/', express.static(__dirname + '/public'))
    app.listen(app.get('port'), function() {
      console.log("Node app is running at localhost:" + app.get('port'))
    })

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
// mongoose.connect(uristring, function (err, res) {
//   if (err) { 
//     console.log ('ERROR connecting to: ' + uristring + '. ' + err);
//   } else {
//     console.log ('Succeeded connected to: ' + uristring);
//   }
// });

// var RPITileSchema = new mongoose.Schema({
//   settings: {
//     server: String,
//     port: Number,
//     show: { x: Number, y: Number, w: Number, h: Number }
//   },
//   lastSeen:Number,
//   IP: String,
//   id: Number
// });

// var Tile = mongoose.model('Tiles', RPITileSchema);


// var SOCKET_PORT = 3000;

// io.on('connection', function(socket){
//   socket.on('event', function(data){});
//   socket.on('disconnect', function(){});
//   socket.on('update', function(data){
//     console.log(data);
//   });
// });
// server.listen(SOCKET_PORT);

// console.log('Socket Server running at port ' + SOCKET_PORT);


// var tile_1 = new Tile ({
//   settings: {
//     server: "",
//     port: 7777,
//     show: { x: 0, y: 0, w: 1, h: 1 }
//   },
//   lastSeen: 0,
//   IP: "0.0.0.0",
//   id: 1
// });

// tile_1.save(function (err) {if (err) console.log ('Error on save!')});






