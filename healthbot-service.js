/**
* @name User
* @summary User Hydra Express service entry point
* @description User Services
*/
'use strict';

const hydraExpress = require('hydra-express');
const HydraExpressLogger = require('fwsp-logger').HydraExpressLogger;
hydraExpress.use(new HydraExpressLogger());
let config = hydraExpress.getHydra().getConfigHelper();

let taskr = require('./lib/taskr');
let dispatcher = require('./lib/dispatcher');

/**
* Load configuration file and initialize hydraExpress app
*/
config.init('./config/config.json')
  .then(() => {
    return hydraExpress.init(config.getObject(), () => {
      hydraExpress.registerRoutes({
        '/v1/health': require('./routes/health-v1-routes')
      });
    });
  })
  .then((serviceInfo) => {
    let newConfig = hydraExpress.getRuntimeConfig();
    dispatcher.init(newConfig);
    taskr.init(newConfig);
    console.log(serviceInfo);
    dispatcher.send(`Starting ${serviceInfo.serviceName} on ${serviceInfo.serviceIP}: ${serviceInfo.servicePort}`);
  })
  .catch((err) => console.log('err', err));
