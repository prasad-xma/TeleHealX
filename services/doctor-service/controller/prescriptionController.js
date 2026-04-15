const prescriptionService = require('../services/prescriptionService');

const createPrescription = async (req, res) => {
	try {
		const { patientId, appointmentId, medications, diagnosis, notes } = req.body;
		
		// Input validation
		if (!patientId || !appointmentId || !medications || !diagnosis) {
			return res.status(400).json({ message: 'Missing required fields' });
		}

		if (!Array.isArray(medications) || medications.length === 0) {
			return res.status(400).json({ message: 'Medications must be a non-empty array' });
		}

		for (const med of medications) {
			if (!med.name || !med.dosage || !med.frequency || !med.duration) {
				return res.status(400).json({ message: 'Each medication must have name, dosage, frequency, and duration' });
			}
		}

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

module.exports = {
	createPrescription,
	getDoctorPrescriptions,
	getPrescriptionById,
	getPatientPrescriptions,
	updatePrescriptionStatus,
};
