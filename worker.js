/**
 * Hoodie plugin socialmedia
 * Lightweight and easy socialmedia
 */

/**
 * Dependencies
 */

var async = require('async');
var _ = require('underscore');
var PubSub = require('./lib/socialmedia');
var ExtendedDatabaseAPI = require('./lib/extended-database').ExtendedDatabaseAPI;

/**
 * DevDependencies
 */

var debug = require('debug');
var log = debug('app:log');
var error = debug('app:error');


/**
 * PubSub dbName
 */

exports.dbname = 'plugins/hoodie-plugin-socialmedia';

/**
 * PubSub dbAdd
 */

exports.dbAdd = function (hoodie, callback) {
  hoodie.database.add(exports.dbname, function (err) {
    if (err) error(err);
    callback(err);
  });
};

/**
 * PubSub userFilter
 */

exports.userFilter = function (hoodie, db, callback) {
  var filterFunction = function (doc, req) {
    if (doc.type == req.query.type) {
      return true;
    } else {
      return false;
    }
  };

  db.addFilter('by_type', filterFunction, function (err, data) {
    if (err) {
      return callback(err);
    }

    return callback();
  })
};

/**
 * PubSub worker
 */

module.exports = function (hoodie, callback) {
  var pluginDb = new ExtendedDatabaseAPI(hoodie, hoodie.database(exports.dbname));
  var pubSub = new PubSub(hoodie, pluginDb);

  hoodie.task.on('subscribe:add', pubSub.subscribe);
  hoodie.task.on('unsubscribe:add', pubSub.unsubscribe);
  // hoodie.task.on('publish:add', pubSub.publish);
  hoodie.account.on('change', function (_doc) {
    if (_doc.roles && _doc.roles.indexOf('confirmed') >= 0) {
      var userDbName = 'user/' + _doc.hoodieId;
      var userDb = new ExtendedDatabaseAPI(hoodie, hoodie.database(userDbName));

      async.series([
        async.apply(exports.userFilter, hoodie, userDb)
      ],
      function (err, _doc) {
        if (err) error('PubSub.ensureUserFilter:', err);
      });
    }
  });

  async.series([
    async.apply(exports.dbAdd, hoodie),
  ],
  callback);
};
