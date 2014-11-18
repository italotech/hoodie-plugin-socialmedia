/**
 * Hoodie plugin socialmedia
 * Lightweight and easy socialmedia
 */

/**
 * Dependencies
 */
var SocialMedia = require('./lib');


/**
 * SocialMedia worker
 */

module.exports = function (hoodie, callback) {
  var socialMedia = new SocialMedia(hoodie);

  hoodie.task.on('lookup:add', socialMedia.lookup);
  hoodie.task.on('follow:add', socialMedia.follow);
  hoodie.task.on('unfollow:add', socialMedia.unfollow);
  hoodie.task.on('post:add', socialMedia.post);
  hoodie.task.on('feed:add', socialMedia.post);

  callback();
};
