const bcrypt = require('bcryptjs');
const User = require('../models/User');
const DoctorApplication = require('../models/DoctorApplication');
const { generateToken } = require('../utils/jwtUtils');

const register = async (payload) => {
	const {
		name,
		birthDay,
		gender,
		address,
		email,
		password,
		role = 'patient',
		doctorInfo,
	} = payload;

	if (!name || !birthDay || !gender || !address || !email || !password) {
		throw new Error('Please fill all required fields');
	}

	if (role !== 'patient' && role !== 'doctor' && role !== 'admin') {
		throw new Error('Invalid role');
	}

	const existingUser = await User.findOne({ email });
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
		name,
		birthDay,
		gender,
		address,
		email,
		password: hashedPassword,
		role,
		isApproved: role === 'doctor' ? false : true,
	});

	if (role === 'doctor') {
		await DoctorApplication.create({
			user: user._id,
			specialization: doctorInfo.specialization,
			licenseNumber: doctorInfo.licenseNumber,
			hospital: doctorInfo.hospital,
			yearsOfExperience: doctorInfo.yearsOfExperience,
			status: 'pending',
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

	const user = await User.findOne({ email });
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
	const user = await User.findById(userId);
	if (!user) {
		throw new Error('User not found');
	}

	if (user.role !== 'doctor') {
		throw new Error('This user is not a doctor');
	}

	user.isApproved = true;
	await user.save();

	await DoctorApplication.findOneAndUpdate(
		{ user: user._id },
		{ status: 'approved' }
	);

	return {
		message: 'Doctor approved successfully',
	};
};

const getPendingDoctorApplications = async () => {
	return DoctorApplication.find({ status: 'pending' }).populate(
		'user',
		'name email role isApproved'
	);
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
