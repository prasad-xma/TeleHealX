const AppError = require("./appError");

const pad = (value) => String(value).padStart(2, "0");

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());

  return `${year}-${month}-${day}`;
};

const formatTime24 = (date) => {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const getDayNameFromDateKey = (dateKey) => {
  const date = new Date(`${dateKey}T00:00:00`);
  const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  return dayNames[date.getDay()];
};

const combineDateAndTime = (dateKey, time24) => {
  return new Date(`${dateKey}T${time24}:00`);
};

const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60 * 1000);
};

const differenceInMinutes = (startDate, endDate) => {
  return Math.floor((endDate.getTime() - startDate.getTime()) / (60 * 1000));
};

const isPastDateTime = (date) => {
  return date.getTime() < Date.now();
};

const validateDateKey = (dateKey) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;

  if (!regex.test(dateKey)) {
    throw new AppError("date must be in YYYY-MM-DD format", 400);
  }

  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw new AppError("Invalid date value", 400);
  }

  return true;
};

const validateTime24 = (time24, fieldName = "time") => {
  const regex = /^\d{2}:\d{2}$/;

  if (!regex.test(time24)) {
    throw new AppError(`${fieldName} must be in HH:MM format`, 400);
  }

  const [hours, minutes] = time24.split(":").map(Number);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new AppError(`${fieldName} has invalid time value`, 400);
  }

  return true;
};

module.exports = {
  formatDateKey,
  formatTime24,
  getDayNameFromDateKey,
  combineDateAndTime,
  addMinutes,
  differenceInMinutes,
  isPastDateTime,
  validateDateKey,
  validateTime24
};