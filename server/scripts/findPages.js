var async = require('async');
var graph = require('fbgraph');
var Page = require('../models/page');
var log = require('../helpers/logger');

var accessToken = require('../../config').facebook.accessToken;
var queries = require('./pageQueries');

graph.setAccessToken(accessToken);

var pagesFound = [];
var LIMIT = 20;

module.exports = function findPages (done) {

  async.eachSeries(queries, function(query, queryDone){
    var searchOptions = {
      q : query.q,
      type : 'page',
      limit: 1000
    };

    graph.search(searchOptions, function(err, res) {
      if(err) {
        return queryDone(err);
      }

      async.eachLimit(res.data, LIMIT, function(entry, pageCallback) {
        var page = {
          name: entry.name,
          category: entry.category,
          id: entry.id,
          query: query
        };

        //log.debug(page, 'found page');

        graph.get(page.id, function(err, res) {
          if(res.location && res.location.country && res.location.country != 'Portugal') {
            return pageCallback(); // ingore pages that are not Portuguese
          }
          pagesFound.push(page);
          
          var newPage = new Page(page);
          newPage.save(function (err){
            if (err) {
              if(err.code == 11000) {
                // Page already exists
                return pageCallback();
              }
              log.error({err: err, page: page}, 'error creating page');
              return pageCallback(err);
            }
              
            log.info({page: page}, 'created a new page');
            pageCallback();
          });
        });

      },function(err){
        if(err) {
          log.error({err: err, query: query}, 'error on query');
          return queryDone(err);
        }
        log.debug({query: query.q}, 'query done');
        queryDone();
      });
    });
  }, function(err){
    if(err) {
      // log.error({err: err}, 'error finding pages');
      return done(err);
    }

    //log.debug(pagesFound);
    done();
  });
};