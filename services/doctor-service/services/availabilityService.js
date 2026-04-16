const DoctorAvailability = require('../models/DoctorAvailability');

const getDoctorAvailability = async (doctorId, date) => {
	try {
		console.log('Fetching availability for doctorId:', doctorId);
		let availability = await DoctorAvailability.findOne({ doctorId });
		console.log('Found availability:', availability);
		
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
		console.log('Setting weekly schedule for doctorId:', doctorId);
		console.log('Weekly schedule data:', JSON.stringify(weeklySchedule, null, 2));
		
		// Convert day-name format to array format
		const dayMap = {
			'Sunday': 0,
			'Monday': 1,
			'Tuesday': 2,
			'Wednesday': 3,
			'Thursday': 4,
			'Friday': 5,
			'Saturday': 6
		};

		// Check if data is in day-name format (nested weeklySchedule key)
		if (weeklySchedule.weeklySchedule) {
			// Check if it's already in array format (dayOfWeek numbers)
			if (Array.isArray(weeklySchedule.weeklySchedule) && weeklySchedule.weeklySchedule.length > 0 && typeof weeklySchedule.weeklySchedule[0].dayOfWeek === 'number') {
				weeklySchedule = weeklySchedule.weeklySchedule;
			} else {
				// Convert from day-name format
				const formattedSchedule = [];
				for (const [dayName, slots] of Object.entries(weeklySchedule.weeklySchedule)) {
					const dayOfWeek = dayMap[dayName];
					if (dayOfWeek !== undefined && slots && slots.length > 0) {
						formattedSchedule.push({
							dayOfWeek,
							slots: slots.map(slot => ({
								...slot,
								isBooked: slot.isBooked || false
							}))
						});
					}
				}
				weeklySchedule = formattedSchedule;
			}
		} else if (!Array.isArray(weeklySchedule)) {
			// If it's an object but doesn't have weeklySchedule key, try to convert it
			const formattedSchedule = [];
			for (const [dayName, slots] of Object.entries(weeklySchedule)) {
				const dayOfWeek = dayMap[dayName];
				if (dayOfWeek !== undefined && slots && slots.length > 0) {
					formattedSchedule.push({
						dayOfWeek,
						slots: slots.map(slot => ({
							...slot,
							isBooked: slot.isBooked || false
						}))
					});
				}
			}
			weeklySchedule = formattedSchedule;
		}
		// If it's already an array, use it directly (already in correct format)
		
		console.log('Formatted schedule:', JSON.stringify(weeklySchedule, null, 2));
		
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
			console.log('Existing blockedDates before save:', availability.blockedDates);
			availability.weeklySchedule = weeklySchedule;
			// Preserve existing blockedDates
			await availability.save();
			console.log('BlockedDates after save:', availability.blockedDates);
		} else {
			availability = await DoctorAvailability.create({
				doctorId,
				weeklySchedule,
				blockedDates: [],
			});
		}

		console.log('Weekly schedule set successfully');
		return availability;
	} catch (error) {
		console.error('Error setting weekly schedule:', error.message);
		throw new Error('Failed to set weekly schedule');
	}
};

const addBlockedDate = async (doctorId, date) => {
	try {
		console.log('Adding blocked date for doctorId:', doctorId);
		console.log('Date to block:', date);
		
		let availability = await DoctorAvailability.findOne({ doctorId });

		if (!availability) {
			console.log('Creating new availability document');
			availability = await DoctorAvailability.create({
				doctorId,
				weeklySchedule: [],
				blockedDates: [],
			});
		}

		console.log('Current blockedDates:', availability.blockedDates);
		
		const blockedDate = new Date(date);
		console.log('Parsed blocked date:', blockedDate);
		
		// Check if date is already blocked
		const isAlreadyBlocked = availability.blockedDates.some(existingDate => {
			const existing = new Date(existingDate);
			console.log('Comparing:', existing.toDateString(), 'with', blockedDate.toDateString());
			return existing.toDateString() === blockedDate.toDateString();
		});

		console.log('Is already blocked:', isAlreadyBlocked);

		if (!isAlreadyBlocked) {
			availability.blockedDates.push(blockedDate);
			await availability.save();
			console.log('Blocked dates after save:', availability.blockedDates);
		} else {
			console.log('Date already blocked, skipping');
		}

		return availability;
	} catch (error) {
		console.error('Error adding blocked date:', error.message);
		throw new Error('Failed to add blocked date');
	}
};

const removeBlockedDate = async (doctorId, date) => {
	try {
		console.log('Removing blocked date for doctorId:', doctorId);
		console.log('Date to remove:', date);
		
		let availability = await DoctorAvailability.findOne({ doctorId });

		if (!availability) {
			throw new Error('Doctor availability not found');
		}

		console.log('Current blockedDates:', availability.blockedDates);
		
		const blockedDate = new Date(date);
		console.log('Parsed blocked date:', blockedDate);
		
		// Remove the date from blockedDates
		const initialLength = availability.blockedDates.length;
		availability.blockedDates = availability.blockedDates.filter(existingDate => {
			const existing = new Date(existingDate);
			return existing.toDateString() !== blockedDate.toDateString();
		});

		console.log('Blocked dates after filter:', availability.blockedDates);
		console.log('Removed:', initialLength - availability.blockedDates.length, 'date(s)');
		
		await availability.save();
		console.log('Blocked dates after save:', availability.blockedDates);

		return availability;
	} catch (error) {
		console.error('Error removing blocked date:', error.message);
		throw new Error('Failed to remove blocked date');
	}
};

const updateSlotStatus = async (doctorId, dayOfWeek, startTime, isBooked) => {
	try {
		console.log('Updating slot status for doctorId:', doctorId);
		console.log('dayOfWeek:', dayOfWeek, 'startTime:', startTime, 'isBooked:', isBooked);
		
		const availability = await DoctorAvailability.findOne({ doctorId });

		if (!availability) {
			throw new Error('Doctor availability not found');
		}

		console.log('Found availability with weeklySchedule:', availability.weeklySchedule);

		const daySchedule = availability.weeklySchedule.find(
			schedule => schedule.dayOfWeek === dayOfWeek
		);

		console.log('Found daySchedule:', daySchedule);

		if (!daySchedule) {
			throw new Error('No schedule found for the given day');
		}

		const slot = daySchedule.slots.find(s => s.startTime === startTime);

		console.log('Found slot:', slot);

		if (!slot) {
			throw new Error('Slot not found');
		}

		slot.isBooked = isBooked;
		await availability.save();

		console.log('Slot status updated successfully');
		return availability;
	} catch (error) {
		console.error('Error updating slot status:', error.message);
		throw new Error('Failed to update slot status');
	}
};

module.exports = {
	getDoctorAvailability,
	setWeeklySchedule,
	addBlockedDate,
	removeBlockedDate,
	updateSlotStatus,
};
