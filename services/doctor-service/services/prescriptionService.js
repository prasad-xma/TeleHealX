const Prescription = require('../models/Prescription');

const createPrescription = async (prescriptionData) => {
	try {
		console.log('Creating prescription with data:', prescriptionData);
		const prescription = await Prescription.create(prescriptionData);
		console.log('Prescription created successfully:', prescription._id);
		return await Prescription.findById(prescription._id)
			.populate('doctorId', 'name email')
			.populate('patientId', 'name email')
			.select('-__v');
	} catch (error) {
		console.error('Error creating prescription:', error.message);
		throw error;
	}
};

const getPrescriptionsByDoctor = async (doctorId) => {
	try {
		const prescriptions = await Prescription.find({ doctorId })
			.populate('doctorId', 'name email')
			.populate('patientId', 'name email')
			.sort({ issuedAt: -1 })
			.select('-__v');
		return prescriptions;
	} catch (error) {
		throw new Error('Failed to fetch prescriptions');
	}
};

const getPrescriptionById = async (prescriptionId, user) => {
	try {
		const prescription = await Prescription.findById(prescriptionId)
			.populate('doctorId', 'name email')
			.populate('patientId', 'name email')
			.select('-__v');

		if (!prescription) {
			throw new Error('Prescription not found');
		}

		// Check if user is the issuing doctor or the patient
		const isDoctor = prescription.doctorId._id.toString() === user._id.toString();
		const isPatient = prescription.patientId._id.toString() === user._id.toString();

		if (!isDoctor && !isPatient) {
			throw new Error('Not authorized to view this prescription');
		}

		return prescription;
	} catch (error) {
		throw new Error('Failed to fetch prescription');
	}
};

const getPrescriptionsByPatient = async (patientId) => {
	try {
		const prescriptions = await Prescription.find({ patientId })
			.populate('doctorId', 'name email')
			.populate('patientId', 'name email')
			.sort({ issuedAt: -1 })
			.select('-__v');
		return prescriptions;
	} catch (error) {
		throw new Error('Failed to fetch prescriptions');
	}
};

const updatePrescriptionStatus = async (prescriptionId, doctorId, status) => {
	try {
		const prescription = await Prescription.findById(prescriptionId);

		if (!prescription) {
			throw new Error('Prescription not found');
		}

		// Only the issuing doctor can update the status
		if (prescription.doctorId.toString() !== doctorId.toString()) {
			throw new Error('Not authorized to update this prescription');
		}

		prescription.status = status;
		await prescription.save();

		return await Prescription.findById(prescription._id)
			.populate('doctorId', 'name email')
			.populate('patientId', 'name email')
			.select('-__v');
	} catch (error) {
		throw new Error('Failed to update prescription status');
	}
};

const deletePrescription = async (prescriptionId, doctorId) => {
	try {
		const prescription = await Prescription.findById(prescriptionId);

		if (!prescription) {
			throw new Error('Prescription not found');
		}

		// Only the issuing doctor can delete the prescription
		if (prescription.doctorId.toString() !== doctorId.toString()) {
			throw new Error('Not authorized to delete this prescription');
		}

		await Prescription.findByIdAndDelete(prescriptionId);

		return prescription;
	} catch (error) {
		throw new Error('Failed to delete prescription');
	}
};

const updatePrescription = async (prescriptionId, doctorId, updateData) => {
	try {
		const prescription = await Prescription.findById(prescriptionId);

		if (!prescription) {
			throw new Error('Prescription not found');
		}

		// Only the issuing doctor can update the prescription
		if (prescription.doctorId.toString() !== doctorId.toString()) {
			throw new Error('Not authorized to update this prescription');
		}

		// Update fields
		if (updateData.patientId) prescription.patientId = updateData.patientId;
		if (updateData.appointmentId !== undefined) prescription.appointmentId = updateData.appointmentId;
		if (updateData.medications) prescription.medications = updateData.medications;
		if (updateData.diagnosis) prescription.diagnosis = updateData.diagnosis;
		if (updateData.notes !== undefined) prescription.notes = updateData.notes;

		await prescription.save();

		return await Prescription.findById(prescription._id)
			.populate('doctorId', 'name email')
			.populate('patientId', 'name email')
			.select('-__v');
	} catch (error) {
		throw new Error('Failed to update prescription');
	}
};

module.exports = {
	createPrescription,
	getPrescriptionsByDoctor,
	getPrescriptionById,
	getPrescriptionsByPatient,
	updatePrescriptionStatus,
	deletePrescription,
	updatePrescription,
};
