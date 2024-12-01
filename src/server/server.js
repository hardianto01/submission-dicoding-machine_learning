const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');

const routes = require('../server/routes');
require('dotenv').config();
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');
 
(async () => {

    

    const server = Hapi.server({
        port: 3000,
        host: '0.0.0.0',
        routes: {
            cors: {
              origin: ['*'],
            },
        },
    });
    
    server.register(Inert)
    const model = await loadModel();
    server.app.model = model;
    server.route(routes); 
    server.ext('onPreResponse', function (request, h) {
        const response = request.response;
        if (response instanceof InputError) {
            const newResponse = h.response({
                status: 'fail',
                message: `${response.message} Silakan gunakan foto lain.`
            })
            newResponse.code(response.statusCode)
            return newResponse;
        }
        if (response.isBoom && response.output.statusCode === 413) {
            return h.response({
                status: 'fail',
                message: 'Payload content length greater than maximum allowed: 1000000'
            }).code(413);
        }

        if (response.isBoom) {
            const newResponse = h.response({
                status: 'fail',
                message: response.message
            })
            newResponse.code(response.statusCode)
            return newResponse;
        }
        return h.continue;
    });
    server.app.model = model;
    await server.start();
    console.log(`Server start at: ${server.info.uri}`);
})();