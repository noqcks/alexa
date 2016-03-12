'use strict';

exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.73ef0089-042c-4eb1-bd13-e11448f90da0") {
             context.fail("Invalid Application ID");
        }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent;
    var intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if ("CompareProducts" === intentName) {
        compareProducts(intent, session, callback);
    } else if ("GetSentiment" === intentName) {
        getSentiment(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        getWelcomeResponse(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "Welcome to the sentiment analyzer. I will give you the sentiment of an item for the last two months. Simply ask me what people think of a product or company.";

    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Just say: What do people think of google?";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

// function compareProducts(intent, session, callback){
//     var product1 = intent.slots.ProductOne.value;
//     var product2 = intent.slots.ProductTwo.value;
//     var cardTitle = intent.name;
//     var repromptText = "";
//     var sessionAttributes = {};
//     var shouldEndSession = false;
//     var speechOutput = "";

//     if (product1 && product2){
//         speechOutput = "Product 1 is " + product1 + " Product 2 is " + product2;
//         var product1Score = getSentimentScore(product1);
//         var product2Score = getSentimentScore(product2);
//         repromptText = "";
//     }
//     callback(sessionAttributes,
//          buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
// }

function getSentiment(intent, session, callback) {
    var subject = intent.slots.Subject.value;
    getSentimentScore(subject, intent, callback);

}

function getSentimentScore(subject, intent, callback){
    var request = require('request');
    var result;

    var SECONDS_IN_2_MONTHS = 5183000;
    var API_KEY = "65d02f5717b588825ff508d933c15f08a6a43117";

    var end = Math.floor(Date.now() / 1000);
    var start = end - SECONDS_IN_2_MONTHS;
    // var query = 'apple'

    var url = "https://gateway-a.watsonplatform.net/calls/data/GetNews?apikey=" + API_KEY + "&return=enriched.url.enrichedTitle.docSentiment&start=" + start + "&end=" + end + "&q.enriched.url.cleanedTitle=" + subject + "&count=20&outputMode=json";

    request(url, function (error, response, body) {
      if (error) console.log(error);
        var sessionAttributes = {};
        var speechOutput = "";
        var repromptText = "";
        var shouldEndSession = false;
        var cardTitle = intent.name;
      if (!error && response.statusCode == 200) {
        // console.log(JSON.parse(body))
        var sentimentScore;
        var results = JSON.parse(body).result.docs
        var count = 0;
        var score = 0;
        for (var i in results) {
          count++;
          score += results[i].source.enriched.url.enrichedTitle.docSentiment.score;
        }
        result = score/count;
        sentimentScore = result;

        if (sentimentScore > 0) {
            speechOutput = "There is a positive sentiment for " + subject;
            repromptText = "";
        } else if (sentimentScore < 0) {
            speechOutput = "There is a negative sentiment for " + subject;
            repromptText = "";
        } else if (sentimentScore == 0) {
            speechOutput = "There is a neutral sentiment for " + subject;
            repromptText = "";
        } else {
            speechOutput = "I'm sorry, I don't have enough data to analyze the sentiment of " + subject;
            repromptText = "";
        }

      }
        callback(sessionAttributes,
            buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    })
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
