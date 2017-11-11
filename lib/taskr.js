'use strict';

const cron = require('cron').CronJob;
const jspath = require('jspath');

/**
* @name Taskr
* @summary Task scheduler
* @return {undefined}
*/
class Taskr {
  /**
  * @name constructor
  * @summary Taskr constructor
  * @return {undefined}
  */
  constructor() {
    this.path = '';
    this.modules = [];
  }

  /**
  * @name init
  * @summary Initialize Taskr by parsing config to load and configure modules.
  * @param {object} config - configuration file containing taskr branch
  * @return {array} errors - array containing error objects if any
  */
  init(config) {
    let errors = [];

    this.path = config.taskr.path;

    let keys = Object.keys(config.taskr.modules);
    this.modules = keys.map((moduleName) => {
      let m = config.taskr.modules[moduleName];
      m.name = moduleName;
      m.modulePath = `${config.taskr.path}/${moduleName}`;
      return m;
    });

    this.modules.forEach((m) => {
      try {
        let TaskModule = require(m.modulePath);
        m.handler = new TaskModule(config);
        let Cron = cron;
        new Cron(m.schedule, m.handler.run, null, true, config.taskr.timezone);
      } catch (e) {
        errors.push(new Error(`Entry ${m.name} doesn't seem like a valid cron spec.`));
      }
    });

    return errors;
  }

  /**
  * @name executeRules
  * @summary Execute rules associated with a module
  * @param {string} moduleName - name of module
  * @param {object} data on which rules will run against
  * @return {array} results - array of results if any
  */
  executeRules(moduleName, data) {
    let results = [];
    let m = this.modules.find((e) => e.name === moduleName);
    if (!m) {
      return results;
    }
    m.rules.forEach((rule) => {
      let res = jspath.apply(rule.condition, data);
      let setModule = true;
      res.forEach((result) => {
        let message = rule.response;
        Object.keys(result).forEach((key) => {
          message = message.replace(new RegExp(`<%=${key}%>`, 'g'), result[key]);
        });
        results.push({
          module: (setModule) ? m : null,
          id: rule.id,
          message,
          result
        });
        setModule = false;
      });
    });
    return results;
  }

}

module.exports = new Taskr();
