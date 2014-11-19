/**
 * Hoodie plugin socialmedia
 * Lightweight and easy socialmedia
 */

/* global Hoodie */

Hoodie.extend(function (hoodie) {
  'use strict';

  var _subscribers = function (task) {
    var defer = window.jQuery.Deferred();
    hoodie.task('subscribers').start(task)
      .then(defer.resolve)
      .fail(defer.reject);
    return defer.promise();
  };

  var _subscriptions = function (task) {
    var defer = window.jQuery.Deferred();
    hoodie.task('subscriptions').start(task)
      .then(defer.resolve)
      .fail(defer.reject);
    return defer.promise();
  };

  var _handleFollowing = function (task) {
    task.following = task.subscriptions;
    return task;
  };

  var _handleFollowers = function (task) {
    task.followers = task.subscribers;
    return task;
  };

  hoodie.socialmedia = {

    follow: function (userName) {
      var task = {
        userName: userName
      };
      return hoodie.task('follow').start(task);
    },

    verifyUser: function (userName) {
      var defer = window.jQuery.Deferred();
      var task;
      if (!userName) {
        task = {
          userId: hoodie.id()
        }
        defer.resolve(task);
      } else {
        task = {
          userName: userName
        };
        hoodie.task('lookup').start(task)
          .then(function (task) {
            defer.resolve({
              userId: task.userId,
              userName: task.userName
            })
          })
          .fail(defer.reject);
      };
      return defer.promise();
    },

    following: function (userName) {
      return hoodie.socialmedia.verifyUser(userName)
        .then(_subscriptions)
        .then(_handleFollowing);
    },

    followers: function (userName) {
      return hoodie.socialmedia.verifyUser(userName)
        .then(_subscribers)
        .then(_handleFollowers);
    },

    unfollow: function (userName) {
      var task = {
        userName: userName
      };
      return hoodie.task('unfollow').start(task);
    },

    post: function (mediaObject, userName) {
      var defer = window.jQuery.Deferred();
      hoodie.socialmedia.verifyUser(userName)
        .then(function (task) {
          task.mediaObject = mediaObject;
          hoodie.task('post').start(task)
            .then(defer.resolve)
            .fail(defer.reject);
        });
      return defer.promise();
    },

    updatePost: function (mediaObject, userName) {
      var defer = window.jQuery.Deferred();
      hoodie.socialmedia.verifyUser(userName)
        .then(function (task) {
          task.mediaObject = mediaObject;
          hoodie.task('updatepost').start(task)
            .then(defer.resolve)
            .fail(defer.reject);
        });
      return defer.promise();
    },

    deletePost: function (mediaObject, userName) {
      var defer = window.jQuery.Deferred();
      hoodie.socialmedia.verifyUser(userName)
        .then(function (task) {
          task.mediaObject = mediaObject;
          hoodie.task('deletepost').start(task)
            .then(defer.resolve)
            .fail(defer.reject);
        });
      return defer.promise();
    },

    feed: function (userName) {
      var defer = window.jQuery.Deferred();
      hoodie.socialmedia.verifyUser(userName)
        .then(function (task) {
          hoodie.task('feed').start({userId: task.userId})
            .then(defer.resolve)
            .fail(defer.reject);
        });
      return defer.promise();
    }
  }

});
