var App = function(){

};

var s = App;
var p = s.prototype;

var socket = io('http://localhost:3000');
// var socket = io('https://nelly-party.herokuapp.com:3000');
var tiles = [];


var numRows = 3;
var numCols = 5;
var COL_SIZE = 1/numCols;
var ROW_SIZE = 1/numRows;

p.init = function(){
	socket.on('connect', this.onConnected.bind(this));
	
};



p.addEventListeners = function(){
	$('.reboot').on('click', function(){
		socket.emit('event', {type: 'reboot'});
	});
	$('.restart-app').on('click', function(){
		socket.emit('event', {type: 'restart_app'});
	});
	$('.restart-playback').on('click', function(){
		socket.emit('event', {type: 'restart_playback'});
	});
	$('.update-source').on('click', function(){
		socket.emit('event', {type: 'update_source'});
	});


	$('.stop').on('click', function(event){
		var id = $(event.target).parent().attr('data-id');
		console.log(id);
		socket.emit('event', {type: 'stop', data: {id: id}});

		$('.start', $(event.target).parent()).removeClass('hidden');
		$('.stop', $(event.target).parent()).addClass('hidden');
	})

	$('.start').on('click', function(event){
		var id = $(event.target).parent().attr('data-id');
		console.log(id);
		socket.emit('event', {type: 'start', data: {id: id}});

		$('.start', $(event.target).parent()).addClass('hidden');
		$('.stop', $(event.target).parent()).removeClass('hidden');
	})


	$('.update').on('click', function(event){
		var id = $(event.target).parent().parent().attr('data-id');
		var form = $(event.target).parent();

		var xVal = $('.show-area-x', form).val();
		if(!xVal) xVal = 1; 
		var x = (xVal-1)*COL_SIZE;

		var yVal = $('.show-area-y', form).val();
		if(!yVal) yVal = 1;
		var y = (yVal-1)*ROW_SIZE;


		var data = [{
			settings: {
				server: "",
				port: 7777,
				show: { x: x, y: y, w: x + COL_SIZE, h: y +  ROW_SIZE}
			},
			id: id
		}]



		socket.emit('update', {type: 'set:tile_data:settings', data: data});

	})

}

