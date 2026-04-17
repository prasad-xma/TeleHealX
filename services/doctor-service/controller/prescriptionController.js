const prescriptionService = require('../services/prescriptionService');
const mongoose = require('mongoose');

const createPrescription = async (req, res) => {
	try {
		const { patientId, appointmentId, medications, diagnosis, notes } = req.body;
		
		console.log('[PRESCRIPTION CONTROLLER] Received request:', { patientId, appointmentId, diagnosis, medicationsCount: medications?.length });

		// Input validation
		if (!patientId || !medications || !diagnosis) {
			console.log('[PRESCRIPTION CONTROLLER] Missing required fields');
			return res.status(400).json({ message: 'Missing required fields: patientId, medications, and diagnosis are required' });
		}

		// Validate patientId format
		if (!mongoose.Types.ObjectId.isValid(patientId)) {
			console.log('[PRESCRIPTION CONTROLLER] Invalid patientId format:', patientId);
			return res.status(400).json({ message: 'Invalid patientId format' });
		}

		// Validate appointmentId format if provided
		if (appointmentId && !mongoose.Types.ObjectId.isValid(appointmentId)) {
			console.log('[PRESCRIPTION CONTROLLER] Invalid appointmentId format:', appointmentId);
			return res.status(400).json({ message: 'Invalid appointmentId format' });
		}

		if (!Array.isArray(medications) || medications.length === 0) {
			console.log('[PRESCRIPTION CONTROLLER] Invalid medications array');
			return res.status(400).json({ message: 'Medications must be a non-empty array' });
		}

		for (const med of medications) {
			if (!med.name || !med.dosage || !med.frequency || !med.startDate || !med.endDate) {
				console.log('[PRESCRIPTION CONTROLLER] Invalid medication:', med);
				return res.status(400).json({ message: 'Each medication must have name, dosage, frequency, start date, and end date' });
			}
		}

		console.log('[PRESCRIPTION CONTROLLER] Validation passed, creating prescription');
		const prescription = await prescriptionService.createPrescription({
			doctorId: req.user._id,
			patientId,
			appointmentId,
			medications,
			diagnosis,
			notes,
		});

		return res.status(201).json(prescription);
	} catch (error) {
		console.error('[PRESCRIPTION CONTROLLER] Error:', error);
		return res.status(400).json({ message: error.message });
	}
};

const getDoctorPrescriptions = async (req, res) => {
	try {
		const prescriptions = await prescriptionService.getPrescriptionsByDoctor(req.user._id);
		return res.status(200).json(prescriptions);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

const getPrescriptionById = async (req, res) => {
	try {
		const prescription = await prescriptionService.getPrescriptionById(req.params.id, req.user);
		return res.status(200).json(prescription);
	} catch (error) {
		return res.status(404).json({ message: error.message });
	}
};

const getPatientPrescriptions = async (req, res) => {
	try {
		const { patientId } = req.params;
		
		// Check if user is the patient themselves or a doctor
		if (req.user._id.toString() !== patientId && req.user.role !== 'doctor') {
			return res.status(403).json({ message: 'Not authorized to view these prescriptions' });
		}

		const prescriptions = await prescriptionService.getPrescriptionsByPatient(patientId);
		return res.status(200).json(prescriptions);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

const updatePrescriptionStatus = async (req, res) => {
	try {
		const { status } = req.body;

		if (!status || !['active', 'expired'].includes(status)) {
			return res.status(400).json({ message: 'Status must be either active or expired' });
		}

		const prescription = await prescriptionService.updatePrescriptionStatus(
			req.params.id,
			req.user._id,
			status
		);

		return res.status(200).json(prescription);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

const deletePrescription = async (req, res) => {
	try {
		const prescription = await prescriptionService.deletePrescription(
			req.params.id,
			req.user._id
		);

		return res.status(200).json({ message: 'Prescription deleted successfully' });
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

const updatePrescription = async (req, res) => {
	try {
		const { patientId, appointmentId, medications, diagnosis, notes } = req.body;

		const prescription = await prescriptionService.updatePrescription(
			req.params.id,
			req.user._id,
			{ patientId, appointmentId, medications, diagnosis, notes }
		);

		return res.status(200).json(prescription);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

module.exports = {
	createPrescription,
	getDoctorPrescriptions,
	getPrescriptionById,
	getPatientPrescriptions,
	updatePrescriptionStatus,
	deletePrescription,
	updatePrescription,
};
