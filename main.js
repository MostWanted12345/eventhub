var hapi = require('hapi');
var config = require('./config');
var http = require('http');
var graph = require('fbgraph');


var options = {timeout:  5000, pool: { maxSockets:  Infinity }, headers:  { connection:  "keep-alive" }};
var myToken = config.access_token;
graph.setAccessToken(myToken);


var server,
    port = 8000;

var hapiOptions = {
    views: {
        path: 'templates',
        engines: {
            html: 'handlebars'
        },
        partialsPath: 'partials'
    }
};

var routes = [
    { method: 'GET', path: '/', config: { handler: homeHandler } },
    { method: 'GET', path: '/{path*}', handler: {
        directory: { path: './public', listing: true, index: true }
    } }
];

// Create a server with a host, port, and options
server = hapi.createServer('0.0.0.0', port, options);

server.route(routes);

// Start the server
server.start(function () {
    uri = server.info.uri;
    console.log('Server started at: ' + server.info.uri);
});

// HAPI HANDLER
function homeHandler (request, reply) {
    // Render the view with the custom greeting
    reply.view('index.html', {
			events: {}
    });
};


var searchOptions = {
		q : "lisbon",
		type : "event",
		limit : "15"
	}


graph.search(searchOptions, function(err, res) {
	res.data.forEach(function(entry) {

	  var event_name = entry.name;
		var	male = 0;
		var female = 0;

		graph.get(entry.id+"/attending?limit=250", function(err, result) {

			var counter = 0;

			result.data.forEach(function(ppl){

				graph.get(ppl.id, function(err, response){
					counter++;

					switch(response.gender){
						case 'female' : female++; break;
						case 'male' : male++; break;
					}

					if(counter == result.data.length){
						var total_ppz = male + female;
						var p_male = Math.round((male / total_ppz)*100);
						var p_female = Math.round((female / total_ppz)*100);

						console.log(event_name + "\n(M):" + p_male + "%(" + male + ") (F):" + p_female + "%(" + female+ ")\n");
					}
				});
			});
		});
	});
});
