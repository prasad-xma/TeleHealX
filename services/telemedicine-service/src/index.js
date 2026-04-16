const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const videoRoutes = require('./routes/videoRoutes');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();

const defaultAllowedOrigins = [
	'http://localhost:3000',
	'http://localhost:5173',
	'http://localhost:5174',
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
	credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api/telemedicine', videoRoutes);

app.get('/', (req, res) => {
	res.status(200).json({
		message: 'Telemedicine service running',
	});
});

const PORT = process.env.PORT || 5005;

app.listen(PORT, () => {
	console.log(`Telemedicine service running on port ${PORT}`);
});
