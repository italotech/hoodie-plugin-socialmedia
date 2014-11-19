suite('feed', function () {
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

  test('hommer should post', function (done) {
    hoodie.socialmedia.post({text: 'dooh!'})
      .fail(function (err) {
        done((err.message !== 'conflict') ? err: null);
        assert.ok(false, err.message);
      })
      .then(function () {
        assert.ok(true, 'post with sucess');
        done();
      });
  });

  test('hommer should get post/text feed', function (done) {
    hoodie.socialmedia.feed()
      .fail(done)
      .then(function (feed) {
        this.hommerPost = feed.rows[0];
        done();
        assert.ok(true, 'feed with sucess');
      }.bind(this));
  });

  test('hommer should edit post', function (done) {
    var hommerPost = this.hommerPost;
    hommerPost.title = 'D\'oh Homer';
    hommerPost.text = 'Hmm... Donuts!';
    console.log(hommerPost)

    hoodie.socialmedia.updatePost(hommerPost)
      .fail(done)
      .then(function () {
        done();
        assert.ok(true, 'post with sucess');
      });
  });


});
