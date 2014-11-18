suite('feed', function () {

  test('hommer showd post', function (done) {
    this.timeout(10000);
    hoodie.socialmedia.post({text: 'dooh!'})
      .fail(function (err) {
        done(err);
        assert.ok(false, err.message);
      })
      .then(function () {
        done();
        assert.ok(true, 'post with sucess');
      });
  });


  test('hommer showd post', function (done) {
    this.timeout(10000);
    hoodie.socialmedia.feed()
      .fail(function (err) {
        done(err);
        assert.ok(false, err.message);
      })
      .then(function (feed) {
        console.log(feed);
        done();
        assert.ok(true, 'feed with sucess');
      });
  });

});
