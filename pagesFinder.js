var graph = require('fbgraph');
var config = require('./config');
var options = require('./pagesFinderOptions');
var async = require('async');
var fs = require('fs');

var myToken = config.access_token;
graph.setAccessToken(myToken);

var pagesFound = {}

async.each(options.cities, function(city, cityCallback){
  pagesFound[city.name] = [];
  //console.log(pagesFound);

  async.each(options.queries, function(query, queryCallback){
    var searchOptions = {
      q : city.name+"+"+query.q,
      type : "page",
      limit: 1000
    }

    graph.search(searchOptions, function(err, res) {
      //console.log("\n\nLooking for ",searchOptions.q+"\n\n")
      async.each(res.data, function(entry, entryCallback) {
        var page = {
          //city: city.name,
          name: entry.name,
          id: entry.id
        }
        graph.get(page.id, function(err, res) {
          if(res.location && res.location.country && res.location.country != "Portugal") {

          } else {
            pagesFound[city.name].push(page);
            //console.log(JSON.stringify(page)+ ",");
          }
          entryCallback();
        })
      },function(err){
        console.log("QUERY ENDED")
        queryCallback();
      });
    });
  }, function(err){
    console.log("CITY ENDED");
    cityCallback();
  });
}, function(err){
  console.log("EVERYTHING ENDED");
  console.log(pagesFound);
  fs.writeFile("pagesFound.json", JSON.stringify(pagesFound), function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The file was saved!");
	    }
	});
});
