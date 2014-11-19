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
    task.postObject.id = (Date.now()).toString(36);
    task.postObject.owner = {
      db: db,
      userName: task.userName
    };
    _db.add('post', task.postObject, function (err, doc) {
      task.postObject = doc;
      cb(err, task);
    });
  };

  // @todo update only if owner
  var _updatePost = function (task, db, cb) {
    var _db = new ExtendedDatabaseAPI(hoodie, hoodie.database(db));
    _db.update('post', task.postObject.id, task.postObject, function (err, doc) {
      task.postObject = doc;
      cb(err, task);
    });
  };

  // @todo delete only if owner
  var _deletePost = function (task, db, cb) {
    var _db = new ExtendedDatabaseAPI(hoodie, hoodie.database(db));
    if (!task.postObject || !task.postObject.id) {
      _db.removeAll('post', function (err, doc) {
        task.postObject = doc;
        cb(err, task);
      });
    } else {
      _validateOwner(task, db, function (err) {
        if (err) return cb(err, task);
        _db.remove('post', task.postObject.id, function (err, doc) {
          task.postObject = doc;
          cb(err, task);
        });
      });
    }
  };

  var _feed = function (task, db, cb) {
    var _db = new ExtendedDatabaseAPI(hoodie, hoodie.database('user/' + task.userId));
    _db.findAll('post', function (err, doc) {
      task.rows = doc;
      if (err && err.error === 'not_found') return cb(null, task);
      cb(err, task);
    });
  };


  var _validateOwner = function (task, db, cb) {
    _findPost(task, db, function (err, doc) {
      if (doc.postObject.owner.db !== db) return cb('you should not pass! <|>:-|>', task);
      cb(err, task);
    });
  };

  var _findPost = function (task, db, cb) {
    var _db = new ExtendedDatabaseAPI(hoodie, hoodie.database(db));
    _db.find('post', task.postObject.id, function (err, doc) {
      if (err && err.error === 'not_found') return cb(null, task);
      task.postObject = doc;
      cb(err, task);
    });
  };

  var _comment = function (task, db, cb) {
    _findPost(task, task.postObject.owner.db, function (err, _task) {
      var doc = _task.postObject;
      if (!doc.comments) doc.comments = [];
      task.commentObject.id = (Date.now()).toString(36);
      task.commentObject.owner = { db: db, userName: task.userName };
      task.commentObject.createdAt = new Date();
      doc.comments.push(task.commentObject);
      _updatePost(task, task.postObject.owner.db, cb);
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
        async.apply(_setAttrs, task, 'userId'),
        async.apply(_setAttrs, task, 'postObject'),
        async.apply(_setAttrs, task.postObject, 'id'),
        async.apply(_validateOwner, task, db),
        async.apply(_updatePost, task, db)
      ],
      utils.handleTask(hoodie, 'updatePost', db, task)
    );
  };

  SocialMedia.deletePost = function (db, task) {

    async.series([
//        async.apply(_setAttrs, task, 'userId'),
        async.apply(_deletePost, task, db)
      ],
      utils.handleTask(hoodie, 'deletePost', db, task)
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

  SocialMedia.comment = function (db, task) {

    async.series([
        async.apply(_setAttrs, task, 'postObject'),
        async.apply(_setAttrs, task.postObject, 'id'),
        async.apply(_setAttrs, task, 'commentObject'),
        async.apply(_findPost, task, db),
        async.apply(_comment, task, db)
      ],
      utils.handleTask(hoodie, 'comment', db, task)
    );
  };

  return SocialMedia;
};
