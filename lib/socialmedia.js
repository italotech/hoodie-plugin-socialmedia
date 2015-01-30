/**
 * Dependencies
 */

var async = require('async');
var PubSub = require('hoodie-plugin-pubsub/lib');
var Profile = require('hoodie-plugin-profile/lib');
var utils = require('hoodie-utils-plugins')('socialmedia:socialmedia');
var log = utils.debug();
var ExtendedDatabaseAPI = utils.ExtendedDatabaseAPI;


module.exports = function (hoodie, dbPluginProfile) {
  var SocialMedia = this;
  var pubsub = new PubSub(hoodie);
  var profile = new Profile(hoodie);

  var _lookup = function (task, db, cb) {
    log('_lookup', task);
    task.profile = task.socialmedia;
    return profile.getByUserName(db, task, cb);
  };

  var _verifyAttrs = function (task, attr, cb) {
    log('_verifyAttrs', task);
    if (!attr || !task[attr]) {
      return cb('Pls, fill the param: ' + attr);
    }
    cb();
  };

  var subscribe = function (task, db, cb) {
    log('subscribe', task);

    task.pubsub = task.profile;
    task.pubsub.subject = 'post';
    return pubsub.subscribe(db, task, cb);
  };

  var unsubscribe = function (task, db, cb) {
    log('unsubscribe', task);
    task.pubsub = {
      userId: task.profile.userId,
      subject: 'post'
    };
    return pubsub.unsubscribe(db, task, cb);
  };

  var _post = function (task, db, cb) {
    log('_post', task);
    var _db = new ExtendedDatabaseAPI(hoodie, hoodie.database(db));

    // @fix _db.add not generating id
    task.socialmedia.post.id = (Date.now()).toString(36);
    task.socialmedia.post.owner = {
      db: db,
      userName: task.socialmedia.userName,
      userId: db.split('/').pop()
    };
    _db.add('post', task.socialmedia.post, function (err, doc) {
      task.socialmedia.post = doc;
      cb(err, task);
    });
  };

  // @todo update only if owner
  var _updatePost = function (task, db, cb) {
    log('_updatePost', task);
    var _db = new ExtendedDatabaseAPI(hoodie, hoodie.database(db));
    _db.update('post', task.socialmedia.post.id, task.socialmedia.post, function (err, doc) {
      task.socialmedia.post = doc;
      cb(err, task);
    });
  };

  // @todo delete only if owner
  var _deletePost = function (task, db, cb) {
    log('_deletePost', task);
    var _db = new ExtendedDatabaseAPI(hoodie, hoodie.database(db));
    if (!task.socialmedia.post || !task.socialmedia.post.id) {
      _db.removeAll('post', function (err, doc) {
        task.socialmedia.post = doc;
        cb(err, task);
      });
    } else {
      _validateOwner(task, db, function (err) {
        if (err) return cb(err, task);
        _db.remove('post', task.socialmedia.post.id, function (err, doc) {
          task.socialmedia.post = doc;
          cb(err, task);
        });
      });
    }
  };

  var _feed = function (task, db, cb) {
    log('_feed', task);
    var _db = new ExtendedDatabaseAPI(hoodie, hoodie.database('user/' + task.socialmedia.userId));
    _db.findAll('post', function (err, doc) {
      task.socialmedia.feed = doc;
      if (err && err.error === 'not_found') return cb(null, task);
      cb(err, task);
    });
  };

  var _validateOwner = function (task, db, cb) {
    log('_validateOwner', task);
    _findPost(task, db, function (err) {
      if (task.socialmedia.post.owner.db !== db) return cb('you should not pass! <|>:-|>', task);
      cb(err, task);
    });
  };

  var _findPost = function (task, db, cb) {
    log('_findPost', task);
    var _db = new ExtendedDatabaseAPI(hoodie, hoodie.database(db));
    _db.find('post', task.socialmedia.post.id, function (err, doc) {
      if (err && err.error === 'not_found') return cb(null, task);
      task.socialmedia.post = doc;
      cb(err, task);
    });
  };

  var _comment = function (task, db, cb) {
    log('_comment', task);
    _findPost(task, task.socialmedia.post.owner.db, function (err, _task) {
      var doc = _task.socialmedia.post;
      if (!doc.comments) doc.comments = [];
      task.socialmedia.comment.id = (Date.now()).toString(36);
      task.socialmedia.comment.owner = {
        db: db,
        userName: task.socialmedia.userName,
        userId: db.split('/').pop()
      };
      task.socialmedia.comment.createdAt = new Date();
      doc.comments.push(task.socialmedia.comment);
      _updatePost(task, task.socialmedia.post.owner.db, cb);
    });
  };

  var _updateComment = function (task, db, cb) {
    log('_updateComment', task);
    var commentId = task.socialmedia.comment.id;

    _findPost(task, task.socialmedia.post.owner.db, function (err, _task) {
      var doc = _task.socialmedia.post;

      if (!doc.comments) return cb('Comment not found.', task);

      doc.comments.map(function (comment, i) {
        if (comment.id !== commentId) return;
        if (!comment.owner || comment.owner.db !== db) return cb('you should not pass! <|>:-|>');

        doc.comments[i] = task.socialmedia.comment;
        doc.comments[i].id = comment.id;

        return _updatePost(task, task.socialmedia.post.owner.db, cb);
      });
    });
  };

  var _deleteComment = function (task, db, cb) {
    log('_deleteComment', task);
    var commentId = task.socialmedia.comment.id;

    _findPost(task, task.socialmedia.post.owner.db, function (err, _task) {
      var doc = _task.socialmedia.post;

      if (!doc.comments) return cb('Comment not found.', task);

      doc.comments.map(function (comment, i) {
        if (comment.id !== commentId) return;
        if (!comment.owner || comment.owner.db !== db) return cb('you should not pass! <|>:-|>');

        doc.comments.splice(i, 1);

        return _updatePost(task, task.socialmedia.post.owner.db, cb);
      });
    });
  };

  var _count = function (task, db, cb) {
    log('_count', task);
    _findPost(task, task.socialmedia.post.owner.db, function (err, _task) {
      var doc = _task.socialmedia.post;
      if (!doc.countType) doc.countType = {};
      if (!doc.countType[task.socialmedia.countType]) doc.countType[task.socialmedia.countType] = [];
      doc.countType[task.socialmedia.countType].push(db);
      _updatePost(task, task.socialmedia.post.owner.db, cb);
    });
  };

  var _uncount = function (task, db, cb) {
    log('_uncount', task);
    _findPost(task, task.socialmedia.post.owner.db, function (err, _task) {
      var doc = _task.socialmedia.post;
      if (!doc.countType) return cb(null, task);
      if (!doc.countType[task.socialmedia.countType]) cb(null, task);
      doc.countType[task.socialmedia.countType].splice(doc.countType[task.socialmedia.countType].indexOf(db), 1);
      _updatePost(task, task.socialmedia.post.owner.db, cb);
    });
  };

  var _sharePost = function (task, db, cb) {
    log('_sharePost', task);
    _findPost(task, task.socialmedia.post.owner.db, function (err, _task) {
      var doc = _task.socialmedia.post;
      doc.sourceId = _task.socialmedia.post.id;
      delete doc._rev;
      _post(task, db, cb);
    });
  };

  var _mimicTaskSubscribe = function (task, userId, cb) {
    task.profile = {
      userId: userId
    };
    cb();
  };

  var _getProfilesAsObject = function (task, db, cb) {
    log('_getProfilesAsObject', task);
    if (!task.socialmedia.feed)
      return cb();
    var ids =  task.socialmedia.feed.map(function (v) {
      return v.owner && v.owner.userId;
    });
    dbPluginProfile.findSome('profile', ids, function (err, rows) {
      if (err) return cb(err);
      task.socialmedia.profiles = {};
      rows.map(function (v) {
        task.socialmedia.profiles[v.doc.userId] = v.doc;
      })
      cb();
    });
  };

  var _setProfilesIntoPost = function (task, db, cb) {
    log('_setProfilesIntoPost', task);
    if (!task.socialmedia.profiles)
      return cb();
    task.socialmedia.feed.map(function (v, k, a) {
      a[k].owner = task.socialmedia.profiles[v.owner.userId];
    });
    delete task.socialmedia.profiles;
    cb();
  };

  SocialMedia.lookup = function (db, task, cb) {
    log('lookup', task);

    async.series([
        async.apply(_verifyAttrs, task, 'socialmedia'),
        async.apply(_verifyAttrs, task.socialmedia, 'userName'),
        async.apply(_lookup, task, db)
      ],
      utils.handleTask(hoodie, 'lookup', db, task, cb)
    );
  };

  SocialMedia.follow = function (db, task) {
    log('follow', task);

    async.series([
        async.apply(_verifyAttrs, task, 'socialmedia'),
        async.apply(_verifyAttrs, task.socialmedia, 'userName'),
        async.apply(_lookup, task, db),
        async.apply(subscribe, task, db)
      ],
      utils.handleTask(hoodie, 'follow', db, task)
    );
  };


  SocialMedia.unfollow = function (db, task) {
    log('unfollow', task);

    async.series([
        async.apply(_verifyAttrs, task, 'socialmedia'),
        async.apply(_verifyAttrs, task.socialmedia, 'userName'),
        async.apply(_lookup, task, db),
        async.apply(unsubscribe, task, db)
      ],
      utils.handleTask(hoodie, 'unfollow', db, task)
    );
  };

  SocialMedia.dualFollow = function (db, task) {
    log('dualFollow', task);

    async.series([
        async.apply(_verifyAttrs, task, 'socialmedia'),
        async.apply(_verifyAttrs, task.socialmedia, 'dualFollow'),
        async.apply(_verifyAttrs, task.socialmedia.dualFollow, 'to'),
        async.apply(_verifyAttrs, task.socialmedia.dualFollow, 'from'),
        async.apply(_mimicTaskSubscribe, task, task.socialmedia.dualFollow.to),
        async.apply(subscribe, task, 'user/' + task.socialmedia.dualFollow.from),
        async.apply(_mimicTaskSubscribe, task, task.socialmedia.dualFollow.from),
        async.apply(subscribe, task, 'user/' + task.socialmedia.dualFollow.to),
      ],
      utils.handleTask(hoodie, 'dualFollow', db, task)
    );
  };

  SocialMedia.post = function (db, task) {
    log('post', task);

    async.series([
        async.apply(_verifyAttrs, task, 'socialmedia'),
        async.apply(_verifyAttrs, task.socialmedia, 'userName'),
        async.apply(_verifyAttrs, task.socialmedia, 'post'),
        async.apply(_post, task, db)
      ],
      utils.handleTask(hoodie, 'post', db, task)
    );
  };

  SocialMedia.getPost = function (db, task) {
    log('getPost', task);

    async.series([
        async.apply(_verifyAttrs, task, 'socialmedia'),
        async.apply(_verifyAttrs, task.socialmedia, 'post'),
        async.apply(_verifyAttrs, task.socialmedia.post, 'id'),
        async.apply(_findPost, task, db)
      ],
      utils.handleTask(hoodie, 'getPost', db, task)
    );
  };

  SocialMedia.updatePost = function (db, task) {
    log('updatePost', task);

    async.series([
        async.apply(_verifyAttrs, task, 'socialmedia'),
        async.apply(_verifyAttrs, task.socialmedia, 'userName'),
        async.apply(_verifyAttrs, task.socialmedia, 'post'),
        async.apply(_verifyAttrs, task.socialmedia.post, 'id'),
        async.apply(_validateOwner, task, db),
        async.apply(_updatePost, task, db)
      ],
      utils.handleTask(hoodie, 'updatePost', db, task)
    );
  };

  SocialMedia.deletePost = function (db, task) {
    log('deletePost', task);

    async.series([
//        async.apply(_verifyAttrs, task, 'userId'),
        async.apply(_deletePost, task, db)
      ],
      utils.handleTask(hoodie, 'deletePost', db, task)
    );
  };

  SocialMedia.feed = function (db, task) {
    log('feed', task);

    async.series([
        async.apply(_verifyAttrs, task, 'socialmedia'),
        async.apply(_verifyAttrs, task.socialmedia, 'userId'),
        async.apply(_feed, task, db),
        async.apply(_getProfilesAsObject, task, db),
        async.apply(_setProfilesIntoPost, task, db),
      ],
      utils.handleTask(hoodie, 'feed', db, task)
    );
  };

  SocialMedia.comment = function (db, task) {
    log('comment', task);

    async.series([
        async.apply(_verifyAttrs, task, 'socialmedia'),
        async.apply(_verifyAttrs, task.socialmedia, 'post'),
        async.apply(_verifyAttrs, task.socialmedia.post, 'id'),
        async.apply(_verifyAttrs, task.socialmedia, 'comment'),
        async.apply(_findPost, task, db),
        async.apply(_comment, task, db)
      ],
      utils.handleTask(hoodie, 'comment', db, task)
    );
  };

  SocialMedia.count = function (db, task) {
    log('count', task);

    async.series([
        async.apply(_verifyAttrs, task, 'socialmedia'),
        async.apply(_verifyAttrs, task.socialmedia, 'post'),
        async.apply(_verifyAttrs, task.socialmedia.post, 'id'),
        async.apply(_verifyAttrs, task.socialmedia, 'countType'),
        async.apply(_findPost, task, db),
        async.apply(_count, task, db)
      ],
      utils.handleTask(hoodie, 'count', db, task)
    );
  };

  SocialMedia.uncount = function (db, task) {
    log('uncount', task);

    async.series([
        async.apply(_verifyAttrs, task, 'socialmedia'),
        async.apply(_verifyAttrs, task.socialmedia, 'post'),
        async.apply(_verifyAttrs, task.socialmedia.post, 'id'),
        async.apply(_verifyAttrs, task.socialmedia, 'countType'),
        async.apply(_findPost, task, db),
        async.apply(_uncount, task, db)
      ],
      utils.handleTask(hoodie, 'uncount', db, task)
    );
  };

  SocialMedia.updateComment = function (db, task) {
    log('updateComment', task);

    async.series([
        async.apply(_verifyAttrs, task, 'socialmedia'),
        async.apply(_verifyAttrs, task.socialmedia, 'post'),
        async.apply(_verifyAttrs, task.socialmedia.post, 'id'),
        async.apply(_verifyAttrs, task.socialmedia, 'comment'),
        async.apply(_verifyAttrs, task.socialmedia.comment, 'id'),
        async.apply(_updateComment, task, db)
      ],
      utils.handleTask(hoodie, 'updateComment', db, task)
    );
  };

  SocialMedia.deleteComment = function (db, task) {
    log('deleteComment', task);

    async.series([
        async.apply(_verifyAttrs, task, 'socialmedia'),
        async.apply(_verifyAttrs, task.socialmedia, 'post'),
        async.apply(_verifyAttrs, task.socialmedia.post, 'id'),
        async.apply(_verifyAttrs, task.socialmedia, 'comment'),
        async.apply(_verifyAttrs, task.socialmedia.comment, 'id'),
        async.apply(_deleteComment, task, db)
      ],
      utils.handleTask(hoodie, 'deleteComment', db, task)
    );
  };

  SocialMedia.sharePost = function (db, task) {
    log('sharePost', task);

    async.series([
        async.apply(_verifyAttrs, task, 'socialmedia'),
        async.apply(_verifyAttrs, task.socialmedia, 'post'),
        async.apply(_verifyAttrs, task.socialmedia.post, 'id'),
        async.apply(_sharePost, task, db)
      ],
      utils.handleTask(hoodie, 'sharePost', db, task)
    );
  };

  return SocialMedia;
};
