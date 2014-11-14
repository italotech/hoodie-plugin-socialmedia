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

  hoodie.task.on('follow:add', socialMedia.follow);

  callback();
};
