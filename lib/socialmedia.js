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
      return cb('Pls, fill the param: ' + attr);
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

    // @fix _db.add not generating id
    task.mediaObject.id = (Date.now()).toString(36);

    _db.add('post', task.mediaObject, function (err, doc) {
      task.mediaObject = doc;
      cb(err, task);
    });
  };

  // @todo update only if owner
  var _updatePost = function (task, db, cb) {
    var _db = new ExtendedDatabaseAPI(hoodie, hoodie.database(db));
    _db.update('post', task.mediaObject.id, task.mediaObject, function (err, doc) {
      console.log(err);
      task.mediaObject = doc;
      cb(err, task);
    });
  };

  var _feed = function (task, db, cb) {
    var _db = new ExtendedDatabaseAPI(hoodie, hoodie.database(db));
    _db.findAll('post', function (err, doc) {
      task.rows = doc;
      if (err && err.error === 'not_found') return cb(null, task);
      cb(err, task);
    });
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

  SocialMedia.updatePost = function (db, task) {

    async.series([
        // async.apply(_setAttrs, task, 'postId'),
        async.apply(_updatePost, task, db)
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
