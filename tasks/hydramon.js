'use strict';

const hydraExpress = require('hydra-express');
const hydra = hydraExpress.getHydra();
const taskr = require('../lib/taskr');
const dispatcher = require('../lib/dispatcher');
const request = require('request');

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
      let serviceList = await hydra.getServiceNodes();
      let results = taskr.executeRules('hydramon', serviceList);
      if (results.length > 0) {
        let module = results[0].module;
        let messages = results.map((e) => `• ${e.message}\n`);
        (module.notify) ?
          dispatcher.send(`${module.notify}: ${messages.join(' ')}`) :
          dispatcher.send(`${messages.join(' ')}`);
        (module.trigger) && request.get(module.trigger);
      }
    } catch (e) {
      hydraExpress.appLogger.error(e);
    }
  }
}

module.exports = HydraMonTask;
