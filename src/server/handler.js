const { storeData, getAllData } = require("../services/firestoreService");
const predictClassification = require("../services/inferenceService");
const crypto = require('crypto');
async function postPredictHandler(request, h) {
    const { image } = request.payload;
    const { model } = request.server.app;
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    if (image.length > 1000000) {
        const response = h.response({
            status: 'fail',
            message: 'Payload content length greater than maximum allowed: 1000000'
        })
        response.code(413);
        return response;
    }

    try {
        const { label, suggestion } = predictClassification(model, image);
        const data = {
            "id": id,
            "result": label,
            "suggestion": suggestion,
            "createdAt": createdAt
        };

        await storeData(id, data) // penting bingittzz
        const response = h.response({
            status: 'success',
            message: 'Model is predicted successfully.',
            data
        });
        response.code(201);
        return response;
    } catch (error) {
        const response = h.response({
            status: 'fail',
            message: 'Terjadi kesalahan dalam melakukan prediksi'
        });
        response.code(400);
        return response;
    }
}

async function postPredictHistoriesHandler(request, h) {
    const allData = await getAllData();
    
    const formatAllData = [];
    allData.forEach(doc => {
        const data = doc.data();
        formatAllData.push({
            id: doc.id,
            history: {
                result: data.result,
                createdAt: data.createdAt,
                suggestion: data.suggestion,
                id: doc.id
            }
        });
    });
    
    const response = h.response({
      status: 'success',
      data: formatAllData
    })
    response.code(200);
    return response;
  }

module.exports = {postPredictHandler, postPredictHistoriesHandler};