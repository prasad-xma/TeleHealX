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

const logout = async (req, res) => {
	try {
		const data = await authService.logout();
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

const getApprovedDoctors = async (req, res) => {
	try {
		const { name = '', limit = 5 } = req.query;
		const data = await authService.getApprovedDoctors({ name, limit });
		return res.status(200).json(data);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

const getDoctorById = async (req, res) => {
  console.log('📨 [AUTH CONTROLLER] Received getDoctorById request:', req.params);

  try {
    const { doctorId } = req.params;
    const data = await authService.getDoctorById(doctorId);

    console.log('✅ [AUTH CONTROLLER] Doctor data retrieved successfully');
    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ [AUTH CONTROLLER] Error fetching doctor:', error.message);
    return res.status(404).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  console.log('📨 [AUTH CONTROLLER] Received getUserById request:', req.params);

  try {
    const { userId } = req.params;
    const data = await authService.getUserById(userId);

    console.log('✅ [AUTH CONTROLLER] User data retrieved successfully');
    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ [AUTH CONTROLLER] Error fetching user:', error.message);
    return res.status(404).json({ message: error.message });
  }
};

module.exports = {
	register,
	login,
	logout,
	getMe,
	approveDoctor,
	getPendingDoctors,
	getApprovedDoctors,
	getDoctorById,
	getUserById,
};
};
