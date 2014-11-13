/**
 * Dependencies
 */

module.exports = function (hoodie) {
  var Replicator = this;

  Replicator.find = function (type, id, callback) {
    var replicatorId = encodeURIComponent([type, id].join('/'));
    hoodie.request('GET', '/_replicator/' + replicatorId, {}, callback);
  };

  Replicator.add = function (type, id, data, callback) {
    Replicator.find(type, id, function (err, _doc, res) {
      if (res.statusCode === 404) {
        return hoodie.request('POST', '/_replicator', { data: data }, callback);
      } else if (err) {
        return callback(err);
      }
      return callback('Replicator already exists.', _doc);
    });
  };

  Replicator.remove = function (type, id, callback) {
    var replicatorId = encodeURIComponent([type, id].join('/'));
    Replicator.find(type, id, function (err, _doc, res) {
      if (res.statusCode === 404) {
        return callback('Replicator not found.');
      } else if (err) {
        return callback(err);
      }

      hoodie.request('DELETE', '/_replicator/' + replicatorId + '?rev=' + _doc._rev, {}, callback);
    });
  };

  return Replicator;
};
