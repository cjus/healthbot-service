/**
 * @name health-v1-api
 * @description This module packages the healthbot API.
 */
'use strict';

const hydraExpress = require('hydra-express');
const hydra = hydraExpress.getHydra();
const express = hydraExpress.getExpress();
const ServerResponse = hydraExpress.getHydra().getServerResponseHelper();

let serverResponse = new ServerResponse();
express.response.sendError = function(err) {
  serverResponse.sendServerError(this, {result: {error: err}});
};
express.response.sendOk = function(result) {
  serverResponse.sendOk(this, {result});
};

let api = express.Router();

/**
* @name root
* @summary root endpoint - identifies service
* @param {object} req - express request object.
* @param {object} res - express response object
*/
api.get('/', (req, res) => {
  res.sendOk({msg: 'Health Service'});
});

/**
* @name health
* @summary health check endpoint
* @param {object} req - express request object.
* @param {object} res - express response object
* @return {undefined}
*/
api.get('/health', (req, res) => {
  let healthInfo = hydra.getHealth();
  serverResponse.sendOk(res, {
    result: healthInfo
  });
});

module.exports = api;
