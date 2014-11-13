/**
 * Hoodie plugin socialmedia
 * Lightweight and easy socialmedia
 */

/* global Hoodie */

Hoodie.extend(function (hoodie) {
  'use strict';

  hoodie.socialmedia = {
    follow: function (userId) {
      var task = {
        userId: userId,
        subject: 'post'
      };
      return hoodie.task('subscribe').start(task);
    },

    follows: function () {
      return hoodie.task('subscribe').start(task);
    },

    unfollow: function (userId) {
      var task = {
        userId: userId,
        subject: 'post'
      };
      return hoodie.task('unsubscribe').start(task);
    },

    // publish: function (userId, type) {
    //   var task = {
    //     userId: userId,
    //     type: type
    //   };
    //   return hoodie.task('publish').start(task);
    // }
  }

});
