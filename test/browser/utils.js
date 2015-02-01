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

var addUser = function (u, done) {
  hoodie.account.signUp(u.username, u.password)
    .always(function () {
      u.hoodieId = hoodie.id();
      localStorage.clear();
      hoodie.account.signOut()
        .always(function () {
          done();
        });
      hoodie.remote.push();
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
