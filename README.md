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
-  [x] hoodie.socialmedia.follow(login)
-  [x] hoodie.socialmedia.unfollow(login)
-  [x] hoodie.socialmedia.post({text: 'text'}, /*opitional*/ {type: [mediaplugin.enum]})
-  [x] hoodie.socialmedia.getPost({id: 'postId')
-  [x] hoodie.socialmedia.updatePost({id: 'postId',text: 'text'}, /*opitional*/ {type: [mediaplugin.enum]})
-  [x] hoodie.socialmedia.deletePost({id: 'postId'}, /*opitional*/ {type: [mediaplugin.enum]})
-  [x] hoodie.socialmedia.comment(postId, {text:'text'})
-  [x] hoodie.socialmedia.updateComment({ id: 'postId'}, {id: 'commentId'})
-  [x] hoodie.socialmedia.deleteComment({ id: 'postId'}, {id: 'commentId'})
-  [x] hoodie.socialmedia.count(postId, [type.enum]) 
-  [x] hoodie.socialmedia.uncount(postId, [type.enum])
-  [x] hoodie.socialmedia.like(postId) 
-  [x] hoodie.socialmedia.unlike(postId)
-  [x] hoodie.socialmedia.feed(postId)
-  [x] hoodie.socialmedia.share(postId)
-  [x] hoodie.socialmedia.abuse(postId)
-  [x] hoodie.socialmedia.following(/*opitional*/ login)
-  [x] hoodie.socialmedia.followers(/*opitional*/ login)
-  [x] hoodie.socialmedia.getProfile(/*opitional*/ login)
-  [x] hoodie.socialmedia.updateProfile(/*opitional*/ login, profileObject)
