const mongoose = require('mongoose');

const questionnaireSchema = new mongoose.Schema(
	{
		patientId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		symptoms: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Questionnaire', questionnaireSchema);