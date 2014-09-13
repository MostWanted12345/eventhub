var async = require('async');
var graph = require('fbgraph');
var Page = require('../models/page');
var Event = require('../models/event');
var log = require('../helpers/logger');

var accessToken = require('../../config').facebook.accessToken;

graph.setAccessToken(accessToken);

var LIMIT = 50;
var SAMPLE_MAX_SIZE = 200;
module.exports = function findPages (done) {

  Page.findAll(function(err, pages) {
    if (err) {
      log.error({err: err}, '[page] error listing pages');
      return done (err);
    }

    log.debug('got %s pages', pages.length);

    async.eachSeries(pages, function(page, pageDone){

    log.debug('getting events from page', page);

      graph.get(page.id+'/events', function(err, res) {
        if(err || !res || !res.data) {
          return pageDone(err);
        }

        async.eachLimit(res.data, LIMIT, function(eventInfo, eventCallback) {
          processEvent(eventInfo, eventCallback);
        }, pageDone);
      });
    }, function(err){
      if(err) {
        // log.error({err: err}, 'error finding events');
        return done(err);
      }

      done();
    });
  });
};

var processEvent = function(eventInfo, eventCallback) {

  var now = new Date();
  var endTime = new Date(eventInfo.start_time);

  if(endTime < now) {
    return eventCallback();
  }

  var totalAttendes = [];
  var attendeesSample = [];
  var maleAttendees = [];
  var femaleAttendees = [];

  log.debug('processing event', eventInfo);

  graph.get(eventInfo.id+'/attending?limit=10000', function(err, result) {

    log.debug('got ‰s attendees:', eventInfo.name, result.data.length);

    totalAttendes = result.data;
    attendeesSample = result.data;
    
    if(attendeesSample.length > SAMPLE_MAX_SIZE) {
      attendeesSample = attendeesSample.slice(0, SAMPLE_MAX_SIZE);
    }

    async.eachLimit(attendeesSample, LIMIT, function(attendee, personCallback){

      log.debug('getting %s', attendee.name);

      graph.get(attendee.id, function(err, person){
        if(err) {
          return personCallback(err);
        }

        switch(person.gender) {
          case 'female' : 
            femaleAttendees.push(person.id); 
          break;
          case 'male' : 
            maleAttendees.push(person.id); 
          break;
        }

        personCallback();
      });
    }, 
    function gotAllAttendees(err) {
      if(err) {
        return eventCallback(err);
      }
      
      if(totalAttendes.length < 10) {
        // ignore small events
        return eventCallback();
      }

      var malePertentage = Math.round((maleAttendees.length / attendeesSample.length)*100);
      var femalePercentage = Math.round((femaleAttendees.length / attendeesSample.length)*100);

      var newEvent = new Event({
        id: eventInfo.id,
        name: eventInfo.name,
        attending: totalAttendes.length,
        malePertentage: malePertentage,
        femalePercentage: femalePercentage,
        maleAttendees : maleAttendees,
        femaleAttendees : femaleAttendees,
        date: eventInfo.start_time,
        updated: Date.now()
      });

      newEvent.save(function (err){
        if (err) {
          if(err.code == 11000) {
            // Page already exists
            return eventCallback();
          }
          log.error({err: err, event: eventInfo}, 'error creating event');
          return eventCallback(err);
        }
          
        log.info({event: eventInfo}, 'created a new event');
        eventCallback();
      });

      log.debug(eventInfo.name + '\n(M):' + malePertentage + '%(' + maleAttendees.length + ') (F):' + femalePercentage + '%(' + femaleAttendees.length+ ')\n');  
    });
  });
};
