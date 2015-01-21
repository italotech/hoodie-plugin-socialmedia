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

  hoodie.task.on('socialmedialookup:add', socialMedia.lookup);
  hoodie.task.on('socialmediafollow:add', socialMedia.follow);
  hoodie.task.on('socialmediaunfollow:add', socialMedia.unfollow);
  hoodie.task.on('socialmediapost:add', socialMedia.post);
  hoodie.task.on('socialmediagetpost:add', socialMedia.getPost);
  hoodie.task.on('socialmediaupdatepost:add', socialMedia.updatePost);
  hoodie.task.on('socialmediadeletepost:add', socialMedia.deletePost);
  hoodie.task.on('socialmediacomment:add', socialMedia.comment);
  hoodie.task.on('socialmediaupdatecomment:add', socialMedia.updateComment);
  hoodie.task.on('socialmediadeletecomment:add', socialMedia.deleteComment);
  hoodie.task.on('socialmediacount:add', socialMedia.count);
  hoodie.task.on('socialmediauncount:add', socialMedia.uncount);
  hoodie.task.on('socialmediafeed:add', socialMedia.feed);
  hoodie.task.on('socialmediashare:add', socialMedia.sharePost);
  hoodie.task.on('socialmediadualfollow:add', socialMedia.dualFollow);

  hoodie.task.on('socialmedianotification:add', socialMedia.createNotification);



  callback();
};
