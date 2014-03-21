//imports && constans
var hapi = require('hapi');
var config = require('./config');
var http = require('http');
var graph = require('fbgraph');
var pagesFinderOptions = require('./pagesFinderOptions');

// JSON with all the events by City
var pagesFound = require('./pagesFound');

graph.setAccessToken(config.access_token);

// Global Var
// updated constantly, contains every event on the "menu"
var events = {};
var server, port = 8000;
var hapiOptions = {			
    views: {
        path: 'templates',
        engines: { html: 'handlebars' },
        partialsPath: 'partials'
    }
};

var routes = [
    { method: 'GET', path: '/', config: { handler: homeHandler } },
    { method: 'GET', path: '/api', config: { handler: apiHandler } },
    { method: 'GET', path: '/{path*}', handler: { directory: { path: './public', listing: true, index: true } } }
];

// Create a server with a host, port, and options
server = hapi.createServer('0.0.0.0', port, hapiOptions);
server.route(routes);


function homeHandler (request, reply) {
    reply.view('index.html', {
      cities: pagesFinderOptions.cities
    });
};

function apiHandler (request, reply) {
    console.log("RESQUEST ON API FOR: ", request.url.query.c);
    reply(events[request.url.query.c]);
};


var searchOptions = {
	q : "lisbon",
	type : "event",
	limit: 15
}


pagesFinderOptions.cities.forEach(function(city) {
	events[city.name] = [];
	pagesFound[city.name].forEach(function(page) {
		graph.get(page.id+"/events", function(err, res) {
			if(res && res.data) {
				res.data.forEach(function(entry) {
					processEvent(entry, city);
				});
			};
		});
	});
});

/*
graph.search(searchOptions, function(err, res) {
	res.data.forEach(function(entry) {
    processEvent(entry);
	});
});
*/

var processEvent = function(entry, city) {
	var now = new Date();
	var end_time = new Date(entry.start_time);

	if(end_time >= now) {

		var event_name = entry.name;
		var	male = 0;
		var female = 0;
		var l_male = [];
		var l_female = [];

		graph.get(entry.id+"/attending?limit=1000", function(err, result) {

			var counter = 0;

			result.data.forEach(function(ppl){

				graph.get(ppl.id, function(err, response){

					counter++;
					switch(response.gender){
						case 'female' : female++; l_female.push(ppl.id); break;
						case 'male' : male++; l_male.push(ppl.id); break;
					}

					if(counter == result.data.length){

						var total_ppz = male + female;
						var p_male = Math.round((male / total_ppz)*100);
						var p_female = Math.round((female / total_ppz)*100);

						events[city.name].push({
							name: event_name,
							id: entry.id,
							total_ppl: total_ppz,
							p_male: p_male,
							male: male,
							p_female: p_female,
							female: female,
							list_male : l_male.slice(0,32),
							list_female : l_female.slice(0,32)
						});
						console.log(event_name + "\n(M):" + p_male + "%(" + male + ") (F):" + p_female + "%(" + female+ ")\n");
					}
				});
			});
		});
	}
}

// Start the server
server.start(function () {
	uri = server.info.uri;
	console.log('Server started at: ' + server.info.uri);
});
