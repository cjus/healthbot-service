'use strict';

const hydraExpress = require('hydra-express');
const hydra = hydraExpress.getHydra();
const taskr = require('../lib/taskr');
const dispatcher = require('../lib/dispatcher');

/**
* @name HydraMonTask
* @summary Task to monitor hydra serivces
* @return {undefined}
*/
class HydraMonTask {
  /**
  * @name constructor
  * @summary HydraMonTask constructor
  * @param {object} config - configuration object
  * @return {undefined}
  */
  constructor(config) {
    this.config = config;
    this.run = this.run.bind(this);
  }

  /**
  * @name run
  * @summary execution entry point
  * @return {undefined}
  */
  async run() {
    try {
      let nodes = await hydra.getServiceNodes();
      let serviceList = nodes;
      console.log('serviceList', serviceList);
      let results = taskr.executeRules('hydramon', serviceList);
      if (results.length > 0) {
        let messages = results.map((e) => `• ${e.message}\n`);
        dispatcher.send(messages.join(' '));
      }
    } catch (e) {
      hydraExpress.appLogger.error(e);
    }
  }
}

module.exports = HydraMonTask;
