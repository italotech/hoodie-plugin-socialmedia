/**
 * Dependencies
 */

var utils = require('hoodie-utils-plugins');
var async = require('async');
var PubSub = require('hoodie-plugin-pubsub/lib');

module.exports = function (hoodie, pluginDb, userDb) {
  var SocialMedia = this;
  var pubsub = new PubSub(hoodie);

  var lookup = function (task, cb) {
    userDb.query('by_userName', { key: task.userName.toLowerCase() }, function (err, rows) {
      if (err || !rows.length) return cb(err || new Error('not_found'));
      task.userId = rows[0].value;
      cb();
    });
  };

  var _setAttrs = function (task, cb) {
    if (!task.userName) {
      return cb(new Error('Pls, fill the param: userName'));
    }
    task.subject = 'post';
    cb();
  };

  var subscribe = function (task, db, cb) {
    return pubsub.subscribe(db, task, cb);
  };

  SocialMedia.follow = function (db, task) {

    async.series([
        async.apply(_setAttrs, task),
        async.apply(lookup, task),
        async.apply(subscribe, task, db)
      ],
      utils.handleTask(hoodie, 'follow', db, task)
    );
  };


  return SocialMedia;
};
