var SocialMediaApi = require('./socialmedia');
var Db = require('./db');
var _ = require('underscore');
var async = require('async');
var ExtendedDatabaseAPI = require('hoodie-utils-plugins').ExtendedDatabaseAPI;

module.exports = function (hoodie) {
  var socialmedia = {};
  var usersDb = new ExtendedDatabaseAPI(hoodie, hoodie.database('_users'));
  var pluginDb = new Db(hoodie, 'plugins/hoodie-plugin-socialmedia', usersDb);

  /**
   * PubSub dbName
   */

  socialmedia.addProfileEachUser = function (_doc) {
    if (_doc.roles && _doc.roles.indexOf('confirmed') >= 0 && _doc.type !== 'user_anonymous') {
      var userDbName = 'user/' + _doc.hoodieId;
      var userDb = new ExtendedDatabaseAPI(hoodie, hoodie.database(userDbName));

      async.series([
        async.apply(pluginDb.profileDoc, hoodie, userDb, userDbName)
      ],
      function (err) {
        if (err) console.log('SocialMedia.addProfileEachUser:', err);
      });
    }
  };

  _.extend(socialmedia,  new SocialMediaApi(hoodie, pluginDb, usersDb));


  return socialmedia;
};
