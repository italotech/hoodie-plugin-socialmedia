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
  hoodie.task.on('getpost:add', socialMedia.getPost);
  hoodie.task.on('updatepost:add', socialMedia.updatePost);
  hoodie.task.on('deletepost:add', socialMedia.deletePost);
  hoodie.task.on('comment:add', socialMedia.comment);
  hoodie.task.on('updatecomment:add', socialMedia.updateComment);
  hoodie.task.on('deletecomment:add', socialMedia.deleteComment);
  hoodie.task.on('count:add', socialMedia.count);
  hoodie.task.on('uncount:add', socialMedia.uncount);
  hoodie.task.on('feed:add', socialMedia.feed);
  hoodie.task.on('getprofile:add', socialMedia.getProfile);
  hoodie.task.on('updateprofile:add', socialMedia.updateProfile);
  hoodie.task.on('share:add', socialMedia.sharePost);
  hoodie.task.on('requestfriend:add', socialMedia.requestFriend);


  hoodie.account.on('change', socialMedia.addProfileEachUser);

  callback();
};