p.removeEventListeners = function(){
	$('.reboot').off();
	$('.restart-app').off();
	$('.restart-playback').off();
	$('.update-source').off();
	$('.stop').off();
	$('.start').off();
	$('.update').off();
}
p.onConnected = function(){	

	console.log('connected to socket');
	console.log(this);

	$('.connection-status').html('Connected');
	$('.connection-status').addClass('ok');

	socket.on('disconnect', function(data){
		this.removeEventListeners();
	}.bind(this));

	socket.on('init', function(data){

		$('#dashboard .IP').addClass('error');
		var tileDom;

		data.sort(function(a, b){
			return a.id - b.id;
		});


		var now = new Date().getTime();

		for(var i in data){
			var id = data[i].id;
			// console.log(data[i]);
			var tileDom = $('#dashboard .tiles .tile-' + id);
			if(!tileDom.get(0)){
				tileDom = $('<div data-id="'+id+'" class="tile tile-'+id+'"><p class="id">ID</p><span class="IP indicator">XX:XX:XX:XX</span><p class="time">TIDEN</p><p class="data"></p><div class="settings"><label>X&nbsp;&nbsp;</label><input class="show-area-x"><label>&nbsp;&nbsp;Y&nbsp;&nbsp;</label><input class="show-area-y">&nbsp;&nbsp;<div class="update btn btn-success">Update</div></div><div class="stop btn btn-danger">Stop</div><div class="start hidden btn btn-success">Start</div></div>');
				$('#dashboard .tiles').append(tileDom);
			}

			$('.IP', tileDom).text(data[i].IP);
			$('.id', tileDom).html(data[i].id);

			var date = new Date(data[i].lastSeen*1000);
			var hours = date.getHours();
			var minutes = "0" + date.getMinutes();
			var seconds = "0" + date.getSeconds();
			var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
			if(now - date.getTime() < 5000) $('.IP', tileDom).addClass('ok');
			$('.time', tileDom).html(formattedTime);


				if(data[i].settings){
					console.log(data[i].id, data[i].settings.show.x);

			$('.show-area-x', tileDom).val((data[i].settings.show.x/COL_SIZE) + 1);
			$('.show-area-y', tileDom).val((data[i].settings.show.y/ROW_SIZE) + 1);
				
			}

			//console.log(data[i].id, data[i].settings.show.x);

			// $('.show-area-x', tileDom).val((data[i].settings.show.x/COL_SIZE) + 1);
			// $('.show-area-y', tileDom).val((data[i].settings.show.y/ROW_SIZE) + 1);
			

		}


		this.addEventListeners();

	}.bind(this))

	socket.on('tiles_data', function(data){

		console.log('GET TILES DATA');
		$('#dashboard .IP').addClass('error');
		var tileDom;

		data.sort(function(a, b){
			return a.id - b.id;
		});


		var now = new Date().getTime();

		for(var i in data){
			var id = data[i].id;
			// console.log(data[i]);
			var tileDom = $('#dashboard .tiles .tile-' + id);
			// if(!tileDom.get(0)){
			// 	tileDom = $('<div class="tile tile-'+id+'"><p class="id">ID</p><span class="IP indicator">XX:XX:XX:XX</span><p class="time">TIDEN</p><p class="data"></p><div class="stop btn btn-danger">Stop</div></div>');
			// 	$('#dashboard .tiles').append(tileDom);
			// }

			$('.IP', tileDom).text(data[i].IP);
			$('.id', tileDom).html(data[i].id);

			// $('.show-area-col', tileDom).val(data[i].settings.show.x);
			// $('.show-area-row', tileDom).val(data[i].settings.show.y);

			var date = new Date(data[i].lastSeen*1000);
			var hours = date.getHours();
			var minutes = "0" + date.getMinutes();
			var seconds = "0" + date.getSeconds();
			var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
			if(now - date.getTime() < 5000) $('.IP', tileDom).addClass('ok');
			$('.time', tileDom).html(formattedTime);
		}

	})

	
	// var data = [{
	// 	settings: {
	// 		server: "",
	// 		port: 7777,
	// 		show: { x: 0, y: 0, w: 1, h: 1 }
	// 	},
	// 	lastSeen: 0,
	// 	IP: "1.1.1.8",
	// 	id: 5
	// }]

	// socket.emit('update', {type: 'set:tile_data:settings', data: data});

	
}


function formatDate(date, format, utc) {
	var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

	function ii(i, len) {
		var s = i + "";
		len = len || 2;
		while (s.length < len) s = "0" + s;
		return s;
	}

	var y = utc ? date.getUTCFullYear() : date.getFullYear();
	format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
	format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
	format = format.replace(/(^|[^\\])y/g, "$1" + y);

	var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
	format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
	format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
	format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
	format = format.replace(/(^|[^\\])M/g, "$1" + M);

	var d = utc ? date.getUTCDate() : date.getDate();
	format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
	format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
	format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
	format = format.replace(/(^|[^\\])d/g, "$1" + d);

	var H = utc ? date.getUTCHours() : date.getHours();
	format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
	format = format.replace(/(^|[^\\])H/g, "$1" + H);

	var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
	format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
	format = format.replace(/(^|[^\\])h/g, "$1" + h);

	var m = utc ? date.getUTCMinutes() : date.getMinutes();
	format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
	format = format.replace(/(^|[^\\])m/g, "$1" + m);

	var s = utc ? date.getUTCSeconds() : date.getSeconds();
	format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
	format = format.replace(/(^|[^\\])s/g, "$1" + s);

	var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
	format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
	f = Math.round(f / 10);
	format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
	f = Math.round(f / 10);
	format = format.replace(/(^|[^\\])f/g, "$1" + f);

	var T = H < 12 ? "AM" : "PM";
	format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
	format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));

	var t = T.toLowerCase();
	format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
	format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));

	var tz = -date.getTimezoneOffset();
	var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
	if (!utc) {
		tz = Math.abs(tz);
		var tzHrs = Math.floor(tz / 60);
		var tzMin = tz % 60;
		K += ii(tzHrs) + ":" + ii(tzMin);
	}
	format = format.replace(/(^|[^\\])K/g, "$1" + K);

	var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
	format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
	format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);

	format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
	format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);

	format = format.replace(/\\(.)/g, "$1");

	return format;
};

$(document).ready(function() {
	var app = new App();
	app.init();
});
