var propertySchemas = require('requireindex')(__dirname);

var taskSchemas = Object.keys(propertySchemas)
.map(function (k) {
  return {
    '$schema': 'http://json-schema.org/draft-04/schema#',
    title: k,
    description: 'schema of ' + k + ' task',
    type: 'object',
    properties: propertySchemas[k],
    required: [
      "socialmedia"
    ]
  }
})
.reduce(function (obj, a, k) {
  obj[a.title] = a;
  return obj;
}, {})

module.exports = taskSchemas;
