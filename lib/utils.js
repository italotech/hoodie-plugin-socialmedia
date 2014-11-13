var debug = require('debug');
var log = debug('app:log');
var error = debug('app:error');

var utils = module.exports;

utils.pubsubId = function (sourceDbName, targetDbName) {
  return [sourceDbName, targetDbName].join('::');
};

utils.dbNametoHoodieId = function (dbName) {
  return dbName.replace(/^user\//, '');
};

utils.replicatorDoc = function (subject, sourceDbName, targetDbName) {
  var subscribeId = subject + '/' + utils.pubsubId(sourceDbName, targetDbName);

  return {
    _id: subscribeId,
    source: sourceDbName,
    target: targetDbName,
    filter: 'filters/by_type',
    query_params: {
      type: subject
    },
    user_ctx: {
      roles: [
        'hoodie:read:' + sourceDbName,
        'hoodie:write:' + targetDbName
      ]
    },
    continuous: true
  };
};

utils.filtersDoc = function (type, name, fn) {
  var designDoc = {
    _id: '_design/' + type,
    filters: {}
  };
  designDoc.filters[name] = fn.toString();
  return designDoc;
};

 //var pluginDb = hoodie.database(dbname);

utils.handleTask = function (hoodie, methodname, db, task) {
  return function (err) {
    console.log('handleTask', err);
    if (err) {
      error(methodname, err);
      hoodie.task.error(db, task, err);
    } else {
      log(methodname + ' sucess', task);
      hoodie.task.success(db, task);
    }
  };
};
