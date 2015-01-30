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
    var ids = pluck(pluck(task.pubsub.subscriptions, 'doc'), 'userId');
    hoodie.profile.get(ids)
      .then(function (_task) {
        task.socialmedia = (!task.socialmedia) ? {} : task.socialmedia;
        task.socialmedia.following = pluck(_task.profile, 'doc');
        defer.resolve(task);
      })
      .fail(defer.reject);
    return defer.promise();
  };

  var _handleAttr = function (task, attr) {
    var defer = window.jQuery.Deferred();
    var ids = [];
    task.pubsub.subscribers.map(function (v) {
      ids.push(v.doc.target.split('/').pop());
    });
    hoodie.profile.get(ids)
      .then(function (_task) {
        task.socialmedia = (!task.socialmedia) ? {} : task.socialmedia;
        task.socialmedia[attr] = pluck(_task.profile, 'doc');
        defer.resolve(task);
      })
      .fail(defer.reject);
    return defer.promise();
  };

  var _handleFollowers = function (task) {
    return _handleAttr(task, 'followers');
  };

  var _handleFriends = function (task) {
    return _handleAttr(task, 'friends');
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

  function pluck(originalArr, prop) {
    var newArr = [];
    for (var i = 0; i < originalArr.length; i++) {
      newArr[i] = originalArr[i][prop];
    }
    return newArr;
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
      hoodie.task('socialmediafollow').start(task)
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
      hoodie.task('socialmediaunfollow').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    getProfile: function (userName) {
      var defer = window.jQuery.Deferred();
      defer.notify('getProfile', arguments, false);
      if (!userName) {
        hoodie.profile.get()
          .then(defer.resolve)
          .fail(defer.reject);
      } else {
        hoodie.profile.getByUserName(userName)
          .then(function (task) {
            defer.resolve({
              profile: task.profile
            });
          })
          .fail(defer.reject);
      }
      return defer.promise();
    },

    following: function (userName) {
      return hoodie.socialmedia.getProfile(userName)
        .then(_subscriptions)
        .then(_handleFollowing);
    },

    followers: function (userName) {
      return hoodie.socialmedia.getProfile(userName)
        .then(_subscribers)
        .then(_handleFollowers);
    },

    friends: function (userName) {
      return hoodie.socialmedia.getProfile(userName)
        .then(_subscribers)
        .then(_handleFriends);
    },

    getOwner: function () {
      return {
        db: 'user/' + hoodie.id(),
        userId: hoodie.id(),
        userName: hoodie.account.username
      };
    },

    returnTask: function (attr, cb) {
      return function (arg) {
        var task = {
          socialmedia: {
          }
        };
        task.socialmedia[attr] = arg;
        cb(task);
      };
    },

    post: function (postObject, userName) {
      var defer = window.jQuery.Deferred();
      defer.notify('post', arguments, false);
      hoodie.socialmedia.getProfile(userName)
        .fail(defer.reject)
        .then(function (task) {
          task.socialmedia = task.profile;
          task.socialmedia.post = postObject;
          if (task.profile.userId === hoodie.id()) {
            postObject.owner = hoodie.socialmedia.getOwner();
            hoodie.store.add('post', postObject)
              .then(hoodie.socialmedia.returnTask('post', defer.resolve))
              .fail(defer.reject);
          } else {
            hoodie.task('socialmediapost').start(task)
              .then(defer.resolve)
              .fail(defer.reject);
          }
        });
      return defer.promise();
    },

    updatePost: function (postObject, userName) {
      var defer = window.jQuery.Deferred();
      defer.notify('updatePost', arguments, false);
      hoodie.socialmedia.getProfile(userName)
        .fail(defer.reject)
        .then(function (task) {
          task.socialmedia = task.profile;
          task.socialmedia.post = postObject;
          if (task.profile.userId === hoodie.id()) {
            hoodie.store.update('post', postObject.id, postObject)
              .then(hoodie.socialmedia.returnTask('post', defer.resolve))
              .fail(defer.reject);
          } else {
            hoodie.task('socialmediaupdatepost').start(task)
              .then(defer.resolve)
              .fail(defer.reject);
          }
        });
      return defer.promise();
    },

    deletePost: function (postObject, userName) {
      var defer = window.jQuery.Deferred();
      defer.notify('deletePost', arguments, false);
      hoodie.socialmedia.getProfile(userName)
        .fail(defer.reject)
        .then(function (task) {
          task.socialmedia = task.profile;
          task.socialmedia.post = postObject;
          if (task.profile.userId === hoodie.id()) {
            if (!postObject) {
              hoodie.store.removeAll('post')
                .then(defer.resolve)
                .fail(defer.reject);
            } else {
              hoodie.store.remove('post', postObject.id)
                .then(defer.resolve)
                .fail(defer.reject);
            }
          } else {
            hoodie.task('socialmediadeletepost').start(task)
              .then(defer.resolve)
              .fail(defer.reject);
          }
        });
      return defer.promise();
    },

    feed: function (userName) {
      var defer = window.jQuery.Deferred();
      defer.notify('feed', arguments, false);
      hoodie.socialmedia.getProfile(userName)
        .fail(defer.reject)
        .then(function (task) {
          task.socialmedia = task.profile;
          if (task.profile.userId === hoodie.id()) {
            hoodie.store.findAll('post')
              .then(hoodie.socialmedia.returnTask('feed', defer.resolve))
              .fail(defer.reject);
          } else {
            hoodie.task('socialmediafeed').start(task)
              .then(defer.resolve)
              .fail(defer.reject);
          }
        });
      return defer.promise();
    },

    comment: function (postObject, commentObject) {
      var defer = window.jQuery.Deferred();
      defer.notify('comment', arguments, false);
      var task = {
        socialmedia: {
          post: postObject,
          comment: commentObject
        }
      };
      hoodie.store.find('post', postObject.id)
        .then(function (post) {
          post.comment.push(comment);
          hoodie.socialmedia.updatePost(post)
            .then(defer.resolve)
            .fail(defer.reject);
        })
        .fail(function () {
          hoodie.task('socialmediacomment').start(task)
            .then(defer.resolve)
            .fail(defer.reject);
        });
      return defer.promise();
    },
    updateComment: function (postObject, commentObject) {
      var defer = window.jQuery.Deferred();
      defer.notify('updateComment', arguments, false);
      var task = {
        socialmedia: {
          post: postObject,
          comment: commentObject
        }
      };
      hoodie.task('socialmediaupdatecomment').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },
    deleteComment: function (postObject, commentObject) {
      var defer = window.jQuery.Deferred();
      defer.notify('', arguments, false);
      var task = {
        socialmedia: {
          post: postObject,
          comment: commentObject
        }
      };
      hoodie.task('socialmediadeletecomment').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },
    count: function (postObject, commentObject) {
      var defer = window.jQuery.Deferred();
      defer.notify('count', arguments, false);
      var task = {
        socialmedia: {
          post: postObject,
          countType: commentObject
        }
      };
      hoodie.task('socialmediacount').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },
    uncount: function (postObject, commentObject) {
      var defer = window.jQuery.Deferred();
      defer.notify('uncount', arguments, false);
      var task = {
        socialmedia: {
          post: postObject,
          countType: commentObject
        }
      };
      hoodie.task('socialmediauncount').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },
    getPost: function (postObject) {
      var defer = window.jQuery.Deferred();
      defer.notify('getPost', arguments, false);
      var task = {
        socialmedia: {
          post: postObject
        }
      };
      hoodie.task('socialmediagetpost').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },
    share: function (postObject) {
      var defer = window.jQuery.Deferred();
      defer.notify('share', arguments, false);
      var task = {
        socialmedia: {
          post: postObject
        }
      };
      hoodie.task('socialmediashare').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    requestFriend: function (userName) {
      var defer = window.jQuery.Deferred();
      defer.notify('requestFriend', arguments, false);
      hoodie.socialmedia.getProfile(userName)
        .fail(defer.reject)
        .then(function (task) {
          hoodie.notification.create(hoodie.id(), task.profile.userId, 'requestFriend')
            .then(defer.resolve)
            .fail(defer.reject);
        });
      return defer.promise();
    },
    dualFollow: function (task) {
      var defer = window.jQuery.Deferred();
      defer.notify('dualFollow', arguments, false);
      hoodie.task('socialmediadualfollow').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },
    acceptedFriend: function (userId) {
      var defer = window.jQuery.Deferred();
      defer.notify('acceptedFriend', arguments, false);
      hoodie.notification.create(hoodie.id(), userId, 'acceptedFriend')
        .then(function () {
          var task = {
            socialmedia: {
              dualFollow: {
                from: userId,
                to: hoodie.id()
              }
            }
          };
          hoodie.socialmedia.dualFollow(task)
            .then(function () {
              hoodie.notification.desactive(userId, 'requestFriend')
                .then(defer.resolve)
                .fail(defer.reject);
            })
            .fail(defer.reject);
        })
        .fail(defer.reject);

      return defer.promise();
    },
    rejectedFriend: function (userName) {
      var defer = window.jQuery.Deferred();
      defer.notify('requestFriend', arguments, false);
      hoodie.socialmedia.getProfile(userName)
        .fail(defer.reject)
        .then(function (task) {
          hoodie.notification.create(hoodie.id(), task.profile.userId, 'rejectedFriend')
            .then(defer.resolve)
            .fail(defer.reject);
        });
      return defer.promise();
    },
    updateProfile: function (profile) {
      var defer = window.jQuery.Deferred();
      defer.notify('updateProfile', arguments, false);
      hoodie.profile.set(profile)
        .then(defer.resolve)
        .fail(defer.reject);
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
