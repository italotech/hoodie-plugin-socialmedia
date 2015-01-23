var SocialMediaApi = require('./socialmedia');
var NotificationApi = require('./notification');
//var Db = require('./db');
var _ = require('underscore');
//var async = require('async');
var utils = require('hoodie-utils-plugins')('socialmedia:index');
var ExtendedDatabaseAPI = utils.ExtendedDatabaseAPI;

module.exports = function (hoodie) {
  var socialmedia = {};
//  var usersDb = new ExtendedDatabaseAPI(hoodie, hoodie.database('_users'));
//  var pluginDb = new Db(hoodie, 'plugins/hoodie-plugin-socialmedia', usersDb);
  var dbPluginProfile = new ExtendedDatabaseAPI(hoodie, hoodie.database('plugins/hoodie-plugin-profile'));

  _.extend(socialmedia,  new SocialMediaApi(hoodie, dbPluginProfile));
  _.extend(socialmedia,  new NotificationApi(hoodie));


  return socialmedia;
};
