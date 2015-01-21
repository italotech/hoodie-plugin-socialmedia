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

  var _createNotification = function (task, db, cb) {
    log('_createNotification', task);
    var _db = new ExtendedDatabaseAPI(hoodie, hoodie.database('user/' + task.socialmedia.notification.to));
    task.socialmedia.notification.id = (Date.now()).toString(36);
    _db.add('notification', task.socialmedia.notification, cb);
  };


  Notification.createNotification = function (db, task, cb) {
    log('createNotification', task);
    async.series([
        async.apply(_verifyAttrs, task, 'socialmedia'),
        async.apply(_verifyAttrs, task.socialmedia, 'notification'),
        async.apply(_verifyAttrs, task.socialmedia.notification, 'from'),
        async.apply(_verifyAttrs, task.socialmedia.notification, 'to'),
        async.apply(_verifyAttrs, task.socialmedia.notification, 'status'),
        async.apply(_verifyAttrs, task.socialmedia.notification, 'notificationType'),
        async.apply(_createNotification, task, db)
      ],
      utils.handleTask(hoodie, 'createNotification', db, task, cb)
    );
  };

  return Notification;
};
