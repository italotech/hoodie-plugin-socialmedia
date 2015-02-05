var removeUsers = function (u, done) {
  hoodie.account.signIn(u.username, u.password)
    .then(function() {
      hoodie.account.destroy()
        .always(function () {
            done();
        })
    })
    .fail(function () {
      done();
    })
  hoodie.remote.push();
}


var setNames = function (u, done) {
}

var addUser = function (u, done) {
  hoodie.account.signUp(u.username, u.password)
    .then(function () {
      return hoodie.account.signIn(u.username, u.password);
      hoodie.remote.sync();
    })
    .then(function () {
      var defer = window.jQuery.Deferred();
      u.hoodieId = hoodie.id();
      setTimeout(function(){
        hoodie.profile.get()
          .then(defer.resolve)
          .fail(defer.reject);
       }, 500);
      return defer.promise();
    })
    .then(function (_task) {
      var profile = _task.profile;
      profile.First_Name = u.fname;
      profile.Last_Name = u.lname;
      profile.name = u.fname + ' ' + u.lname;
      return hoodie.profile.set(profile);
    })
    .then(function () {
      //localStorage.clear();
      return hoodie.account.signOut()
      hoodie.remote.push();
    })
    .then(function () {
      done();
    })
    .fail(function (err) {
      done(err);
    });
  hoodie.remote.push();
};

var loadUsers = function (done) {
  var users = window.fixtures['users'];

  localStorage.clear();
  hoodie.account.signOut()
    .always(function () {
      async.series([
        //async.apply(async.eachSeries, users, removeUsers),
        async.apply(async.eachSeries, users, addUser),
      ], done)
    });
  hoodie.remote.push();
};

var signinUser = function (user, pass, done) {
  hoodie.account.signOut()
    .always(function () {
      hoodie.account.signIn(user, pass)
        .always(done);
    });
};

var cleanPosts = function (u, done) {
  hoodie.account.signIn(u.username, u.password)
    .then(function () {
      hoodie.socialmedia.deletePost()
      .always(function () {
        hoodie.account.signOut()
          .always(function () { done() } );
      })
    });
};

var cleanAllPosts = function (done) {
  var users = window.fixtures['users'];

  localStorage.clear();
  hoodie.account.signOut()
    .always(function () {
      async.eachSeries(users, cleanPosts, done);
    });
};
