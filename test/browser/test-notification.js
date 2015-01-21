suite('notification', function () {
  this.timeout(15000);

  suiteSetup(loadUsers);

  test('signIn hommer', function (done) {
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

  test('hommer should get friends', function (done) {
    hoodie.socialmedia.friends()
      .fail(function (err) {
        done(err);
        assert.ok(false, err.message);
      })
      .then(function (task) {
        this.hommerFriends = task.socialmedia.friends.length;
        assert.ok(true , 'friends ' + task.socialmedia.friends.length + ' with sucess');
        done();
      }.bind(this));
  });

  test('hommer should requestFriend Moo', function (done) {
    hoodie.socialmedia.requestFriend('Moo')
      .fail(function (err) {
        done(err);
        assert.ok(false, err.message);
      })
      .then(function (task) {
        assert.ok(true, 'requestFriend with sucess');
        done();
      })
      .pipe(function () {
        signinUser('moo', '123', function () {})
      })
  });

  test('Moo should have a requestFriend notification from Hommer', function (done) {

    hoodie.socialmedia.notification.on(function (err, notification) {
      assert.ok(notification.notificationType === 'requestFriend', 'requestFriend with sucess');
      done();
    });

  });

  test('moo should get friends', function (done) {
    hoodie.socialmedia.friends()
      .fail(function (err) {
        done(err);
        assert.ok(false, err.message);
      })
      .then(function (task) {
        this.mooFriends = task.socialmedia.friends.length;
        assert.ok(true , 'friends ' + task.socialmedia.friends.length + ' with sucess');
        done();
      }.bind(this));
  });

  test('Moo should list notification', function (done) {

    hoodie.socialmedia.notification.list()
      .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
      .then(function (notifications) {
        this.mooNotification = notifications[0];
        assert.ok(notifications.length > 0, 'has more then on notification');
        done();
      }.bind(this));

  });

  test('Moo should acceptedFriend notification from Hommer', function (done) {

    hoodie.socialmedia.acceptedFriend(this.mooNotification.from)
      .fail(function (err) {
        done(err);
        assert.ok(false, err.message);
      })
      .then(function (task) {
        assert.ok(true, 'acceptedFriend with sucess');
        done();
      })
      .pipe(function () {
        signinUser('hommer', '123', function () {})
      })
  });

  test('Hommer should have a acceptedFriend notification from Moo', function (done) {

    hoodie.socialmedia.notification.on(function (err, notification) {
      assert.ok(notification.notificationType === 'acceptedFriend', 'acceptedFriend with sucess');
      done();
    });

  });

  test('hommer should had one more friend', function (done) {
    hoodie.socialmedia.friends()
      .fail(function (err) {
        done(err);
        assert.ok(false, err.message);
      })
      .then(function (task) {
        assert.ok((this.hommerFriends + 1) === task.socialmedia.friends.length , 'friends ' + task.socialmedia.friends.length + ' with sucess');
        done();
      }.bind(this));
  });

  test('moo should had one more friend', function (done) {
    var self = this;
    signinUser('moo', '123', function () {
      hoodie.socialmedia.friends()
        .fail(function (err) {
          done(err);
          assert.ok(false, err.message);
        })
        .then(function (task) {
          assert.ok((this.mooFriends + 1) === task.socialmedia.friends.length , 'friends ' + task.socialmedia.friends.length + ' with sucess');
          done();
        }.bind(self));
    })
  });

});

