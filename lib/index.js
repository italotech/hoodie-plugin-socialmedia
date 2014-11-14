var SocialMediaApi = require('./socialmedia');
var Db = require('./db');
var _ = require('underscore');
var ExtendedDatabaseAPI = require('hoodie-utils-plugins').ExtendedDatabaseAPI;

module.exports = function (hoodie) {
  var socialmedia = {};
  var usersDb = new ExtendedDatabaseAPI(hoodie, hoodie.database('_users'));
  var pluginDb = new Db(hoodie, 'plugins/hoodie-plugin-socialmedia', usersDb);

  _.extend(socialmedia,  new SocialMediaApi(hoodie, pluginDb, usersDb));


  return socialmedia;
};
