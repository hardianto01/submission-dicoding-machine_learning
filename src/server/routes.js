const { postPredictHandler, postPredictHistoriesHandler } = require('../server/handler');

const routes = [
  {
    path: '/predict',
    method: 'POST',
    handler: postPredictHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        maxBytes: 1024 * 1024
      }
    }
  },
  {
    path: '/predict/histories',
    method: 'GET',
    handler: postPredictHistoriesHandler,
  }
]

module.exports = routes;