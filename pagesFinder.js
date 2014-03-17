var graph = require('fbgraph');
var config = require('./config');
var options = require('./pagesFinderOptions');

var myToken = config.access_token;
graph.setAccessToken(myToken);


options.cities.forEach(function(city){
  options.queries.forEach(function(query){
    var searchOptions = {
      q : city.name+"+"+query.q,
      type : "page",
      limit: 1000
    }

    graph.search(searchOptions, function(err, res) {
      //console.log("\n\nLooking for ",searchOptions.q+"\n\n")
      res.data.forEach(function(entry) {
        var page = {
          //city: city.name,
          name: entry.name,
          id: entry.id
        }
        graph.get(page.id, function(err, res) {
          if(res.location && res.location.country && res.location.country != "Portugal") {

          } else {
            console.log(JSON.stringify(page)+ ",");
          }
        })

        //console.log(entry)

      });
    });
  });
});
