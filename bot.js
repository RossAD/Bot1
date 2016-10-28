'use strict'

const botBuilder = require('claudia-bot-builder');
const fbTemplate = botBuilder.fbTemplate;
const rp = require('minimal-request-promise');

function getDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function mainMenu(){
  return new fbTemplate.Generic()
  .addBubble(`NASA's Astronomy Picture of the Day`,'Planet icon by Dale Humphries from the Noun Project')
  .addImage('https://raw.githubusercontent.com/rossad/Bot1/master/assets/images/astronomy.png')
  .addButton('Show', 'SHOW_APOD')
  .addButton('What is APOD?', 'ABOUT_APOD')
  .addButton('Website', 'http://apod.nasa.gov/apod/')
  .addBubble(`Asteroids - Near Earth Objects(NEO)`, '')
  //.addImage()
  .addButton('Show Closest Asteroid Today', 'LIST_NEO')
  .addButton('What are NEO\'s?', 'ABOUT_NEO')
  //.addButton()
  .addBubble(`Earth Polychromatic Imaging Camera - EPIC Picture of the Day`, '')
  //.addImage()
  .addButton('Show', 'SHOW_EPIC')
  .addButton('What is EPIC?', 'ABOUT_EPIC')
  .addBubble(`Photos from NASA's rovers on Mars`,'Curiosity Rover icon by Anthony Bossard from the Noun Project')
  .addImage('https://raw.githubusercontent.com/rossad/Bot1/master/assets/images/rover.png')
  .addButton('Curiosity', 'CURIOSITY_IMAGES')
  .addButton('Opportunity', 'OPPORTUNITY_IMAGES')
  .addButton('Spirit', 'SPIRIT_IMAGES')
  .addBubble('Help & info', 'Robot icon by my name is mud from the Noun Project')
  .addImage('https://raw.githubusercontent.com/rossad/Bot1/master/assets/images/robot.png')
  .addButton('About the bot', 'ABOUT')
  .addButton('Credits', 'CREDITS')
  .addButton('Report an issue', 'https://github.com/stojanovic/space-explorer-bot/issues')
  .get();
}

const botServe = botBuilder((request, originalApiRequest) => {
  console.log('Api Request: ', originalApiRequest.env);
  originalApiRequest.lambdaContext.callbackWaitsForEmptyEventLoop = false;

  // If request is not postback
  if (!request.postback) {
    // Get basic user info
    return rp.get(`https://graph.facebook.com/v2.6/${request.sender}?fields=first_name&access_token=${originalApiRequest.env.facebookAccessToken}`)
      .then(response => {
        const user = JSON.parse(response.body);
        // Then let's send two text messages and one generic template with three elements/bubbles
        return [
          `Hello, ${user.first_name}. Welcome to Space Bot! Ready to start a journey through space?`,
          'What can I do for you today?',
          mainMenu()
          ];
      });
  }

  if (request.text === "SHOW_APOD") {
    return rp(`https://api.nasa.gov/planetary/apod?api_key=${originalApiRequest.env.nasaApiKey}`)
      .then(response => {
        const APOD = JSON.parse(response.body);
        console.log('APOD Body: ', APOD);
        return [
          `NASA's Astronomy Picture of ${APOD.date}`,`"${APOD.title}"` + (APOD.copyright ? `, © ${APOD.copyright}` : ''),
          APOD.media_type === 'image' ? new fbTemplate.image(APOD.url).get() : APOD.url,
          APOD.explanation,
          new fbTemplate.button('Options:')
            .addButton('HD Version', APOD.hdurl || APOD.url)
            .addButton('Visit Website', 'http://apod.nasa.gov/apod/')
            .addButton('Back to Main Menu', 'MAIN_MENU')
            .get()
        ]
      });
  }


  if (request.text === "ABOUT_APOD") {
    return [
      'One of the most popular websites at NASA is the Astronomy Picture of the',
      'Day. In fact, this website is one of the most popular websites across all',
      'federal agencies. It has the popular appeal of a Justin Bieber video.',
      new fbTemplate.button('Options: ')
        .addButton('Back to Picture', 'SHOW_APOD')
        .addButton('Back to Main Menu', 'MAIN_MENU')
        .get()
    ]
  }

  if (request.text === "MAIN_MENU") {
    return mainMenu();
  }
  
  if (request.text === "LIST_NEO") {
    return rp(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${getDate()}&api_key=${originalApiRequest.env.nasaApiKey}`)
      .then(response => {
        const NEO = JSON.parse(response.body);
        const closeNeo = {};
        const closest = 99999999;
        const testString = `This is a Test String ${closest}`;
        for(var i in NEO['near_earth_objects']) {
          i.forEach(function(item) {
            var asterDist = item["close_approach_data"][0]["miss_distance"]["miles"];
            if ((asterDist < closest) || (closest === 0)) {
              closest = asterDist;
            }
          })
        }
        return [
          testString,
          new fbTemplate.button('Options: ')
            .addButton('Back to Main Menu', 'MAIN_MENU')
            .get()
        ]
    })
  }

  if (request.text === "ABOUT_NEO") {
  
  }

  if (request.text === "SHOW_EPIC") {
  
  }

  if (request.text === "ABOUT_EPIC") {
  
  }

  if (request.text === "CURIOSITY_IMAGES") {
  
  }

  if (request.text === "OPPORTUNITY_IMAGES") {
  
  }

  if (request.text === "SPIRIT_IMAGES") {
  
  }


});

botServe.addPostDeployConfig('nasaApiKey', 'NASA API Key:', 'configure-app');

module.exports = botServe;
