var //async = require('async'),
    utils = require('hoodie-utils-plugins')('socialmedia:db'),
    ExtendedDatabaseAPI = utils.ExtendedDatabaseAPI;

module.exports = function (hoodie, dbname) {

  /**
   * PubSub _dbname
   */

  var db = new ExtendedDatabaseAPI(hoodie, hoodie.database(dbname));
  /**
   * PubSub dbAdd
   */



  return db;
};
