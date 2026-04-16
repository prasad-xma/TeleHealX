const mongoose = require('mongoose');

const doctorApplicationSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			unique: true,
		},
		specialization: {
			type: String,
			required: true,
			trim: true,
		},
		licenseNumber: {
			type: String,
			required: true,
			trim: true,
		},
		hospital: {
			type: String,
			required: true,
			trim: true,
		},
		yearsOfExperience: {
			type: Number,
			required: true,
			min: 0,
		},
		status: {
			type: String,
			enum: ['pending', 'approved', 'rejected'],
			default: 'pending',
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('DoctorApplication', doctorApplicationSchema);