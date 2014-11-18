/**
 * Dependencies
 */

var utils = require('hoodie-utils-plugins');
var async = require('async');
var PubSub = require('hoodie-plugin-pubsub/lib');
var ExtendedDatabaseAPI = require('hoodie-utils-plugins').ExtendedDatabaseAPI;

module.exports = function (hoodie, pluginDb, userDb) {
  var SocialMedia = this;
  var pubsub = new PubSub(hoodie);

  var _lookup = function (task, cb) {
    userDb.query('by_userName', { key: task.userName.toLowerCase() }, function (err, rows) {
      if (err || !rows.length) return cb(err || new Error('not_found'));
      task.userId = rows[0].value;
      cb();
    });
  };

  var _setAttrs = function (task, attr, cb) {
    if (!attr || !task[attr]) {
      return cb(new Error('Pls, fill the param: ' + attr));
    }
    task.subject = 'post';
    cb();
  };

  var subscribe = function (task, db, cb) {
    return pubsub.subscribe(db, task, cb);
  };

  var unsubscribe = function (task, db, cb) {
    return pubsub.unsubscribe(db, task, cb);
  };

  var _post = function (task, db, cb) {
    var _db = new ExtendedDatabaseAPI(hoodie, hoodie.database(db));
    _db.add('post', task.mediaObject, cb);
  };

  var _feed = function (task, db, cb) {
    var _db = new ExtendedDatabaseAPI(hoodie, hoodie.database(db));
    _db.find('post', {}, cb);
  };

  SocialMedia.lookup = function (db, task) {

    async.series([
        async.apply(_setAttrs, task, 'userName'),
        async.apply(_lookup, task)
      ],
      utils.handleTask(hoodie, 'lookup', db, task)
    );
  };

  SocialMedia.follow = function (db, task) {

    async.series([
        async.apply(_setAttrs, task, 'userName'),
        async.apply(_lookup, task),
        async.apply(subscribe, task, db)
      ],
      utils.handleTask(hoodie, 'follow', db, task)
    );
  };


  SocialMedia.unfollow = function (db, task) {

    async.series([
        async.apply(_setAttrs, task, 'userName'),
        async.apply(_lookup, task),
        async.apply(unsubscribe, task, db)
      ],
      utils.handleTask(hoodie, 'unfollow', db, task)
    );
  };


  SocialMedia.post = function (db, task) {

    async.series([
        async.apply(_setAttrs, task, 'userId'),
        async.apply(_post, task, db)
      ],
      utils.handleTask(hoodie, 'post', db, task)
    );
  };


  SocialMedia.feed = function (db, task) {

    async.series([
        async.apply(_setAttrs, task, 'userId'),
        async.apply(_feed, task, db)
      ],
      utils.handleTask(hoodie, 'feed', db, task)
    );
  };


  return SocialMedia;
};
