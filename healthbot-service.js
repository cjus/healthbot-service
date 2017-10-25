/**
* @name HealthBot
* @summary User Hydra Express service entry point
* @description HealthBot Services
*/
'use strict';

const hydraExpress = require('hydra-express');
const hydra = hydraExpress.getHydra();
const HydraExpressLogger = require('fwsp-logger').HydraExpressLogger;
hydraExpress.use(new HydraExpressLogger());
let config = hydraExpress.getHydra().getConfigHelper();

let taskr = require('./lib/taskr');
let dispatcher = require('./lib/dispatcher');


/**
* Load configuration file and initialize hydraExpress app
*/
let main = async () => {
  try
  {
    await config.init('./config/config.json');
    let serviceInfo = await hydraExpress.init(config.getObject(), () => {
      hydraExpress.registerRoutes({
        '/v1/healthbot': require('./routes/health-v1-routes')
      });
    });
    let newConfig = hydraExpress.getRuntimeConfig();
    dispatcher.init(newConfig);
    taskr.init(newConfig);
    dispatcher.send(`Starting ${serviceInfo.serviceName} on ${serviceInfo.serviceIP}:${serviceInfo.servicePort}`);
  } catch (e) {
    console.log('error', e);
  }
}

main();

