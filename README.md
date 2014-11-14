hoodie-plugin-socialmedia
====================
[![Build Status](https://travis-ci.org/goappes/hoodie-plugin-socialmedia.svg?branch=master)](https://travis-ci.org/goappes/hoodie-plugin-socialmedia) [![Dependencies](https://david-dm.org/goappes/hoodie-plugin-socialmedia.png)](https://david-dm.org/goappes/hoodie-plugin-socialmedia)

## Dependencies
```shell
  hoodie install hoodie-plugin-socialmedia
  bower install hoodie-plugin-socialmedia
```


## Setup client
```html
  <script src="lib/hoodie/dist/hoodie.js"></script>
  <script src="lib/hoodie-plugin-socialmedia/hoodie.socialmedia.js"></script>
```

## API (Dream Code)
-  [x] hoodie.socialmedia.follow(login) - wip
-  [x] hoodie.socialmedia.unfollow(login) - wip
-  [ ] hoodie.socialmedia.post({text:'text'}, /*opitional*/ {type: [mediaplugin.enum]})
-  [ ] hoodie.socialmedia.comment(postId, {text:'text'})
-  [ ] hoodie.socialmedia.like(postId)
-  [ ] hoodie.socialmedia.feed(postId)
-  [ ] hoodie.socialmedia.share(postId)
-  [ ] hoodie.socialmedia.abuse(postId)
-  [ ] hoodie.socialmedia.following(/*opitional*/ login)
-  [ ] hoodie.socialmedia.followers(/*opitional*/ login)
-  [ ] hoodie.socialmedia.profile(/*opitional*/ login)
