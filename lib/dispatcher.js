'use strict';

const hydraExpress = require('hydra-express');
const Utils = hydraExpress.getHydra().getUtilsHelper();
const Slack = require('./slack');

/**
* @name Dispatcher
* @summary task dispatcher
* @return {undefined}
*/
class Dispatcher {
  /**
  * @name constructor
  * @summary class constructor
  * @return {undefined}
  */
  constructor() {
    this.messages = {};
    this.okResponses = [
      'All good, no new messages to report at this time.',
      'Nothing new to report at this time.',
      'Looking good, all services running just fine.',
      'All good in the network neighborhood.'
    ];
  }

  /**
  * @name init
  * @summary initialize dispatcher
  * @param {object} config - configuration object
  * @return {undefined}
  */
  init(config) {
    const DURATION = 900 * 1000;
    this.slack = new Slack(config);
    this.dontLogOk = config.dontLogOk;

    setInterval(() => {
      let message;
      let totalMessages = Object.keys(this.messages).length;
      if (totalMessages > 0) {
        message = `I reported ${totalMessages} issues in the past ${DURATION / 60} minutes.`;
      } else {
        if (!this.dontLogOk) {
          message = this.okResponses[this.getRandomInt(0, this.okResponses.length)];
        }
      }
      this.slack.post(message);
      this.messages = {};
    }, DURATION);
  }

  /**
  * @name send
  * @summary Post a slack message
  * @param {string} message - message to post
  * @return {undefined}
  */
  send(message) {
    let msgHash = Utils.stringHash(message);
    if (!this.messages[msgHash]) {
      this.messages[msgHash] = message;
      this.slack.post(message);
    }
    hydraExpress.log('info', message);
  }

  /**
  * @name getRandomInt
  * @summary Returns a random integer between min (included) and max (excluded)
  * @param {number} min - minimum number
  * @param {number} max - maximum number
  * @return {number} num - random number
  */
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }
}

module.exports = new Dispatcher();
