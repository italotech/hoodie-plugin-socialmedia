/**
 * Hoodie plugin socialmedia
 * Lightweight and easy socialmedia
 */

/* global Hoodie */

Hoodie.extend(function (hoodie) {
  'use strict';

  var _subscribers = function (task) {
    var defer = window.jQuery.Deferred();
    defer.notify('_subscribers', arguments, false);
    hoodie.pubsub.subscribers(task.profile.userId)
      .then(defer.resolve)
      .fail(defer.reject);
    return defer.promise();
  };

  var _subscriptions = function (task) {
    var defer = window.jQuery.Deferred();
    defer.notify('_subscriptions', arguments, false);
    hoodie.pubsub.subscriptions(task.profile.userId)
      .then(defer.resolve)
      .fail(defer.reject);
    return defer.promise();
  };

  var _handleFollowing = function (task) {
    var defer = window.jQuery.Deferred();
    var ids = _.pluck(_.pluck(task.pubsub.subscriptions, 'doc'), 'userId');
    hoodie.profile.get(ids)
      .then(function (_task) {
        task.socialmedia = (!task.socialmedia) ? {} : task.socialmedia;
        task.socialmedia.following = _.pluck(_task.profile, 'doc');
        defer.resolve(task);
      })
      .fail(defer.reject);
    return defer.promise();
  };

  var _handleFollowers = function (task) {
    var defer = window.jQuery.Deferred();
    var ids = _.pluck(_.pluck(task.pubsub.subscribers, 'doc'), 'userId');
    hoodie.profile.get(ids)
      .then(function (_task) {
        task.socialmedia = (!task.socialmedia) ? {} : task.socialmedia;
        task.socialmedia.followers = _.pluck(_task.profile, 'doc');
        defer.resolve(task);
      })
      .fail(defer.reject);
    return defer.promise();
  };

  function partialRight(fn /*, args...*/) {
    // A reference to the Array#slice method.
    var slice = Array.prototype.slice;
    // Convert arguments object to an array, removing the first argument.
    var args = slice.call(arguments, 1);

    return function () {
      // Invoke the originally-specified function, passing in all just-
      // specified arguments, followed by any originally-specified arguments.
      return fn.apply(this, slice.call(arguments, 0).concat(args));
    };
  }

  hoodie.socialmedia = {

    follow: function (userName) {
      var defer = window.jQuery.Deferred();
      defer.notify('follow', arguments, false);
      var task = {
        socialmedia: {
          userName: userName
        }
      };
      hoodie.task('follow').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    unfollow: function (userName) {
      var defer = window.jQuery.Deferred();
      defer.notify('unfollow', arguments, false);
      var task = {
        socialmedia: {
          userName: userName
        }
      };
      hoodie.task('unfollow').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    verifyUser: function (userName) {
      var defer = window.jQuery.Deferred();
      defer.notify('verifyUser', arguments, false);
      var task;
      if (!userName) {
        hoodie.profile.get()
          .then(defer.resolve)
          .fail(defer.reject);
      } else {
        hoodie.profile.getByUserName(userName)
          .then(defer.resolve)
          .fail(defer.reject);
      }
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

    post: function (postObject, userName) {
      var defer = window.jQuery.Deferred();
      defer.notify('post', arguments, false);
      hoodie.socialmedia.verifyUser(userName)
        .fail(defer.reject)
        .then(function (task) {
          task.postObject = postObject;
          hoodie.task('post').start(task)
            .then(defer.resolve)
            .fail(defer.reject);
        });
      return defer.promise();
    },

    updatePost: function (postObject, userName) {
      var defer = window.jQuery.Deferred();
      defer.notify('updatePost', arguments, false);
      hoodie.socialmedia.verifyUser(userName)
        .fail(defer.reject)
        .then(function (task) {
          task.postObject = postObject;
          hoodie.task('updatepost').start(task)
            .then(defer.resolve)
            .fail(defer.reject);
        });
      return defer.promise();
    },

    deletePost: function (postObject, userName) {
      var defer = window.jQuery.Deferred();
      defer.notify('deletePost', arguments, false);
      hoodie.socialmedia.verifyUser(userName)
        .fail(defer.reject)
        .then(function (task) {
          task.postObject = postObject;
          hoodie.task('deletepost').start(task)
            .then(defer.resolve)
            .fail(defer.reject);
        });
      return defer.promise();
    },

    feed: function (userName) {
      var defer = window.jQuery.Deferred();
      defer.notify('', arguments, false);
      hoodie.socialmedia.verifyUser(userName)
        .fail(defer.reject)
        .then(function (task) {
          hoodie.task('feed').start({userId: task.userId})
            .then(defer.resolve)
            .fail(defer.reject);
        });
      return defer.promise();
    },

    comment: function (postObjectPost, postObjectComment) {
      var defer = window.jQuery.Deferred();
      defer.notify('comment', arguments, false);
      hoodie.task('comment').start({postObject: postObjectPost, commentObject: postObjectComment})
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },
    updateComment: function (postObjectPost, postObjectComment) {
      var defer = window.jQuery.Deferred();
      defer.notify('', arguments, false);
      hoodie.task('updatecomment').start({postObject: postObjectPost, commentObject: postObjectComment})
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },
    deleteComment: function (postObjectPost, postObjectComment) {
      var defer = window.jQuery.Deferred();
      defer.notify('', arguments, false);
      hoodie.task('deletecomment').start({postObject: postObjectPost, commentObject: postObjectComment})
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },
    count: function (postObjectPost, countType) {
      var defer = window.jQuery.Deferred();
      defer.notify('count', arguments, false);
      hoodie.task('count').start({postObject: postObjectPost, countType: countType})
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },
    uncount: function (postObjectPost, countType) {
      var defer = window.jQuery.Deferred();
      defer.notify('uncount', arguments, false);
      hoodie.task('uncount').start({postObject: postObjectPost, countType: countType})
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },
    getPost: function (postObjectPost) {
      var defer = window.jQuery.Deferred();
      defer.notify('getPost', arguments, false);
      hoodie.task('getpost').start({postObject: postObjectPost})
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },
    getProfile: function (userName) {
      var defer = window.jQuery.Deferred();
      defer.notify('getProfile', arguments, false);
      hoodie.socialmedia.verifyUser(userName)
        .fail(defer.reject)
        .then(function (task) {
          hoodie.socialmedia.getProfileById(task.userId)
            .then(defer.resolve)
            .fail(defer.reject);
        });
      return defer.promise();
    },
    getProfileById: function (userId) {
      var defer = window.jQuery.Deferred();
      defer.notify('getProfileById', arguments, false);
      hoodie.task('getprofile').start({userId: userId})
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },
    updateProfile: function (profileObject) {
      var defer = window.jQuery.Deferred();
      defer.notify('updateProfile', arguments, false);
      hoodie.task('updateprofile').start({profileObject: profileObject})
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },
    share: function (postObjectPost) {
      var defer = window.jQuery.Deferred();
      defer.notify('share', arguments, false);
      hoodie.task('share').start({postObject: postObjectPost})
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },
    notification : {
      on: function (cb) {
        hoodie.store.on('notification:add', cb);
      }
    },
    requestFriend: function (userName) {
      var defer = window.jQuery.Deferred();
      defer.notify('requestFriend', arguments, false);
      hoodie.socialmedia.verifyUser(userName)
        .fail(defer.reject)
        .then(function (task) {
          task.socialmedia = task.profile;
          hoodie.task('requestfriend').start({userId: task.profile.userId})
            .then(defer.resolve)
            .fail(defer.reject);
        });
      return defer.promise();
    }
  };
  hoodie.socialmedia.like = partialRight(hoodie.socialmedia.count, 'like');
  hoodie.socialmedia.unlike = partialRight(hoodie.socialmedia.uncount, 'like');
  hoodie.socialmedia.abuse = partialRight(hoodie.socialmedia.count, 'abuse');

  // var debugPromisseGstart = function (text) {
  //   var defer = window.jQuery.Deferred();
  //   (window.debug === 'socialmedia') && console.groupCollapsed(text);
  //   defer.resolve({});
  //   return defer.promise();
  // };

  // var debugPromisseGend = function () {
  //   var defer = window.jQuery.Deferred();
  //   (window.debug === 'socialmedia') && console.groupEnd();
  //   defer.resolve({});
  //   return defer.promise();
  // };

  function out(name, obj, task) {
    if (window.debug === 'socialmedia') {
      var group = (task) ? 'task: ' + task + '(' + name + ')': 'method: ' + name;

      console.groupCollapsed(group);
      if (!!obj)
        console.table(obj);
      console.groupEnd();
    }
  }

  if (window.debug === 'socialmedia') {
    hoodie.task.on('start', function () {
      out('start', arguments[0], arguments[0].type);
    });

    // task aborted
    hoodie.task.on('abort', function () {
      out('abort', arguments[0], arguments[0].type);
    });

    // task could not be completed
    hoodie.task.on('error', function () {
      out('error', arguments, arguments[1].type);
    });

    // task completed successfully
    hoodie.task.on('success', function () {
      out('success', arguments[0], arguments[0].type);
    });
  }
});
