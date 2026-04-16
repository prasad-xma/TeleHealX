const DoctorProfile = require('../models/Doctor');
const doctorService = require('../services/doctorService');

const getAllDoctors = async (req, res) => {
	try {
		const { specialization, name } = req.query;
		const doctors = await doctorService.getAllDoctors({ specialization, name });
		return res.status(200).json(doctors);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

const getDoctorById = async (req, res) => {
	try {
		const doctor = await doctorService.getDoctorById(req.params.doctorId);
		return res.status(200).json(doctor);
	} catch (error) {
		return res.status(404).json({ message: error.message });
	}
};

const getDoctorProfile = async (req, res) => {
	try {
		const doctor = await doctorService.getDoctorProfile(req.user._id);
		return res.status(200).json(doctor);
	} catch (error) {
		return res.status(404).json({ message: error.message });
	}
};

const updateDoctorProfile = async (req, res) => {
	try {
		const { bio, consultationFee, languages, profileImage } = req.body;
		const doctor = await doctorService.updateDoctorProfile(req.user._id, {
			bio,
			consultationFee,
			languages,
			profileImage,
		});
		return res.status(200).json(doctor);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

const createDoctorProfile = async (req, res) => {
	try {
		const doctor = await doctorService.createDoctorProfile(req.user._id, req.body);
		return res.status(201).json(doctor);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

const getPatientReports = async (req, res) => {
	try {
		const { patientId } = req.params;
		const axios = require('axios');

		const patientServiceUrl = process.env.PATIENT_SERVICE_URL || 'http://patient-service:5003';
		const internalKey = process.env.INTERNAL_API_KEY;

		const response = await axios.get(
			`${patientServiceUrl}/api/patients/${patientId}/reports`,
			{
				headers: {
					'x-internal-key': internalKey,
				},
				timeout: 5000,
			}
		);

		return res.status(200).json(response.data);
	} catch (error) {
		if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
			return res.status(503).json({ 
				message: 'Patient service is currently unavailable' 
			});
		}

		if (error.response) {
			return res.status(error.response.status).json({ 
				message: error.response.data.message || 'Failed to fetch patient reports' 
			});
		}

		return res.status(500).json({ 
			message: 'Failed to fetch patient reports' 
		});
	}
};

module.exports = {
	getAllDoctors,
	getDoctorById,
	getDoctorProfile,
	updateDoctorProfile,
	createDoctorProfile,
	getPatientReports,
};
