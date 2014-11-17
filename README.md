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
-  [x] hoodie.socialmedia.follow(login)
-  [x] hoodie.socialmedia.unfollow(login)
-  [ ] hoodie.socialmedia.post({text:'text'}, /*opitional*/ {type: [mediaplugin.enum]})
-  [ ] hoodie.socialmedia.comment(postId, {text:'text'})
-  [ ] hoodie.socialmedia.count(postId, [type.enum]) 
-  [ ] hoodie.socialmedia.uncount(postId, [type.enum])
-  [ ] hoodie.socialmedia.feed(postId)
-  [ ] hoodie.socialmedia.share(postId)
-  [ ] hoodie.socialmedia.abuse(postId)
-  [x] hoodie.socialmedia.following(/*opitional*/ login)
-  [x] hoodie.socialmedia.followers(/*opitional*/ login)
-  [ ] hoodie.socialmedia.profile(/*opitional*/ login)
