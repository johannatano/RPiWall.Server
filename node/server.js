var server = require('http').createServer();
var io = require('socket.io')(server);
function SocketServer (){
}
var s = SocketServer;
var p = SocketServer.prototype;

p.start = function(port, onSuccess, onEvent, onUpdate){
	io.on('connection', function(client){
		console.log('CLIENT CONNECTED', client.id);
		onSuccess(client);
		// client.emit('init', initData);
		// io.sockets.broadcast.to(client.id).emit('message', 'for your eyes only');

	  client.on('event', function(event){
	  	onEvent(event.type, event.data);
	  });


	  client.on('update', function(data){
	  	onUpdate(data.type, data.data);
	  });

	  client.on('disconnect', function(){
	  	console.log('CLIENT DISCONNECT', client.id);
	  });
	  
	});
	server.listen(port);
	console.log('Socket server started at port', port)
}

p.emit = function(event, data){
	io.sockets.emit(event, data);
}



module.exports = SocketServer;