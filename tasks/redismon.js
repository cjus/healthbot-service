'use strict';

const hydraExpress = require('hydra-express');
const redis = require('redis');
const taskr = require('../lib/taskr');
const dispatcher = require('../lib/dispatcher');

/**
* @name RedisMonTask
* @summary Redis Monitor Task
* @return {undefined}
*/
class RedisMonTask {
  /**
  * @name constructor
  * @summary Redis Monitor Task
  * @param {object} config - configuration object
  * @return {undefined}
  */
  constructor(config) {
    this.config = config;
    this.run = this.run.bind(this);
  }

  /**
  * @name run
  * @summary Task entry point
  * @return {undefined}
  */
  run() {
    let redisClient = redis.createClient(this.config.hydra.redis.url);
    redisClient.on('error', (err) => {
      throw err;
    });

    redisClient.info((err, reply) => {
      let map = {};
      let lines;

      if (err) {
        redisClient.end();
        // log.error({
        //   event: "error",
        //   error: err
        // });
        return;
      }

      lines = reply.replace(/\n/g, '');
      lines = lines.split('\r');
      lines.forEach((line) => {
        if (line.indexOf(':') > -1) {
          let keyval = line.split(':');
          map[keyval[0]] = keyval[1];
        }
      });
      let info = {
        version: map.redis_version,
        uptimeInSeconds: map.uptime_in_seconds,
        uptimeInDays: map.uptime_in_days,
        connectedClients: map.connected_clients,
        usedMemory: map.used_memory, // in Ks
        memoryFootprint: map.used_memory_rss, // in Ks
        totalSystemMemory: map.total_system_memory, // in Ks
        totalConnectionsReceived: map.total_connections_received,
        totalCommandsProcessed: map.total_commands_processed,
        totalPubSubChannels: map.pubsub_channels
      };
      let results = taskr.executeRules('redismon', info);
      if (results && results.length > 0) {
        let messages = results.map((e) => `• ${e.message}\n`);
        if (messages) {
          dispatcher.send(`${messages.join(' ')}`);
        }
      }
      redisClient.quit();
      hydraExpress.appLogger.info(info);
    });
  }
}

module.exports = RedisMonTask;
