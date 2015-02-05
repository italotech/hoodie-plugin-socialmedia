hoodie-plugin-socialmedia
====================
[![Build Status](https://travis-ci.org/goappes/hoodie-plugin-socialmedia.svg?branch=master)](https://travis-ci.org/goappes/hoodie-plugin-socialmedia) [![Dependencies](https://david-dm.org/goappes/hoodie-plugin-socialmedia.png)](https://david-dm.org/goappes/hoodie-plugin-socialmedia) [![devDependency Status](https://david-dm.org/goappes/hoodie-plugin-socialmedia/dev-status.svg)](https://david-dm.org/goappes/hoodie-plugin-socialmedia#info=devDependencies) [![Code Climate](https://codeclimate.com/github/goappes/hoodie-plugin-socialmedia/badges/gpa.svg)](https://codeclimate.com/github/goappes/hoodie-plugin-socialmedia)

## Dependencies
```shell
  hoodie install hoodie-plugin-socialmedia
```
for cordova/phonegap users
```shell
  bower install hoodie-plugin-socialmedia
```

## Setup client
```html
 <script src="/_api/_files/hoodie.js"></script>
```
for cordova/phonegap users

```html
  <script src="<bowerdir>/hoodie/dist/hoodie.js"></script>
  <script src="<bowerdir>/hoodie-plugin-socialmedia/hoodie.socialmedia.js"></script>
```

## API (Dream Code)
API:
```js
// all api return some objects depends on the behaviour.
// the documentation still wip but PR are wellcome
// the test/bowser folder has tests any one can understend lookin on that

    hoodie.socialmedia.follow: function (hoodieId) {
      return hoodie.socialmedia.follow;
    }

    hoodie.socialmedia.unfollow: function (hoodieId) {
      return hoodie.socialmedia.unfollow;
    }

    hoodie.socialmedia.getProfile: function (hoodieId) {
      return hoodie.socialmedia.getProfile;
    }

    hoodie.socialmedia.following: function (hoodieId) {
      return hoodie.socialmedia.following;
    }

    hoodie.socialmedia.followers: function (hoodieId) {
      return hoodie.socialmedia.followers;
    }

    hoodie.socialmedia.friends: function (hoodieId) {
      return hoodie.socialmedia.friends;
    }

    hoodie.socialmedia.returnTask: function (attr, cb) {
      return hoodie.socialmedia.returnTask;
    }

    hoodie.socialmedia.post: function (postObject, hoodieId) {
      return hoodie.socialmedia.post;
    }

    hoodie.socialmedia.updatePost: function (postObject, hoodieId) {
      return hoodie.socialmedia.updatePost;
    }

    hoodie.socialmedia.deletePost: function (postObject, hoodieId) {
      return hoodie.socialmedia.deletePost;
    }

    hoodie.socialmedia.feed: function (hoodieId) {
      return hoodie.socialmedia.feed;
    }

    hoodie.socialmedia.comment: function (postObject, commentObject) {
      return hoodie.socialmedia.comment;
    }

    hoodie.socialmedia.updateComment: function (postObject, commentObject) {
      return hoodie.socialmedia.updateComment;
    }

    hoodie.socialmedia.deleteComment: function (postObject, commentObject) {
      return hoodie.socialmedia.deleteComment;
    }

    hoodie.socialmedia.count: function (postObject, commentObject) {
      return hoodie.socialmedia.count;
    }

    hoodie.socialmedia.uncount: function (postObject, commentObject) {
      return hoodie.socialmedia.uncount;
    }

    hoodie.socialmedia.getPost: function (postObject) {
      return hoodie.socialmedia.getPost;
    }

    hoodie.socialmedia.share: function (postObject) {
      return hoodie.socialmedia.share;
    }

    hoodie.socialmedia.requestFriend: function (hoodieId) {
      return hoodie.socialmedia.requestFriend;
    }

    hoodie.socialmedia.dualFollow: function (hoodieId) {
      return hoodie.socialmedia.dualFollow;
    }

    hoodie.socialmedia.acceptedFriend: function (hoodieId) {
      return hoodie.socialmedia.acceptedFriend;
    }

    hoodie.socialmedia.rejectedFriend: function (hoodieId) {
      return hoodie.socialmedia.rejectedFriend;
    }

    hoodie.socialmedia.updateProfile: function (profile) {
      return hoodie.socialmedia.updateProfile;
    }

    hoodie.socialmedia.like:  function (postObject) {
      return hoodie.socialmedia.like;
    }

    hoodie.socialmedia.unlike:  function (postObject) {
      return hoodie.socialmedia.unlike;
    }

    hoodie.socialmedia.abuse:  function (postObject) {
      return hoodie.socialmedia.abuse;
    }
```
