var addUser = function (u, done) {
  hoodie.account.signUp(u.username, u.password)
    .always(function () {
      // signOut current user
      localStorage.clear();
      hoodie.account.signOut()
        .always(function () {
          done();
        });
    });
};

var loadUsers = function (done) {
  var users = window.fixtures['users'];

  localStorage.clear();
  hoodie.account.signOut()
    .always(function () {
      async.eachSeries(users, addUser, done);
    });
};
