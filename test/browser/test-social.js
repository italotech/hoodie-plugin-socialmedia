suite('network', function () {

  var  users = [
      {user: 'Hommer', password: '123'},
      {user: 'Bart', password: '123'},
      {user: 'Meg', password: '123'},
      {user: 'Margie', password: '123'},
      {user: 'Lisa', password: '123'},
      {user: 'Milhouse', password: '123'},
      {user: 'Moo', password: '123'},
      {user: 'Krust', password: '123'},
      {user: 'Lenny', password: '123'},
      {user: 'Flanders', password: '123'},
      {user: 'Burns', password: '123'},
      {user: 'Abul', password: '123'},
      {user: 'Nelson', password: '123'},
      {user: 'Dog', password: '123'},
      {user: 'Cat', password: '123'}
    ]

  function signin(u, done) {
    hoodie.account.signIn(u.user, u.password)
      .fail(function () { done(); })
      .done(function () {
        u.hoodieId = hoodie.id();
        done();
      })
  }

  function addUser(u, done) {
    hoodie.account.signOut()
      .fail(function () { done(); })
      .done(function () {
        hoodie.account.signUp(u.user, u.password)
          .fail(function () { signin(u, done); })
          .done(function () { signin(u, done); });
    });
  }

  test('load fixture', function (done) {
    this.timeout(50000);
    // phantomjs seems to keep session data between runs,
    // so clear before running tests
    localStorage.clear();
    async.each(users, addUser, function () {
      hoodie.account.signOut()
        .fail(function () { done(); })
        .done(function(){
          if (!window.mochaPhantomJS) {
            console.table(users);
          }
          done();
      });
    })
  });


  suite('network test', function () {


    setup(function (done) {
      this.timeout(10000);
      localStorage.clear();
      hoodie.account.signIn('Hommer', '123')
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .done(function () {
          done();
        });
    });

    test('signIn hommer', function (done) {
      this.timeout(10000);
      hoodie.account.signIn('Hommer', '123')
        .fail(function (err) {
          done();
          assert.ok(false, err.message);
        })
        .done(function () {
          assert.equal(
            hoodie.account.username,
            'hommer',
            'should be logged in after signup'
          );
          done();
        });
    });

    test('hommer showd subscribe bart posts', function (done) {
      this.timeout(10000);
      hoodie.socialmedia.follow('Bart')
        .fail(function (err) {
          done((err.message !=='You already subscribed.') ? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          done();
          assert.ok(true, 'follow with sucess');
        });
    });

    test('hommer not should subscribe bart posts', function (done) {
      this.timeout(10000);
      hoodie.socialmedia.follow('Bart')
        .fail(function (err) {
          done();
          assert.ok((err.message ==='You already subscribed.'), err.message);
        })
        .then(function () {
          done();
          assert.ok(false, 'should throw error [You already subscribed.] ');
        });
    });

    test('hommer showd subscribe marge posts', function (done) {
      this.timeout(10000);
      hoodie.socialmedia.follow('Margie')
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

    test('hommer showd subscribe lisa posts', function (done) {
      this.timeout(10000);
      hoodie.socialmedia.follow('Lisa')
        .fail(function (err) {
          done((err.message !=='You already subscribed.')? err: null);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });

   test('hommer should show 3 following', function (done) {
      this.timeout(10000);
      hoodie.socialmedia.following()
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .then(function (task) {
          assert.ok((task.following.length === 3) , 'following ' + task.following.length + ' with sucess');
          done();
        });
    });

   test('hommer should show 0 followers', function (done) {
      this.timeout(10000);
      hoodie.socialmedia.followers()
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .then(function (task) {
          assert.ok((task.followers.length === 0) , 'followers ' + task.followers.length + ' with sucess');
          done();
        });
    });

    test('hommer showd unsubscribe bart posts', function (done) {
      this.timeout(10000);
      hoodie.socialmedia.unfollow('Bart')
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .then(function () {
          assert.ok(true, 'follow with sucess');
          done();
        });
    });


   test('hommer should show 2 following', function (done) {
      this.timeout(10000);
      hoodie.socialmedia.following()
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .then(function (task) {
          assert.ok((task.subscriptions.length === 2) , 'subscriptions ' + task.subscriptions.length + ' with sucess');
          done();
        });
    });

   test('lisa should show 1 followers', function (done) {
      this.timeout(10000);
      hoodie.socialmedia.followers('Lisa')
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .then(function (task) {
          assert.ok((task.followers.length === 1) , 'followers ' + task.followers.length + ' with sucess');
          done();
        });
    });

  });

});
