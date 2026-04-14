const authService = require('../services/authService');

const register = async (req, res) => {
	try {
		const data = await authService.register(req.body);
		return res.status(201).json(data);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

const login = async (req, res) => {
	try {
		const data = await authService.login(req.body);
		return res.status(200).json(data);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

const getMe = async (req, res) => {
	try {
		const user = await authService.getProfile(req.user._id);
		return res.status(200).json(user);
	} catch (error) {
		return res.status(404).json({ message: error.message });
	}
};

const approveDoctor = async (req, res) => {
	try {
		const data = await authService.approveDoctor(req.params.userId);
		return res.status(200).json(data);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

const getPendingDoctors = async (req, res) => {
	try {
		const data = await authService.getPendingDoctorApplications();
		return res.status(200).json(data);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

module.exports = {
	register,
	login,
	getMe,
	approveDoctor,
	getPendingDoctors,
};
