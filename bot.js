const botBuilder = require('claudia-bot-builder');
const fbTemplate = botBuilder.fbTemplate;
const rp = require('minimal-request-promise');

module.exports = botBuilder((request, originalApiRequest) => {
  // If request is not postback
  if (!request.postback) {
    // Get basic user info
    return rp.get(`https://graph.facebook.com/v2.6/${request.sender}?fields=first_name&access_token=${originalApiRequest.env.facebookAccessToken}`)
      .then(response => {
        const user = JSON.parse(response.body);
        // Then let's send two text messages and one generic template with three elements/bubbles
        return [
          `Hello, ${user.first_name}. Welcome to Space Explorer! Ready to start a journey through space?`,
          'What can I do for you today?',
          mainMenu()
          ];
      });
  }
  function mainMenu(){
    return new fbTemplate.Generic()
      .addBubble(`NASA's Astronomy Picture of the Day`,'Satellite icon by parkjisun from the Noun Project')
        .addImage('https://raw.githubusercontent.com/stojanovic/space-explorer-bot/master/assets/images/apod.png')
        .addButton('Show', 'SHOW_APOD')
        .addButton('What is APOD?', 'ABOUT_APOD')
        .addButton('Website', 'http://apod.nasa.gov/apod/')
      .addBubble(`Photos from NASA's rovers on Mars`,'Rover icon by Anthony Bossard from the Noun Project')
        .addImage('assets/images/rover.png')
        .addButton('Curiosity', 'CURIOSITY_IMAGES')
        .addButton('Opportunity', 'OPPORTUNITY_IMAGES')
        .addButton('Spirit', 'SPIRIT_IMAGES')
      .addBubble('Help & info', 'Monster icon by Paulo Sá Ferreira from the Noun Project')
        .addImage('https://raw.githubusercontent.com/stojanovic/space-explorer-bot/master/assets/images/about.png')
        .addButton('About the bot', 'ABOUT')
        .addButton('Credits', 'CREDITS')
        .addButton('Report an issue', 'https://github.com/stojanovic/space-explorer-bot/issues')
      .get();
  }
});


