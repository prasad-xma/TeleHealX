const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const aiRoutes = require('./route/aiRoutes');

dotenv.config();
connectDB();

const app = express();

const defaultAllowedOrigins = [
	'http://localhost:3000',
	'http://localhost:5173',
	'http://localhost:5174',
];

const allowedOrigins = process.env.CORS_ORIGINS
	? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
	: defaultAllowedOrigins;

app.use(
	cors({
		origin(origin, callback) {
			if (!origin || allowedOrigins.includes(origin)) {
				return callback(null, true);
			}

			return callback(new Error('Not allowed by CORS'));
		},
		credentials: true,
	})
);
app.use(express.json());
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
	res.send('AI service running...');
});

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
	console.log(`AI service running on port ${PORT}`);
});
