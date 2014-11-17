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

  hoodie.socialmedia = {

    handleFollowing: function (task) {
      task.following = task.subscriptions;
      return task;
    },

    handleFollowers: function (task) {
      task.followers = task.subscribers;
      return task;
    },

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
            defer.resolve({userId: task.userId})
          })
          .fail(defer.reject);
      };
      return defer.promise();
    },

    following: function (userName) {
      return hoodie.socialmedia.verifyUser(userName)
        .then(_subscriptions)
        .then(hoodie.socialmedia.handleFollowing);
    },

    followers: function (userName) {
      return hoodie.socialmedia.verifyUser(userName)
        .then(_subscribers)
        .then(hoodie.socialmedia.handleFollowers);
    },

    unfollow: function (userName) {
      var task = {
        userName: userName
      };
      return hoodie.task('unfollow').start(task);
    }
  }

});
