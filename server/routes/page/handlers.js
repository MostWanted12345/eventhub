var Boom = require('boom');
var graph = require('fbgraph');
var url = require('url');
var Page = require('../../models/page');
var log = require('../../helpers/logger');
var accessToken = require('../../../config').facebook.accessToken;
var scripts = require('../../scripts');

var handlers = module.exports;

handlers.list = function list(request, reply) {
  Page.findAll(function(err, result) {
    if (err) {
      log.error({err: err}, '[page] error listing pages');
      return reply(Boom.badRequest('Unable to find any pages'));
    }
    
    reply(result);
  });
};


handlers.get = function get(request, reply) {
  Page.findById(request.params.id, function(err, result) {
    if (err || !result || result.length < 1) {
      log.error({err: err}, '[page] error getting page %s', request.params.id);
      return reply(Boom.notFound('Unable to find a page with this id'));
    }
    
    reply(result[0]);
  });
};


handlers.create = function create(request, reply) {

  graph.setAccessToken(accessToken);

  // Supports: 
  // https://www.facebook.com/pages/<page name>/<page-id>?ref=br_rs
  // https://www.facebook.com/<page-username>
  var pathStuff = url.parse(request.payload.url).pathname.split('/');
  var pageId = pathStuff[pathStuff.length-1];

  graph.get(pageId, function(err, page) {
    if (err || !page || page === '') {
      log.error({err: err, url: request.payload.url, pageId: pageId, page: page}, 'error getting page data');
      return reply(Boom.badRequest('Error creating page from facebook. Make sure the url is correct'));
    }

    if(page.location && page.location.country && page.location.country != 'Portugal') {
      log.error({err: err, page: page}, '[page] invalid location');
      return reply(Boom.badRequest('Page has an invalid Location'));
    }
    
    page.status = 'suggestion';

    var newPage = new Page(page);
    newPage.save(function (err){
      if (err) {
        if(err.code == 11000) {
          log.error({err: err, url: request.payload.url, page: page}, '[page] duplicate');
          return reply(Boom.conflict('Page already exists on our database'));
        }
        log.error({err: err, url: request.payload.url, page: page}, 'error creating page');
        return reply(Boom.badRequest('Error saving your page'));
      }
        
      log.info({page: newPage}, '[page] created a new page');

      scripts.events.getEventsFromPage(newPage, function (err) {
        if(err) {
          return log.error({err: err, page: newPage}, 'error finding new events for this page');
        }
        log.info({err: err, page: newPage}, 'events search done');
      });

      return reply({success: 'Page created.'});
    });
  });

};
