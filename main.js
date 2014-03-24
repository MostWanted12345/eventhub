//imports && constans
var hapi = require('hapi');
var config = require('./config');
var http = require('http');
var graph = require('fbgraph');
var async = require('async');
var pagesFinderOptions = require('./pagesFinderOptions');

// JSON with all the events by City
var pagesFound = require('./pagesFound');

graph.setAccessToken(config.access_token);

// Global Var
// updated constantly, contains every event on the "menu"
var events = {};
var server, port = 8008;
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


async.each(pagesFinderOptions.cities, function(city, cityCallback) {
	events[city.name] = [];
	async.each(pagesFound[city.name], function(page, pageCallback) {
		graph.get(page.id+"/events", function(err, res) {
			if(res && res.data) {
				async.each(res.data, function(entry, eventCallback) {
					processEvent(entry, city, function() {eventCallback();});
				}, function(err){
          // All events ended
          pageCallback();
        });
			};
		});
	}, function(err) {
    // All pages ended
    console.log("\n\nCITY FINISHED\n\n");
    cityCallback();
  });
}, function(err) {
  // All cities finished
  console.log("\n\nEVERYTHING FINISHED\n\n");

});

/*
graph.search(searchOptions, function(err, res) {
	res.data.forEach(function(entry) {
    processEvent(entry);
	});
});
*/

var get_month = function(id){
  switch(id){
    case '01' : return "JAN";
    case '02' : return "FEV";
    case '03' : return "MAR";
    case '04' : return "APR";
    case '05' : return "MAY";
    case '06' : return "JUN";
    case '07' : return "JUL";
    case '08' : return "AUG";
    case '09' : return "SEP";
    case '10' : return "OCT";
    case '11' : return "NOV";
    case '12' : return "DEC"; 
  }
}

var processEvent = function(entry, city, eventCallback) {
	var now = new Date();
	var end_time = new Date(entry.start_time);

  //for stats only
  var moret10 = 0;
  var lesst10 = 0;

	if(end_time >= now) {

		var event_name = entry.name;
		var	male = 0;
		var female = 0;
		var l_male = [];
		var l_female = [];

		graph.get(entry.id+"/attending?limit=10", function(err, result) {

			async.each(result.data, function(ppl, personCallback){

				graph.get(ppl.id, function(err, response){

					switch(response.gender){
						case 'female' : female++; l_female.push(ppl.id); break;
						case 'male' : male++; l_male.push(ppl.id); break;
					}

          personCallback();
        });
      }, function(err) {
        // All people finished

        var total_ppz = male + female;
        var p_male = Math.round((male / total_ppz)*100);
        var p_female = Math.round((female / total_ppz)*100);

        if(total_ppz >= 10) {
          moret10 += 1;
          events[city.name].push({
            name: event_name,
            id: entry.id,
            total_ppl: total_ppz,
            p_male: p_male,
            male: male,
            p_female: p_female,
            female: female,
            list_male : l_male.slice(0,32),
            list_female : l_female.slice(0,32),
            dataday: entry.start_time.split("-")[2].substring(0,2),
            datamonth: get_month(entry.start_time.split("-")[1])
          });

          console.log(event_name + "\n(M):" + p_male + "%(" + male + ") (F):" + p_female + "%(" + female+ ")\n");
        } else {
          lesst10 += 1;
        }
        



        eventCallback();
      });
    });
	}
  else {
    eventCallback();
  }
}

// Start the server
server.start(function () {
	uri = server.info.uri;
	console.log('Server started at: ' + server.info.uri);
});
