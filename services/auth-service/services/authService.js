const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const DoctorApplication = require('../models/DoctorApplication');
const DoctorProfile = require('../models/DoctorProfile');
const { generateToken } = require('../utils/jwtUtils');

const register = async (payload) => {
	const {
		name,
		birthDay,
		gender,
		address,
		phone,
		email,
		password,
		role = 'patient',
		doctorInfo,
	} = payload;

	if (!name || !birthDay || !gender || !address || !phone || !email || !password) {
		throw new Error('Please fill all required fields');
	}

	if (!/^\+?[0-9]{7,15}$/.test(String(phone).trim())) {
		throw new Error('Phone number is invalid');
	}

	if (!['patient', 'doctor', 'admin'].includes(role)) {
		throw new Error('Invalid role');
	}

	const normalizedEmail = email.trim().toLowerCase();

	const existingUser = await User.findOne({ email: normalizedEmail });
	if (existingUser) {
		throw new Error('Email already exists');
	}

	if (role === 'doctor') {
		if (
			!doctorInfo ||
			!doctorInfo.specialization ||
			!doctorInfo.licenseNumber ||
			!doctorInfo.hospital ||
			doctorInfo.yearsOfExperience === undefined
		) {
			throw new Error('Doctor details are required');
		}
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const user = await User.create({
		name: name.trim(),
		birthDay,
		gender,
		address: address.trim(),
		phone,
		email: normalizedEmail,
		password: hashedPassword,
		role,
		isApproved: role === 'doctor' ? false : true,
	});

	if (role === 'doctor') {
		await DoctorApplication.create({
			user: user._id,
			specialization: doctorInfo.specialization.trim(),
			licenseNumber: doctorInfo.licenseNumber.trim(),
			hospital: doctorInfo.hospital.trim(),
			yearsOfExperience: doctorInfo.yearsOfExperience,
			status: 'pending',
		});

		await DoctorProfile.create({
			userId: user._id,
			specialization: doctorInfo.specialization,
			licenseNumber: doctorInfo.licenseNumber,
			hospital: doctorInfo.hospital,
			yearsOfExperience: doctorInfo.yearsOfExperience,
			consultationFee: doctorInfo.consultationFee || 0,
			bio: doctorInfo.bio || '',
			languages: doctorInfo.languages || [],
			isVerified: false,
		});
	}

	return {
		message:
			role === 'doctor'
				? 'Doctor registration submitted. Waiting for admin approval.'
				: 'Registration successful',
		user: {
			id: user._id,
			name: user.name,
			phone: user.phone,
			email: user.email,
			role: user.role,
			isApproved: user.isApproved,
		},
	};
};

const login = async (payload) => {
	const { email, password } = payload;

	if (!email || !password) {
		throw new Error('Email and password are required');
	}

	const normalizedEmail = email.trim().toLowerCase();

	const user = await User.findOne({ email: normalizedEmail });
	if (!user) {
		throw new Error('Invalid email or password');
	}

	const passwordMatch = await bcrypt.compare(password, user.password);
	if (!passwordMatch) {
		throw new Error('Invalid email or password');
	}

	if (user.role === 'doctor' && !user.isApproved) {
		throw new Error('Doctor account is waiting for admin approval');
	}

	const token = generateToken(user);

	return {
		message: 'Login successful',
		token,
		user: {
			id: user._id,
			name: user.name,
			phone: user.phone,
			email: user.email,
			role: user.role,
			isApproved: user.isApproved,
		},
	};
};

const logout = async () => {
	return {
		message: 'Logout successful',
	};
};

const getProfile = async (userId) => {
	const user = await User.findById(userId).select('-password');
	if (!user) {
		throw new Error('User not found');
	}
	return user;
};

const approveDoctor = async (userId) => {
	if (!mongoose.Types.ObjectId.isValid(userId)) {
		throw new Error('Invalid user id');
	}

	const user = await User.findById(userId);
	if (!user) {
		throw new Error('User not found');
	}

	if (user.role !== 'doctor') {
		throw new Error('This user is not a doctor');
	}

	const doctorApplication = await DoctorApplication.findOne({ user: user._id });
	if (!doctorApplication) {
		throw new Error('Doctor application not found');
	}

	user.isApproved = true;
	await user.save();

	await DoctorProfile.findOneAndUpdate(
		{ userId: user._id },
		{ isVerified: true }
	);

	await DoctorApplication.findOneAndUpdate(
		{ user: user._id },
		{ status: 'approved' }
	);

	return {
		message: 'Doctor approved successfully',
	};
};

const getPendingDoctorApplications = async () => {
	return await DoctorApplication.find({ status: 'pending' })
		.populate('user', 'name email role isApproved')
		.sort({ createdAt: -1 });
};

const getApprovedDoctors = async ({ name = '', limit = 5 }) => {
	const query = {
		role: 'doctor',
		isApproved: true,
	};

	if (name) {
		query.name = { $regex: name, $options: 'i' };
	}

	const doctors = await User.find(query)
		.select('name email role isApproved')
		.sort({ createdAt: -1 })
		.limit(Math.max(1, Math.min(Number(limit) || 5, 5)))
		.lean();

	return doctors.map((doctor) => ({
		_id: doctor._id,
		id: doctor._id,
		name: doctor.name,
		email: doctor.email,
		role: doctor.role,
		isApproved: doctor.isApproved,
	}));
};

module.exports = {
	register,
	login,
	logout,
	getProfile,
	approveDoctor,
	getPendingDoctorApplications,
	getApprovedDoctors,
};