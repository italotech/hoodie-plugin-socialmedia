var async = require('async');
var ExtendedDatabaseAPI = require('hoodie-utils-plugins').ExtendedDatabaseAPI;

module.exports = function (hoodie, dbname, usersDb) {

  /**
   * PubSub _dbname
   */

  var db = new ExtendedDatabaseAPI(hoodie, hoodie.database(dbname));
  /**
   * PubSub dbAdd
   */

  var dbAdd = function (hoodie, callback) {
    hoodie.database.add(dbname, function (err) {
      callback(err);
    });
  };


  /**
   * PubSub userFilter
   */

  db.profileDoc = function (hoodie, db, userDbName, callback) {
    var doc = {
      id: userDbName.split('/').pop(),
      db: userDbName
    };

    db.add('profile', doc, function (err) {
      if (err) {
        return callback(err);
      }

      return callback();
    });
  };

  var addLookupUserId = function (hoodie, usersDb, callback) {

    var index = {
      map: function (doc) {
        emit(doc.name.split('/').pop(), doc.hoodieId);
      }
    };

    usersDb.addIndex('by_userName', index, function (err) {
      if (err) {
        return callback(err);
      }

      return callback();
    });
  };

  async.series([
    async.apply(dbAdd, hoodie),
    async.apply(addLookupUserId, hoodie, usersDb),
  ],
  function (err) {
    if (err) {
      console.error(
        'setup db error() error:\n' + (err.stack || err.message || err.toString())
      );
    }
  });

  return db;
};
