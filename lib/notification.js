/**
 * Dependencies
 */

var async = require('async');
var utils = require('hoodie-utils-plugins')('socialmedia:notification');
var log = utils.debug();
var ExtendedDatabaseAPI = utils.ExtendedDatabaseAPI;

module.exports = function (hoodie) {
  var Notification = this;

  var _verifyAttrs = function (task, attr, cb) {
    log('_verifyAttrs', task);
    if (!attr || !task[attr]) {
      return cb('Pls, fill the param: ' + attr);
    }
    cb();
  };

  var _createNotification = function (task, db, notificationType, cb) {
    log('_createNotification', task);
    var _db = new ExtendedDatabaseAPI(hoodie, hoodie.database('user/' + task.socialmedia.userId));
    _db.add('notification', { id: (Date.now()).toString(36), notificationType: notificationType, from: db.split('/').pop(), to: task.socialmedia.userId }, cb);
  };

  Notification.requestFriend = function (db, task) {
    log('requestFriend', task);

    async.series([
        async.apply(_verifyAttrs, task, 'socialmedia'),
        async.apply(_verifyAttrs, task.socialmedia, 'userId'),
        async.apply(_createNotification, task, db, 'requestFriend')
      ],
      utils.handleTask(hoodie, 'sharePost', db, task)
    );
  };

  return Notification;
};
