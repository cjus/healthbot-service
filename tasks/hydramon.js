'use strict';

const hydraExpress = require('hydra-express');
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
  run() {
    const hydra = hydraExpress.getHydra();
    hydra.getServiceNodes()
      .then((nodes) => {
        let serviceList = nodes;
        let results = taskr.executeRules('hydramon', serviceList);
        if (results.length > 0) {
          let messages = results.map((e) => `• ${e.message}\n`);
          dispatcher.send(messages.join(' '));
        }
      })
      .catch((err) => console.log(err));
  }
}

module.exports = HydraMonTask;
