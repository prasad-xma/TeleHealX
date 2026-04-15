const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
    {
        questionnaireId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Questionnaire',
            required: true,
        },
        aiResponse: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);