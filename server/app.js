const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const authRoutes        = require('./routes/authRoutes');
const patientRoutes     = require('./routes/patientRoutes');
const ehrRoutes         = require('./routes/ehrRoutes');
const labRoutes         = require('./routes/labRoutes');
const adminRoutes       = require('./routes/adminRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',         authRoutes);
app.use('/api/patients',     patientRoutes);
app.use('/api/ehr',          ehrRoutes);
app.use('/api/lab',          labRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/appointments', appointmentRoutes);

app.get('/', (req, res) => {
  res.json({ message: "Mavaji's Hospital Zero Trust API is Online", status: 'OK', time: new Date() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', time: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});