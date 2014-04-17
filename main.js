//imports && constans
var hapi = require('hapi');
var config = require('./config');
var http = require('http');
var graph = require('fbgraph');
var async = require('async');
var pagesFinderOptions = require('./pagesFinderOptions');
var pagesFound = require('./pagesFound');

graph.setAccessToken(config.access_token);

var events = {};
var event_name_array = []; // for global check.. it's slow, should be better
var server, port = process.env.PORT || 5000 ;
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
    { method: 'GET', path: '/config', config: { handler: configHandler } },
    { method: 'GET', path: '/{path*}', handler: { directory: { path: './public', listing: true, index: true } } }
];


server = hapi.createServer("0.0.0.0", port, hapiOptions);
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

function configHandler (request, reply) {
    console.log("Changing facebook token: ", request.url.query.token);
    graph.setAccessToken(request.url.query.token);
    runasync();
    console.log("2as");
};


function runasync(){
    async.each(pagesFinderOptions.cities, function(city, cityCallback) {
        events[city.name] = [];
        async.each(pagesFound[city.name], function(page, pageCallback) {
            graph.get(page.id+"/events", function(err, res) {
                if(err) {console.log(err);}

                if(res && res.data) {
                    async.each(res.data, function(entry, eventCallback) {
                        processEvent(entry, city, function() { eventCallback(); });
                    }, function(err){
                        if(err) {console.log(err);}
                        // All events ended
                        pageCallback();
                    });
                }
            });
        }, function(err) {
            if(err) {console.log(err);}
            // All pages ended
            console.log("\n\n\t\t\t\t\tFINISHED SCRAPPING "+city.name+"\n\n");
            cityCallback();
        });
    }, function(err) {
        if(err) {console.log(err);}
        // All cities finished
        console.log("\n\n\t\t\t\t\tFINISHED SCRAPPING EVERYTHING\n\n");
    });
}

// Returns true if element is inside array.. false otherwise
function isInArray(value, array) { return array.indexOf(value) > -1; }

// Substitutes number of month for the name itself (first 3 chars)
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
//var total_event = 0;
var processEvent = function(entry, city, eventCallback) {

	var now = new Date();
	var end_time = new Date(entry.start_time);

	if(end_time >= now) {

		var event_name = entry.name;
        //total_event += 1;
        //console.log(event_name + " " +total_event);
        //if(!isInArray(event_name, event_name_array)){
            event_name_array.push(event_name);
    		var	male = 0;
    		var female = 0;
    		var l_male = [];
    		var l_female = [];

    		graph.get(entry.id+"/attending?limit=10000", function(err, result) {

        		async.each(result.data, function(ppl, personCallback){

    				graph.get(ppl.id, function(err, response){

    					switch(response.gender){
    						case 'female' : female++; l_female.push(ppl.id); break;
    						case 'male' : male++; l_male.push(ppl.id); break;
    					}

                        personCallback();
                    });
                }, function(err) {
                    if(err) {console.log(err);}
                    // All people finished

                    var total_ppz = male + female;
                    var p_male = Math.round((male / total_ppz)*100);
                    var p_female = Math.round((female / total_ppz)*100);

                    if(total_ppz >= 10) {
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
                    }
                    eventCallback();
                });
            });
       // }
    } else {
        eventCallback();
    }
}

// Start the server
server.start(function () {
	console.log('Server started at: ' + server.info.uri);
    runasync();
});
