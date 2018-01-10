'use strict'

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

process.env.DEBUG = 'actions-on-google:*';
const functions = require('firebase-functions');
const App = require('actions-on-google').DialogflowApp;

const mqtt = require('mqtt');
var client = mqtt.connect('mqtt://iot.eclipse.org', 1883);

const ISPEED = 'inc_speed'
const DSPEED = 'dec_speed'

const METRIC = 'number'

exports.targetApp = functions.https.onRequest((request, response) => {
  const app = new App({request, response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));

  function sendValue(app){
    let value = app.getArgument(METRIC);
    const intent = app.getIntent();
    if(intent === DSPEED){
      app.ask('You decreased by ' + value);
    }else if(ISPEED){
      app.ask('You increased by ' + value);
    }

    client.on('connect', function() {
      let value = app.getArgument(METRIC);
      console.log("Value is: " + value);

      client.publish('target/value', value);

      console.log("Published");
    })
  }

  let actionMap = new Map();
  actionMap.set(ISPEED, sendValue);
  actionMap.set(DSPEED, sendValue);

  app.handleRequest(actionMap);
});
