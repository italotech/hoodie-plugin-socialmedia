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


});
