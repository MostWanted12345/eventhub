//imports && constans
var hapi = require('hapi');
var config = require('./config');
var http = require('http');
var graph = require('fbgraph');

var options = {timeout:  5000, pool: { maxSockets:  Infinity }, headers:  { connection:  "keep-alive" }};

var myToken = config.access_token;
graph.setAccessToken(myToken);

var events = [];
var server, port = 8000;
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
    { method: 'GET', path: '/api', config: { handler: apiHandler } },
    { method: 'GET', path: '/{path*}', handler: {
        directory: { path: './public', listing: true, index: true }
    } }
];

// Create a server with a host, port, and options
server = hapi.createServer('0.0.0.0', port, hapiOptions);
server.route(routes);

// HAPI HANDLER
function homeHandler (request, reply) {
    // Render the view with the custom greeting
    reply.view('index.html', {
			events: events
    });
};

function apiHandler (request, reply) {
    // Render the view with the custom greeting
    reply(events);
};


var searchOptions = {
  q : "lisbon",
  type : "event",
  limit: 15
}

config.pages.forEach(function(page) {
  graph.get(page.id+"/events", function(err, res) {
    //console.log(res); // { id: '4', name: 'Mark Zuckerberg'... }
    res.data.forEach(function(entry) {
      processEvent(entry);
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

function processEvent(entry) {
  var now = new Date();
  var end_time = new Date(entry.start_time);

  if(end_time >= now) {
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

            events.push({
              name: event_name,
              id: entry.id,
              p_male: p_male,
              male: male,
              p_female: p_female,
              female: female,
              ratio: ((female/(male+female))*100)+"%"
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
