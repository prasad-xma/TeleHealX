const availabilityService = require('../services/availabilityService');

const getDoctorAvailability = async (req, res) => {
	try {
		const { doctorId } = req.params;
		const { date } = req.query;
		const availability = await availabilityService.getDoctorAvailability(doctorId, date);
		return res.status(200).json(availability);
	} catch (error) {
		return res.status(404).json({ message: error.message });
	}
};

const getMyAvailability = async (req, res) => {
	try {
		const { date } = req.query;
		const availability = await availabilityService.getDoctorAvailability(req.user._id, date);
		return res.status(200).json(availability);
	} catch (error) {
		return res.status(404).json({ message: error.message });
	}
};

const setWeeklySchedule = async (req, res) => {
	try {
		const availability = await availabilityService.setWeeklySchedule(req.user._id, req.body);
		return res.status(200).json(availability);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

const addBlockedDate = async (req, res) => {
	try {
		const { date } = req.body;
		const availability = await availabilityService.addBlockedDate(req.user._id, date);
		return res.status(200).json(availability);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

const removeBlockedDate = async (req, res) => {
	try {
		const { date } = req.body;
		const availability = await availabilityService.removeBlockedDate(req.user._id, date);
		return res.status(200).json(availability);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

const updateSlotStatus = async (req, res) => {
	try {
		const { dayOfWeek, startTime, isBooked } = req.body;
		
		// For internal API, use doctorId from params
		const doctorId = req.params.doctorId || req.user._id;
		
		const availability = await availabilityService.updateSlotStatus(
			doctorId,
			dayOfWeek,
			startTime,
			isBooked
		);
		return res.status(200).json(availability);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

module.exports = {
	getDoctorAvailability,
	getMyAvailability,
	setWeeklySchedule,
	addBlockedDate,
	removeBlockedDate,
	updateSlotStatus,
};
