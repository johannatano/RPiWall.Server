var mongoose = require ("mongoose")





function MongooseDB (){
}
var s = MongooseDB;
var p = MongooseDB.prototype;

var RPITileSchema = new mongoose.Schema({
	settings: {
		server: String,
		port: Number,
		show: { x: Number, y: Number, w: Number, h: Number }
	},
	lastSeen:Number,
	IP: String,
	id: Number
});

var Tile = mongoose.model('Tiles', RPITileSchema);


p.connect = function(uri, onConnect, onError){


	function spawnTiles(){
		// for(var i = 0; i < 16; i++){
			var data = {
				settings: {
					server: "",
					port: 7777,
					show: { x: 0, y: 0, w: 1, h: 1 }
				},
				lastSeen: 0,
				IP: "0.0.0.0",
				id: 0
			};
			
			var query = {'id':data.id};
			Tile.findOneAndUpdate(query, data, {upsert:true}, function(err, doc){});
		// }
	}


	spawnTiles();


	mongoose.connect(uri, function (err, res) {
		if (err) { 
			console.log ('ERROR connecting to: ' + uri + '. ' + err);
			onError();
		} else {
			console.log ('Succeeded connected to: ' + uri);
			onConnect();
		}
	});
}

p.getTiles = function(onResult, onError){
	Tile.find(function (err, tiles) {
		if (err) onError(err);
		onResult(tiles);
	})
}

p.setTile = function(data, onSuccess, onError){
	var query = {'id': Number(data.id)};
	Tile.findOneAndUpdate(query, data, {upsert:false}, function(err, doc){
		if (err) onError(err);
		onSuccess();
	});
}



module.exports = MongooseDB;



// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.





