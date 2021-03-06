"use strict";

module.exports = Object.freeze({

    // App-ID. TODO: set to your own Skill App ID from the developer portal.
    appId: 'amzn1.ask.skill.4d34b259-45ce-442b-b90d-8d1b4c69d748',

    //  DynamoDB Table name
    dynamoDBTableName: 'IsraelCloudsPodCastAudio',

    /*
     *  States:
     *  START_MODE : Welcome state when the audio list has not begun.
     *  PLAY_MODE :  When a playlist is being played. Does not imply only active play.
     *               It remains in the state as long as the playlist is not finished.
     *  RESUME_DECISION_MODE : When a user invokes the skill in PLAY_MODE with a LaunchRequest,
     *                         the skill provides an option to resume from last position, or to start over the playlist.
     */
    states: {
        START_MODE: '',
        PLAY_MODE: '_PLAY_MODE',
        RESUME_DECISION_MODE: '_RESUME_DECISION_MODE'
    },

    // when true, the skill logs additional detail, including the full request received from Alexa
    debug: true
});