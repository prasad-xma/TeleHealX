const DoctorProfile = require('../models/Doctor');
const User = require('../models/User');

const getAllDoctors = async (filters = {}) => {
	try {
		const { specialization, name } = filters;
		const query = { isVerified: true };

		if (specialization) {
			query.specialization = { $regex: specialization, $options: 'i' };
		}

		let doctors = await DoctorProfile.find(query)
			.populate('userId', 'name email')
			.select('-__v');

		if (name) {
			doctors = doctors.filter(doctor => 
				doctor.userId.name.toLowerCase().includes(name.toLowerCase())
			);
		}

		return doctors;
	} catch (error) {
		throw new Error('Failed to fetch doctors');
	}
};

const getDoctorById = async (doctorId) => {
	try {
		const doctor = await DoctorProfile.findById(doctorId)
			.populate('userId', 'name email')
			.select('-__v');
		if (!doctor) {
			throw new Error('Doctor not found');
		}
		return doctor;
	} catch (error) {
		throw new Error('Failed to fetch doctor');
	}
};

const getDoctorProfile = async (userId) => {
	try {
		console.log('Fetching doctor profile for userId:', userId);
		const doctor = await DoctorProfile.findOne({ userId })
			.populate('userId', 'name email')
			.select('-__v');
		console.log('Found doctor profile:', doctor);
		if (!doctor) {
			throw new Error('Doctor profile not found');
		}
		return doctor;
	} catch (error) {
		console.error('Error fetching doctor profile:', error.message);
		throw new Error('Failed to fetch doctor profile');
	}
};

const updateDoctorProfile = async (userId, updateData) => {
	try {
		const doctor = await DoctorProfile.findOneAndUpdate(
			{ userId },
			updateData,
			{ new: true, runValidators: true }
		).populate('userId', 'name email');
		
		if (!doctor) {
			throw new Error('Doctor profile not found');
		}
		return doctor;
	} catch (error) {
		throw new Error('Failed to update doctor profile');
	}
};

const createDoctorProfile = async (userId, profileData) => {
	try {
		console.log('Creating doctor profile for userId:', userId);
		console.log('Profile data:', profileData);
		
		const existingProfile = await DoctorProfile.findOne({ userId });
		console.log('Existing profile:', existingProfile);
		
		if (existingProfile) {
			throw new Error('Doctor profile already exists');
		}

		const doctor = await DoctorProfile.create({
			userId,
			...profileData,
		});
		console.log('Created doctor profile:', doctor);

		return await DoctorProfile.findById(doctor._id)
			.populate('userId', 'name email')
			.select('-__v');
	} catch (error) {
		console.error('Error creating doctor profile:', error.message);
		throw new Error('Failed to create doctor profile');
	}
};

module.exports = {
	getAllDoctors,
	getDoctorById,
	getDoctorProfile,
	updateDoctorProfile,
	createDoctorProfile,
};
