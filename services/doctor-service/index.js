const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const doctorRoutes = require('./routes/doctorRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174'
];

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  : defaultAllowedOrigins;

const corsOptions = {
  origin(origin, callback) {
    
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api/doctors', doctorRoutes);
app.use('/api/doctors', availabilityRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Doctor Service running on port ${PORT}`)
});

module.exports = app;
