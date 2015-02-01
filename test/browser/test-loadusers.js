suite('loadUsers', function () {
  this.timeout(15000);

  suiteSetup(loadUsers);

  suite('loadUsers test', function () {

    setup(function (done) {
      this.timeout(15000);
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
      this.timeout(15000);
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
  });

});
