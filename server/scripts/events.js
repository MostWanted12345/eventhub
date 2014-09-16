var async = require('async');
var graph = require('fbgraph');
var Page = require('../models/page');
var Event = require('../models/event');
var log = require('../helpers/logger');

var accessToken = require('../../config').facebook.accessToken;

graph.setAccessToken(accessToken);

var LIMIT = 50;
var SAMPLE_MAX_SIZE = 200;

exports = module.exports;

exports.getAllEvents = function (done) {
  Page.findAll(function(err, pages) {
    if (err) {
      log.error({err: err}, '[page] error listing pages');
      return done (err);
    }

    // log.debug('got %s pages', pages.length);

    async.eachSeries(pages, exports.getEventsFromPage, function(err){
      if(err) {
        // log.error({err: err}, 'error finding events');
        return done(err);
      }

      done();
    });
  });
};

exports.getEventsFromPage = function (page, done) {
  log.debug('getting events from %s', page.name);
  
  graph.get(page.id+'/events?fields=id,name,cover,start_time', function(err, res) {
    if(err || !res || !res.data) {
      return done(err);
    }

    async.eachLimit(res.data, LIMIT, function(eventInfo, eventDone) {
      exports.processEvent(eventInfo, page, eventDone);
    }, done);
  });
};

exports.getEvent = function (eventId, done) {
  log.debug('getting event %s', eventId);
  
  graph.get(eventId+'?fields=id,name,cover,start_time', function(err, eventInfo) {
    if(err || !eventInfo) {
      return done(err);
    }
    
    exports.processEvent(eventInfo, null, done);
  });
};

exports.processEvent = function(eventInfo, page, eventDone) {

  var now = new Date();
  var endTime = new Date(eventInfo.start_time);

  if(endTime < now) {
    return eventDone();
  }

  var totalAttendes = [];
  var attendeesSample = [];
  var maleAttendees = [];
  var femaleAttendees = [];

  log.debug('processing event', eventInfo.name);

  graph.get(eventInfo.id+'/attending?limit=10000&fields=id,name,gender', function(err, result) {

    // log.debug('got ‰s attendees:', eventInfo.name, result.data);

    totalAttendes = result.data;
    attendeesSample = result.data;
    
    // if(attendeesSample.length > SAMPLE_MAX_SIZE) {
    //   attendeesSample = attendeesSample.slice(0, SAMPLE_MAX_SIZE);
    // }

    async.each(attendeesSample, function(attendee, personCallback){

      // log.debug('getting %s', attendee.name);

      switch(attendee.gender) {
        case 'female' : 
          femaleAttendees.push(attendee.id); 
        break;
        case 'male' : 
          maleAttendees.push(attendee.id); 
        break;
      }

      personCallback();
    }, 
    function gotAllAttendees(err) {
      if(err) {
        return eventDone(err);
      }
      
      if(totalAttendes.length < 10) {
        // ignore small events
        return eventDone();
      }

      var malePertentage = Math.round((maleAttendees.length / attendeesSample.length)*100);
      var femalePercentage = Math.round((femaleAttendees.length / attendeesSample.length)*100);

      var newEventInfo = {
        id: eventInfo.id,
        name: eventInfo.name,
        attending: totalAttendes.length,
        malePertentage: malePertentage,
        femalePercentage: femalePercentage,
        maleAttendees : maleAttendees,
        femaleAttendees : femaleAttendees,
        date: eventInfo.start_time,
        updated: Date.now()
      };

      if(eventInfo.cover && eventInfo.cover.source) {
        newEventInfo.img =  eventInfo.cover.source;
      }  
      if(page && page.id) {
        newEventInfo.owner = page.id;
      } else {
        newEventInfo.status = 'suggestion';
      }

      var newEvent = new Event(newEventInfo);

      newEvent.save(function (err){
        if (err) {
          if(err.code == 11000) {
            // Event already exists
            return Event.update({id: newEventInfo.id}, newEventInfo, eventDone);
          }
          log.error({err: err, event: newEventInfo}, 'error creating event');
          return eventDone(err);
        }
          
        log.info({event: newEventInfo}, 'created a new event');
        eventDone(null, newEvent);
      });

      log.debug(newEventInfo.name + '\n(M):' + malePertentage + '%(' + maleAttendees.length + ') (F):' + femalePercentage + '%(' + femaleAttendees.length+ ')\n');  
    });
  });
};
