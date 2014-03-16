var config = require('./config');
var http = require('http');
var graph = require('fbgraph');
var hapi = require('hapi');

var options = {timeout:  5000, pool: { maxSockets:  Infinity }, headers:  { connection:  "keep-alive" }};
var myToken = config.access_token
graph.setAccessToken(myToken);


// With options
// graph.setOptions(options).get("zuck", function(err, res) {
// 	console.log(res); // { id: '4', name: 'Mark Zuckerberg'... }
// });



var get_events = function(callback){
	var searchOptions = {
		q : "lisbon",
		type : "event",
		limit : "10"
	}

	graph.search(searchOptions, function(err, res) {
		callback(res.data);
	});

};



http.createServer(function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});



	get_events(function(events){

		events.forEach(function(entry) {

			graph.get(entry.id+"/attending?limit=10", function(err, result) {


				console.log(JSON.stringify(result.data));
				console.log("blah asdlkajsdlkasjdlasnd lasd klasjd lasjd");



			});

		});
		res.end("LOL");
		//res.end(JSON.stringify(cb));
	});





	//res.end('Hello World\n');
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');
