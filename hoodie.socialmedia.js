/**
 * Hoodie plugin socialmedia
 * Lightweight and easy socialmedia
 */

/* global Hoodie */

Hoodie.extend(function (hoodie) {
  'use strict';

  var _subscribers = function (userId) {
    var defer = window.jQuery.Deferred();
    defer.notify('_subscribers', arguments, false);
    hoodie.pubsub.subscribersByType(hoodie.socialmedia.pubsubtypes, userId)
      .then(defer.resolve)
      .fail(defer.reject);
    return defer.promise();
  };

  var _subscriptions = function (userId) {
    var defer = window.jQuery.Deferred();
    defer.notify('_subscriptions', arguments, false);
    hoodie.pubsub.subscriptionsByType(hoodie.socialmedia.pubsubtypes, userId)
      .then(defer.resolve)
      .fail(defer.reject);
    return defer.promise();
  };

  var _handleFollowing = function (task) {
    var defer = window.jQuery.Deferred();
    var ids = task.pubsub.subscriptions.map(function (v) {
      return v.userId;
    });
    hoodie.profile.get(ids)
      .then(function (_task) {
        task.socialmedia = (!task.socialmedia) ? {} : task.socialmedia;
        task.socialmedia.following = _task.profile.map(function (v) {
          return v.doc;
        });
        defer.resolve(task);
      })
      .fail(defer.reject);
    return defer.promise();
  };

  var _handleAttr = function (task, attr) {
    var defer = window.jQuery.Deferred();
    var ids = task.pubsub.subscribers.map(function (v) {
      return v.userId;
    });
    hoodie.profile.get(ids)
      .then(function (_task) {
        task.socialmedia = (!task.socialmedia) ? {} : task.socialmedia;
        task.socialmedia[attr] = _task.profile.map(function (v) {
          return v.doc;
        });
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

  var _addProfileOnPosts = function (collection) {
    var defer = window.jQuery.Deferred();
    defer.notify('addProfile', arguments, false);

    var ids = collection.map(function (v) {
      return v.userId;
    });

    var uniqueArray = ids.filter(function (item, pos, self) {
      return self.indexOf(item) === pos;
    });

    hoodie.profile.getAsObjects(uniqueArray)
      .then(function (profiles) {
        defer.resolve(
          collection.map(function (v, k, a) {
            a[k].owner = profiles[v.userId];
            return a[k];
          })
        );
      })
      .fail(function (err) {
        defer.reject(err);
      });

    return defer.promise();
  };

  var _addProfileOnComments = function (collection) {
    var defer = window.jQuery.Deferred();
    defer.notify('addProfile', arguments, false);

    var ids = collection.map(function (v) {
      return v.comments && v.comments.map(function (vv) {
        return vv.owner.userId;
      });
    });

    ids = ids.concat.apply([], ids);

    var uniqueArray = ids.filter(function (item, pos, self) {
      return (self.indexOf(item) === pos && item !== undefined);
    });

    hoodie.profile.getAsObjects(uniqueArray)
      .then(function (profiles) {
        defer.resolve(
          collection.map(function (v, k, a) {
            a[k].comments && a[k].comments.map(function (vv, kk, aa) {
              aa[kk].owner = profiles[vv.owner.userId];
              return aa[kk];
            });
            return a[k];
          })
        );
      })
      .fail(function (err) {
        defer.reject(err);
      });

    return defer.promise();
  };

  var _addProfileOnCountType = function (collection, countType) {
    var defer = window.jQuery.Deferred();
    defer.notify('addProfile', arguments, false);

    var ids = collection.map(function (v) {
      return v.countType && v.countType[countType] && v.countType[countType].map(function (vv) {
        return vv.split('/').pop();
      });
    });

    ids = ids.concat.apply([], ids);

    var uniqueArray = ids.filter(function (item, pos, self) {
      return (self.indexOf(item) === pos && item !== undefined);
    });

    hoodie.profile.getAsObjects(uniqueArray)
      .then(function (profiles) {
        defer.resolve(
          collection.map(function (v, k, a) {
            a[k].countType && a[k].countType[countType] && a[k].countType[countType].map(function (vv, kk, aa) {
              aa[kk] = profiles[vv.split('/').pop()];
              return aa[kk];
            });
            return a[k];
          })
        );
      })
      .fail(function (err) {
        defer.reject(err);
      });

    return defer.promise();
  };

  hoodie.socialmedia = {
    pubsubtypes: ['post', 'profile'],
    follow: function (userId) {
      var defer = window.jQuery.Deferred();
      defer.notify('follow', arguments, false);
      hoodie.pubsub.subscribe(userId, hoodie.socialmedia.pubsubtypes)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    unfollow: function (userId) {
      var defer = window.jQuery.Deferred();
      defer.notify('unfollow', arguments, false);
      hoodie.pubsub.unsubscribe(userId, hoodie.socialmedia.pubsubtypes)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    getProfile: function (userId) {
      var defer = window.jQuery.Deferred();
      defer.notify('getProfile', arguments, false);
      hoodie.profile.get(userId)
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    following: function (userId) {
      return _subscriptions(userId)
        .then(_handleFollowing);
    },

    followers: function (userId) {
      return _subscribers(userId)
        .then(_handleFollowers);
    },

    friends: function (userId) {
      return _subscribers(userId)
        .then(_handleFriends);
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

    post: function (postObject, userId) {
      var defer = window.jQuery.Deferred();
      defer.notify('post', arguments, false);
      userId = userId || hoodie.id();
      postObject.userId = userId;
      hoodie.profile.get()
        .then(function (_task) {
          postObject.owner = {
            id: hoodie.id(),
            name: _task.profile.name
          };
          var task = {
            socialmedia: {
              userId: userId,
              post: postObject
            }
          };
          if (userId === hoodie.id()) {
            hoodie.store.add('post', postObject)
              .then(hoodie.socialmedia.returnTask('post', defer.resolve))
              .fail(defer.reject);
          } else {
            hoodie.task('socialmediapost').start(task)
              .then(defer.resolve)
              .fail(defer.reject);
            hoodie.remote.push();
          }
        })
        .fail(defer.reject);
      return defer.promise();
    },

    updatePost: function (postObject, userId) {
      var defer = window.jQuery.Deferred();
      defer.notify('updatePost', arguments, false);
      userId = userId || hoodie.id();
      var task = {
        socialmedia: {
          userId: userId,
        }
      };
      task.socialmedia.post = postObject;
      if (userId === hoodie.id()) {
        hoodie.store.update('post', postObject.id, postObject)
          .then(hoodie.socialmedia.returnTask('post', defer.resolve))
          .fail(defer.reject);
      } else {
        hoodie.task('socialmediaupdatepost').start(task)
          .then(defer.resolve)
          .fail(defer.reject);
        hoodie.remote.push();
      }

      return defer.promise();
    },

    deletePost: function (postObject, userId) {
      var defer = window.jQuery.Deferred();
      defer.notify('deletePost', arguments, false);
      userId = userId || hoodie.id();
      var task = {
        socialmedia: {
          userId: userId,
        }
      };
      task.socialmedia.post = postObject;
      if (userId === hoodie.id()) {
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
        hoodie.remote.push();
      }

      return defer.promise();
    },

    addProfileOnPosts: function (posts) {
      var defer = window.jQuery.Deferred();
      _addProfileOnPosts(posts)
        .then(function (posts) {
          return _addProfileOnComments(posts);
        })
        .then(function (posts) {
          return _addProfileOnCountType(posts, 'like');
        })
        .then(defer.resolve)
        .fail(defer.reject);
      return defer.promise();
    },

    addProfileOnPost: function (post) {
      var posts = [post];
      var defer = window.jQuery.Deferred();
      hoodie.socialmedia.addProfileOnPosts(posts)
        .then(function (posts) {
          defer.resolve(posts[0]);
        })
        .fail(defer.reject);
      return defer.promise();
    },

    feed: function (userId) {
      var defer = window.jQuery.Deferred();
      defer.notify('feed', arguments, false);
      userId = userId || hoodie.id();
      var task = {
        socialmedia: {
          userId: userId,
        }
      };
      if (userId === hoodie.id()) {
        hoodie.store.findAll('post')
          .then(function (posts) {
            return hoodie.socialmedia.addProfileOnPosts(posts);
          })
          .then(hoodie.socialmedia.returnTask('feed', defer.resolve))
          .fail(defer.reject);
      } else {
        hoodie.task('socialmediafeed').start(task)
          .then(function (task) {
            return hoodie.socialmedia.addProfileOnPosts(task.socialmedia.feed);
          })
          .then(hoodie.socialmedia.returnTask('feed', defer.resolve))
          .fail(defer.reject);
        hoodie.remote.push();
      }

      return defer.promise();
    },
    simpleFeed: function (userId) {
      var defer = window.jQuery.Deferred();
      defer.notify('feed', arguments, false);
      userId = userId || hoodie.id();
      var task = {
        socialmedia: {
          userId: userId,
        }
      };
      if (userId === hoodie.id()) {
        hoodie.store.findAll('post')
          .then(hoodie.socialmedia.returnTask('feed', defer.resolve))
          .fail(defer.reject);
      } else {
        hoodie.task('socialmediafeed').start(task)
          .then(hoodie.socialmedia.returnTask('feed', defer.resolve))
          .fail(defer.reject);
        hoodie.remote.push();
      }

      return defer.promise();
    },

    comment: function (postObject, commentObject) {
      var defer = window.jQuery.Deferred();
      defer.notify('comment', arguments, false);
      hoodie.profile.get()
        .then(function (_task) {
          commentObject.owner = {
            id: hoodie.id(),
            name: _task.profile.name
          };
          var task = {
            socialmedia: {
              post: postObject,
              comment: commentObject
            }
          };

          hoodie.task('socialmediacomment').start(task)
            .then(defer.resolve)
            .fail(defer.reject);
          hoodie.remote.push();
        })
        .fail(defer.reject);

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
      hoodie.remote.push();
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
      hoodie.remote.push();
      return defer.promise();
    },
    isCount: function (postObject, userId, countType) {
      return (postObject.countType && postObject.countType[countType] && postObject.countType[countType].filter(function (v) {
        return v && v.id === userId;
      }).length > 0);
    },
    count: function (postObject, countType) {
      var defer = window.jQuery.Deferred();
      defer.notify('count', arguments, false);
      hoodie.profile.get()
        .then(function (_task) {
          var countObject = {
            id: hoodie.id(),
            name: _task.profile.name
          };
          var task = {
            socialmedia: {
              post: postObject,
              countType: countType,
              countObject: countObject
            }
          };
          hoodie.task('socialmediacount').start(task)
            .then(defer.resolve)
            .fail(defer.reject);
          hoodie.remote.push();
        })
        .fail(defer.reject);
      return defer.promise();
    },
    uncount: function (postObject, countType) {
      var defer = window.jQuery.Deferred();
      defer.notify('uncount', arguments, false);
      var task = {
        socialmedia: {
          post: postObject,
          countType: countType
        }
      };
      hoodie.task('socialmediauncount').start(task)
        .then(defer.resolve)
        .fail(defer.reject);
      hoodie.remote.push();
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
        .then(function (task) {
          return hoodie.socialmedia.addProfileOnPost(task.socialmedia.post);
        })
        .then(function (post) {
          var task = {
            socialmedia: {
              post: post
            }
          };
          defer.resolve(task);
        })
        .fail(defer.reject);
      hoodie.remote.push();
      return defer.promise();
    },
    getSimplePost: function (postObject) {
      var defer = window.jQuery.Deferred();
      defer.notify('getPost', arguments, false);
      hoodie.store.find('post', postObject.id)
        .then(function (post) {
          var task = {
            socialmedia: {
              post: post
            }
          };
          defer.resolve(task);
        })
        .fail(defer.reject);
      hoodie.remote.push();
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
      hoodie.remote.push();
      return defer.promise();
    },

    requestFriend: function (userId) {
      var defer = window.jQuery.Deferred();
      defer.notify('requestFriend', arguments, false);

      hoodie.notification.create(hoodie.id(), userId, 'requestFriend')
        .then(defer.resolve)
        .fail(defer.reject);

      return defer.promise();
    },

    dualFollow: function (userId) {
      var defer = window.jQuery.Deferred();
      defer.notify('dualFollow', arguments, false);

      hoodie.pubsub.bidirectional(userId, hoodie.socialmedia.pubsubtypes)
        .then(defer.resolve)
        .fail(defer.reject);

      return defer.promise();
    },

    pendentFriends: function () {
      var defer = window.jQuery.Deferred();
      hoodie.store.findAll('notification')
        .then(function (notifications) {
          var ids = [];
          notifications.map(function (v) {
            if (v.notificationType === 'requestFriend') {
              ids.push(v.from);
            }
          });
          hoodie.profile.get(ids)
            .then(function (task) {
              var ret = task.profile.map(function (v) {
                return v.doc;
              });
              defer.resolve(ret);
            })
            .fail(defer.reject);
        })
        .fail(defer.reject);
      return defer.promise();
    },

    acceptedFriend: function (userId) {
      var defer = window.jQuery.Deferred();
      defer.notify('acceptedFriend', arguments, false);
      hoodie.notification.create(hoodie.id(), userId, 'acceptedFriend')
        .then(function () {
          hoodie.socialmedia.dualFollow(userId)
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
    rejectedFriend: function (userId) {
      var defer = window.jQuery.Deferred();
      defer.notify('requestFriend', arguments, false);

      hoodie.notification.desactive(userId, 'requestFriend')
        .then(defer.resolve)
        .fail(defer.reject);

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
  hoodie.socialmedia.isLike = partialRight(hoodie.socialmedia.isCount, 'like');
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
