'use strict';

var Alexa = require('alexa-sdk');
var audioData = require('./audioAssets');
var constants = require('./constants');

// Binding audio handlers to PLAY_MODE State since they are expected only in this mode.
var audioEventHandlers = Alexa.CreateStateHandler(constants.states.PLAY_MODE, {
    'PlaybackStarted': function() {
        /*
         * AudioPlayer.PlaybackStarted Directive received.
         * Confirming that requested audio file began playing.
         * Storing details in dynamoDB using attributes.
         */

        console.log("PlaybackStarted - Start");
        console.log("PlaybackStarted - this.attributes: %O", this.attributes);

        this.attributes['token'] = getToken.call(this);
        this.attributes['index'] = getIndex.call(this);
        this.attributes['playbackFinished'] = false;
        this.emit(':saveState', true);
    },
    'PlaybackFinished': function() {
        /*
         * AudioPlayer.PlaybackFinished Directive received.
         * Confirming that audio file completed playing.
         * Storing details in dynamoDB using attributes.
         */

        console.log("PlaybackFinished - Start");

        this.attributes['playbackFinished'] = true;
        this.attributes['enqueuedToken'] = false;
        this.emit(':saveState', true);
    },
    'PlaybackStopped': function() {
        /*
         * AudioPlayer.PlaybackStopped Directive received.
         * Confirming that audio file stopped playing.
         * Storing details in dynamoDB using attributes.
         */

        console.log("PlaybackStopped - Start");

        this.attributes['token'] = getToken.call(this);
        this.attributes['index'] = getIndex.call(this);
        this.attributes['offsetInMilliseconds'] = getOffsetInMilliseconds.call(this);
        this.emit(':saveState', true);
    },
    'PlaybackNearlyFinished': function() {
        /*
         * AudioPlayer.PlaybackNearlyFinished Directive received.
         * Using this opportunity to enqueue the next audio
         * Storing details in dynamoDB using attributes.
         * Enqueuing the next audio file.
         */

        console.log("PlaybackNearlyFinished - Start");

        if (this.attributes['enqueuedToken']) {
            /*
             * Since AudioPlayer.PlaybackNearlyFinished Directive are prone to be delivered multiple times during the
             * same audio being played.
             * If an audio file is already enqueued, exit without enqueuing again.
             */

            console.log("PlaybackNearlyFinished - enqueuedToken");

            return this.context.succeed({});
        }

        var enqueueIndex = this.attributes['index'];
        console.log("PlaybackNearlyFinished - enqueueIndex: " + enqueueIndex);

        enqueueIndex += 1;
        // Checking if  there are any items to be enqueued.
        if (enqueueIndex === audioData.length) {
            if (this.attributes['loop']) {
                // Enqueueing the first item since looping is enabled.
                enqueueIndex = 0;
            } else {
                // Nothing to enqueue since reached end of the list and looping is disabled.
                return this.context.succeed({});
            }
        }
        // Setting attributes to indicate item is enqueued.
        this.attributes['enqueuedToken'] = String(this.attributes['playOrder'][enqueueIndex]);

        var enqueueToken = this.attributes['enqueuedToken'];
        var playBehavior = 'ENQUEUE';
        var podcast = audioData[this.attributes['playOrder'][enqueueIndex]];
        var expectedPreviousToken = this.attributes['token'];
        var offsetInMilliseconds = 0;

        this.response.audioPlayerPlay(playBehavior, podcast.url, enqueueToken, expectedPreviousToken, offsetInMilliseconds);
        this.emit(':responseReady');
    },
    'PlaybackFailed': function() {
        //  AudioPlayer.PlaybackNearlyFinished Directive received. Logging the error.
        console.log("Playback Failed : %j", this.event.request.error);
        this.context.succeed({});
    }
});

module.exports = audioEventHandlers;

function getToken() {
    // Extracting token received in the request.
    return this.event.request.token;
}

function getIndex() {
    // Extracting index from the token received in the request.
    var tokenValue = parseInt(this.event.request.token);
    return this.attributes['playOrder'].indexOf(tokenValue);
}

function getOffsetInMilliseconds() {
    // Extracting offsetInMilliseconds received in the request.
    return this.event.request.offsetInMilliseconds;
}