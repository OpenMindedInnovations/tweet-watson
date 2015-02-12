'use strict'

require('node-jsx').install({extension: '.jsx'})
var reactAsync = require('react-async')

var reactApp = require('./react/src/app.jsx')
var appConfig = require('./react/src/config')

var request = require('superagent')
var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var app = express()
var Twit = require('twit')

var https = require('https');
var url = require('url');
var querystring = require('querystring');

var vcap_services = require('./VCAP_Services').vcap;
var flatten = require('./flatten');
var home = require('./react/src/home.jsx');
var index = require('./react/src/config/index.js');

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))


var T = new Twit({
  consumer_key: appConfig.CONSUMER_KEY,
  consumer_secret: appConfig.CONSUMER_SECRET,
  access_token: appConfig.ACCESS_TOKEN,
  access_token_secret: appConfig.ACCESS_TOKEN_SECRET
});

// There are many useful environment variables available in process.env.
// VCAP_APPLICATION contains useful information about a deployed application.
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
// TODO: Get application information and use it in your app.

// There are many useful environment variables available in process.env.
// VCAP_APPLICATION contains useful information about a deployed application.
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
// TODO: Get application information and use it in your app.

// VCAP_SERVICES contains all the credentials of services bound to
// this application. For details of its content, please refer to
// the document or sample of each service.
// If VCAP_SERVICES is undefined we use a local module as mockup

// defaults for dev outside bluemix
var service_url = appConfig.SERVICE_URL;
var service_username = appConfig.SERVICE_USERNAME;
var service_password = appConfig.SERVICE_PASSWORD;

//if (process.env.VCAP_SERVICES) {
if (vcap_services) {
  console.log('Parsing VCAP_SERVICES');
  //var services = JSON.parse(process.env.VCAP_SERVICES);
  var services = vcap_services
  //service name, check the VCAP_SERVICES in bluemix to get the name of the services you have
  var service_name = 'user_modeling';

  if (services[service_name]) {
    var svc = services[service_name][0].credentials;
    service_url = svc.url;
    service_username = svc.username;
    service_password = svc.password;
  } else {
    console.log('The service '+service_name+' is not in the VCAP_SERVICES, did you forget to bind it?');
  }

} else {
  console.log('No VCAP_SERVICES found in ENV, using defaults for local development');
}

console.log('service_url = ' + service_url);
console.log('service_username = ' + service_username);
console.log('service_password = ' + new Array(service_password.length).join("X"));

var auth = 'Basic ' + new Buffer(service_username + ':' + service_password).toString('base64');



app.post('/get-watson-data', function(req, res) {
  console.log('Post request made')
  //twitter call
  T.get('statuses.user_timeline', { screen_name: req.body.username, count: 200 }, function( err, data, response) {
    var allTweets = '';
    data.forEach(function(entry) {
      allTweets += ' ' + entry.text;
    });
    console.log(allTweets)

    callWatsonApi(res, req, allTweets)
  });
});

//app.post('/watson_call', function(req, res) {
//  var allTweets = document.getElementById("screename-input")
//});

var callWatsonApi = function(res, req, message_to_be_analyzed) {
  // See User Modeling API docs. Path to profile analysis is /api/v2/profile
  // remove the last / from service_url if exist
  var parts = url.parse(service_url.replace(/\/$/,''));

  var profile_options = { host: parts.hostname,
    port: parts.port,
    path: parts.pathname + "/api/v2/profile",
    method: 'POST',
    headers: {
      'Content-Type'  :'application/json',
      'Authorization' :  auth }
  };

  // create a profile request with the text and the htpps options and call it
  create_profile_request(profile_options,message_to_be_analyzed)(function(error,profile_string) {
    if (error) res.render('index',{'error': error.message});
    else {
      // parse the profile and format it
      var profile_json = JSON.parse(profile_string);
      var flat_traits = flatten.flat(profile_json.tree);

      // Extend the profile options and change the request path to get the visualization
      // Path to visualization is /api/v2/visualize, add w and h to get 900x900 chart
      var viz_options = extend(profile_options, { path :  parts.pathname +
      "/api/v2/visualize?w=900&h=900&imgurl=%2Fimages%2Fapp.png"});

      // create a visualization request with the profile data
      create_viz_request(viz_options,profile_string)(function(error,viz) {
        if (error) res.render('index',{'error': error.message});
        else {
          return res.render('index', {'content': req.body.content, 'traits': flat_traits, 'viz':viz});
        }
      });
    }
  });

};

//all this code below is for modeling service and shouldn't really be messed with, unless it can be improved of course or add react
//components

// creates a request function using the https options and the text in content
// the function that return receives a callback
var create_profile_request = function(options,content) {
  return function (/*function*/ callback) {
    // create the post data to send to the User Modeling service
    var post_data = {
      'contentItems' : [{
        'userid' : 'dummy',
        'id' : 'dummyUuid',
        'sourceid' : 'freetext',
        'contenttype' : 'text/plain',
        'language' : 'en',
        'content': content
      }]
    };
    // Create a request to POST to the User Modeling service
    var profile_req = https.request(options, function(result) {
      result.setEncoding('utf-8');
      var response_string = '';

      result.on('data', function(chunk) {
        response_string += chunk;
      });

      result.on('end', function() {

        if (result.statusCode != 200) {
          var error = JSON.parse(response_string);
          callback({'message': error.user_message}, null);
        } else
          callback(null,response_string);
      });
    });

    profile_req.on('error', function(e) {
      callback(e,null);
    });

    profile_req.write(JSON.stringify(post_data));
    profile_req.end();
  };
};

// creates a request function using the https options and the profile
// the function that return receives a callback
var create_viz_request = function(options,profile) {
  return function (/*function*/ callback) {
    // Create a request to POST to the User Modeling service
    var viz_req = https.request(options, function(result) {
      result.setEncoding('utf-8');
      var response_string = '';

      result.on('data', function(chunk) {
        response_string += chunk;
      });

      result.on('end', function() {
        if (result.statusCode != 200) {
          var error = JSON.parse(response_string);
          callback({'message': error.user_message}, null);
        } else
          callback(null,response_string);      });
    });

    viz_req.on('error', function(e) {
      callback(e,null);
    });
    viz_req.write(profile);
    viz_req.end();
  };
};


// render react routes on server
app.use(function(req, res, next) {

  if(req.query.q) {
    res.redirect('/results/' + req.query.q)
  }
  try {
    reactAsync.renderToStringAsync(reactApp.routes({path: req.path}), function(err, markup) {
      if(err) {
        return next()
      }
      return res.send('<!DOCTYPE html>' + markup.replace('%react-iso-vgs%', reactApp.title.rewind()))
    })
  } catch(err) {
    return next()
  }
})

// handle errors
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send('error', {
    message: err.message,
    error: {}
  })
})

module.exports = app