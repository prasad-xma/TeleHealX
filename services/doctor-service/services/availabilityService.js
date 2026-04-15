const DoctorAvailability = require('../models/DoctorAvailability');

const getDoctorAvailability = async (doctorId, date) => {
	try {
		let availability = await DoctorAvailability.findOne({ doctorId });
		
		if (!availability) {
			return {
				doctorId,
				weeklySchedule: [],
				blockedDates: [],
				availableSlots: [],
			};
		}

		let availableSlots = [];

		if (date) {
			const queryDate = new Date(date);
			const dayOfWeek = queryDate.getDay();

			// Check if date is blocked
			const isBlocked = availability.blockedDates.some(blockedDate => {
				const blocked = new Date(blockedDate);
				return blocked.toDateString() === queryDate.toDateString();
			});

			if (!isBlocked) {
				const daySchedule = availability.weeklySchedule.find(
					schedule => schedule.dayOfWeek === dayOfWeek
				);

				if (daySchedule) {
					availableSlots = daySchedule.slots
						.filter(slot => !slot.isBooked && slot.isAvailable)
						.map(slot => ({
							startTime: slot.startTime,
							endTime: slot.endTime,
						}));
				}
			}

			return {
				doctorId,
				date: queryDate,
				availableSlots,
				isBlocked,
			};
		}

		return availability;
	} catch (error) {
		throw new Error('Failed to fetch doctor availability');
	}
};

const setWeeklySchedule = async (doctorId, weeklySchedule) => {
	try {
		// Validate no overlapping slots
		for (const daySchedule of weeklySchedule) {
			const slots = daySchedule.slots || [];
			const sortedSlots = [...slots].sort((a, b) => {
				return a.startTime.localeCompare(b.startTime);
			});

			for (let i = 0; i < sortedSlots.length - 1; i++) {
				const currentEnd = sortedSlots[i].endTime;
				const nextStart = sortedSlots[i + 1].startTime;
				
				if (currentEnd > nextStart) {
					throw new Error(
						`Overlapping slots detected on day ${daySchedule.dayOfWeek}: ` +
						`${sortedSlots[i].startTime}-${currentEnd} overlaps with ${nextStart}-${sortedSlots[i + 1].endTime}`
					);
				}
			}
		}

		let availability = await DoctorAvailability.findOne({ doctorId });

		if (availability) {
			availability.weeklySchedule = weeklySchedule;
			await availability.save();
		} else {
			availability = await DoctorAvailability.create({
				doctorId,
				weeklySchedule,
			});
		}

		return availability;
	} catch (error) {
		throw new Error('Failed to set weekly schedule');
	}
};

const addBlockedDate = async (doctorId, date) => {
	try {
		let availability = await DoctorAvailability.findOne({ doctorId });

		if (!availability) {
			availability = await DoctorAvailability.create({
				doctorId,
				weeklySchedule: [],
				blockedDates: [],
			});
		}

		const blockedDate = new Date(date);
		
		// Check if date is already blocked
		const isAlreadyBlocked = availability.blockedDates.some(blockedDate => {
			return new Date(blockedDate).toDateString() === blockedDate.toDateString();
		});

		if (!isAlreadyBlocked) {
			availability.blockedDates.push(blockedDate);
			await availability.save();
		}

		return availability;
	} catch (error) {
		throw new Error('Failed to add blocked date');
	}
};

const updateSlotStatus = async (doctorId, dayOfWeek, startTime, isBooked) => {
	try {
		const availability = await DoctorAvailability.findOne({ doctorId });

		if (!availability) {
			throw new Error('Doctor availability not found');
		}

		const daySchedule = availability.weeklySchedule.find(
			schedule => schedule.dayOfWeek === dayOfWeek
		);

		if (!daySchedule) {
			throw new Error('No schedule found for the given day');
		}

		const slot = daySchedule.slots.find(s => s.startTime === startTime);

		if (!slot) {
			throw new Error('Slot not found');
		}

		slot.isBooked = isBooked;
		await availability.save();

		return availability;
	} catch (error) {
		throw new Error('Failed to update slot status');
	}
};

module.exports = {
	getDoctorAvailability,
	setWeeklySchedule,
	addBlockedDate,
	updateSlotStatus,
};
